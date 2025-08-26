import express from 'express';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import axios from 'axios';
import { marked } from 'marked';
import { NotionRenderer } from '@notion-render/client';
import hljsPlugin from '@notion-render/hljs-plugin';
import bookmarkPlugin from '@notion-render/bookmark-plugin';

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));

// Configure marked: treat single newlines as <br> (hard breaks)
marked.setOptions({
  gfm: true,
  breaks: true
});

// Env
const PORT = process.env.PORT || 3000;
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const SPRING_BASE = process.env.SPRING_BASE || 'http://backend-spring-app:8100';

if (!NOTION_API_KEY) {
  console.warn('[notion-ssr] NOTION_API_KEY is not set. /notion endpoints will fail until provided.');
}

// Resolve API key per-request: header > body > query > env
function getApiKeyFromReq(req) {
  const headerKey = req.get('x-notion-api-key');
  const bodyKey = req.body && (req.body.apiKey || req.body.notionKey);
  const queryKey = req.query && (req.query.apiKey || req.query.notionKey);
  return (headerKey || bodyKey || queryKey || NOTION_API_KEY);
}

// Build Notion tools (client + markdown converter) for a given key
function buildNotionTools(apiKey) {
  const notion = new Client({ auth: apiKey });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  return { notion, n2m };
}

// Escape attribute values for safe inline HTML
function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Apply custom transformer to a NotionToMarkdown instance
function setupCustomTransformers(n2m) {
  try {
    n2m.setCustomTransformer('bookmark', async (block) => {
      const url = block?.bookmark?.url || '';
      const caption = Array.isArray(block?.bookmark?.caption)
        ? block.bookmark.caption.map(t => t?.plain_text || '').join('')
        : '';
      // Keep attributes minimal; client Bookmark will enrich via /seo/preview
      return `<Bookmark url="${escapeAttr(url)}" description="${escapeAttr(caption)}" />`;
    });

    // Preserve explicit blank spacing: if a Notion paragraph has no text,
    // emit a hard break so spacing is visible after MD->HTML conversion.
    n2m.setCustomTransformer('paragraph', async (block) => {
      try {
        const rt = block?.paragraph?.rich_text || [];
        const combined = rt.map(t => (t?.plain_text ?? '')).join('');
        if (!combined || combined.trim().length === 0) {
          return '<br />';
        }
        // non-empty: fall back to default handling
        return undefined;
      } catch (_) {
        return undefined;
      }
    });
  } catch (e) {
    console.warn('[notion-ssr] failed to set custom transformer for bookmark', e?.message || e);
  }
}

// Normalize Notion code block languages for highlight.js compatibility
function normalizeCodeLanguage(lang) {
  if (!lang) return 'plaintext';
  const lower = String(lang).toLowerCase();
  if (lower === 'plain text' || lower === 'plain-text' || lower === 'text' || lower === 'txt') return 'plaintext';
  return lower;
}

function normalizeBlocks(blocks = []) {
  return (blocks || []).map((b) => {
    try {
      if (b && b.type === 'code' && b.code) {
        const lang = b.code.language;
        const norm = normalizeCodeLanguage(lang);
        if (norm !== lang) {
          return { ...b, code: { ...b.code, language: norm } };
        }
      }
    } catch (_) { }
    return b;
  });
}

// Fetch all blocks with pagination for a given block/page id
async function fetchAllBlocks(notion, blockId) {
  const results = [];
  let start_cursor = undefined;
  while (true) {
    const params = { block_id: blockId, page_size: 1000 };
    if (start_cursor) params.start_cursor = start_cursor;
    const resp = await notion.blocks.children.list(params);
    if (Array.isArray(resp.results)) results.push(...resp.results);
    if (resp.has_more && resp.next_cursor) {
      start_cursor = resp.next_cursor;
    } else {
      break;
    }
  }
  return results;
}

// Build renderer with optional bookmark plugin
function buildRenderer(notion, { withBookmark = true } = {}) {
  const renderer = new NotionRenderer({ client: notion });
  renderer.use(hljsPlugin({}));
  if (withBookmark) {
    try {
      renderer.use(bookmarkPlugin(undefined));
    } catch (e) {
      // ignore plugin registration errors
      console.warn('[notion-ssr] bookmark plugin setup failed, continuing without');
    }
  }
  return renderer;
}

// Safely render blocks: try with bookmark plugin, fallback without on fetch errors
async function safeRenderHtml(notion, blocks) {
  const normalized = normalizeBlocks(blocks);
  try {
    const renderer = buildRenderer(notion, { withBookmark: process.env.SSR_NOTION_DISABLE_BOOKMARK !== '1' });
    return await renderer.render(...normalized);
  } catch (err) {
    const msg = (err && err.message) || '';
    if (/fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/i.test(msg)) {
      console.warn('[notion-ssr] bookmark render failed, retrying without bookmark plugin');
      const renderer = buildRenderer(notion, { withBookmark: false });
      return await renderer.render(...normalized);
    }
    throw err;
  }
}

// Helper: fetch post from Spring for blog SSR
async function fetchPostFromSpring(id) {
  const url = `${SPRING_BASE}/api/posts/${id}`;
  const { data } = await axios.get(url, { timeout: 8000 });
  return data;
}

// GET /blog/:id -> SSR basic HTML with meta tags for SEO
app.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await fetchPostFromSpring(id);

    const title = post?.title || 'Blog';
    const description = (post?.content || '').replace(/[#*_`>\-]/g, '').slice(0, 160);
    const createdAt = post?.createdAt || '';
    const updatedAt = post?.updatedAt || createdAt || '';
    const cover = post?.coverImage || '';

    // Render markdown content server-side to HTML for bots (simple rendering)
    const contentHtml = marked.parse(post?.content || '');

    const siteOrigin = `${(req.headers['x-forwarded-proto'] || req.protocol)}://${req.get('host')}`;
    const canonical = `${siteOrigin}${req.originalUrl}`;

    // JSON-LD Article schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      datePublished: createdAt || undefined,
      dateModified: updatedAt || undefined,
      image: cover || undefined,
      mainEntityOfPage: canonical,
      author: { '@type': 'Person', name: 'Admin' }
    };

    const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
  ${cover ? `<meta property=\"og:image\" content=\"${cover}\" />` : ''}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      ${cover ? `<meta name=\"twitter:image\" content=\"${cover}\" />` : ''}
  <meta property="article:published_time" content="${createdAt}" />
  <meta property="article:modified_time" content="${updatedAt}" />
  <link rel="canonical" href="${canonical}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; max-width: 860px; margin: 24px auto; padding: 0 16px; }
    img { max-width: 100%; height: auto; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    table { width: 100%; display: block; overflow-x: auto; }
  </style>
</head>
<body>
  <article>
    <h1>${title}</h1>
    <div>${contentHtml}</div>
  </article>
  <!-- Served as SSR HTML for all traffic on /blog/:id -->
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('[notion-ssr] SSR error', err?.response?.data || err.message);
    res.status(500).json({ message: 'SSR failed' });
  }
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  const host = req.get('host');
  const scheme = (req.headers['x-forwarded-proto'] || req.protocol);
  res.type('text/plain').send(
    `User-agent: *
Allow: /
Sitemap: ${scheme}://${host}/sitemap.xml
`);
});

// sitemap.xml (paginate all posts; small in-memory cache)
let sitemapCache = { xml: null, ts: 0 };
const SITEMAP_TTL_MS = parseInt(process.env.SITEMAP_TTL_MS || '600000', 10); // default 10m

app.get('/sitemap.xml', async (req, res) => {
  try {
    // serve from cache if fresh
    if (sitemapCache.xml && Date.now() - sitemapCache.ts < SITEMAP_TTL_MS) {
      return res.type('application/xml').send(sitemapCache.xml);
    }

    const scheme = (req.headers['x-forwarded-proto'] || req.protocol);
    const host = req.get('host');
    const base = `${scheme}://${host}`;

    // Try new Spring endpoint that returns all posts for sitemap (lightweight)
    let posts = [];
    try {
      const { data } = await axios.get(`${SPRING_BASE}/api/posts/sitemap/all`, { timeout: 15000 });
      if (Array.isArray(data)) {
        posts = data;
      }
    } catch (_) {
      // Fallback to pagination if endpoint not available
      const limit = 200; // page size per request
      let offset = 0;
      const aggregated = [];
      const maxPages = 1000; // safety cap (up to 200k posts)
      for (let i = 0; i < maxPages; i++) {
        const { data } = await axios.get(`${SPRING_BASE}/api/posts?offset=${offset}&limit=${limit}`, { timeout: 8000 });
        const chunk = (data && (data.posts || data)) || [];
        if (!Array.isArray(chunk) || chunk.length === 0) break;
        aggregated.push(...chunk);
        if (chunk.length < limit) break; // last page
        offset += limit;
      }
      posts = aggregated;
    }

    const urls = posts.map(p => {
      const loc = `${base}/blog/${p.id}`;
      const lastmodRaw = p.updatedAt || p.createdAt;
      let lastmodIso;
      try { lastmodIso = new Date(lastmodRaw || Date.now()).toISOString(); } catch (_) { lastmodIso = new Date().toISOString(); }
      return `<url><loc>${loc}</loc><lastmod>${lastmodIso}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>
  ${urls}
</urlset>`;

    // cache and send
    sitemapCache = { xml, ts: Date.now() };
    res.type('application/xml').send(xml);
  } catch (err) {
    console.error('[notion-ssr] sitemap error', err?.response?.data || err.message);
    res.status(500).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
  }
});

// POST /notion/convert { pageId } -> { markdown, html }
app.post('/notion/convert', async (req, res) => {
  try {
    const { pageId } = req.body || {};
    if (!pageId) {
      return res.status(400).json({ message: 'pageId is required' });
    }

    const apiKey = getApiKeyFromReq(req);
    const { notion, n2m } = buildNotionTools(apiKey);
    setupCustomTransformers(n2m);

    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);

    const markdown = mdString.parent || '';
    const html = marked.parse(markdown);

    res.json({ markdown, html });
  } catch (err) {
    console.error('[notion-ssr] convert error', err?.response?.data || err.message);
    res.status(500).json({ message: 'convert failed' });
  }
});

// Very small HTML meta extractor for OGP/Twitter tags
function extractMeta(html = '', baseUrl = '') {
  const decodeEntities = (s) => {
    if (!s) return '';
    // numeric entities: decimal and hex
    let out = String(s).replace(/&#(x?)([0-9a-fA-F]+);/g, (m, isHex, code) => {
      try {
        const cp = parseInt(code, isHex ? 16 : 10);
        if (!isFinite(cp)) return m;
        return String.fromCodePoint(cp);
      } catch (_) { return m; }
    });
    // minimal named entities support
    const map = {
      amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00A0',
      mdash: '\u2014', ndash: '\u2013', hellip: '\u2026', copy: '\u00A9', reg: '\u00AE'
    };
    out = out.replace(/&([a-zA-Z]+);/g, (m, name) => map[name] || m);
    return out;
  };
  const pick = (regex) => {
    const m = html.match(regex);
    return m ? m[1].trim() : '';
  };
  const title = decodeEntities(pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || pick(/<title[^>]*>([^<]*)<\/title>/i));
  const description = decodeEntities(pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || pick(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i));
  let image = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
    || pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i);
  const siteName = decodeEntities(pick(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i));

  // Resolve relative image URLs
  try {
    if (image) {
      const u = new URL(image, baseUrl);
      image = u.toString();
    }
  } catch (_) { }

  return { title, description, image, siteName };
}

// GET /seo/preview?url=https://...
app.get('/seo/preview', async (req, res) => {
  try {
    const url = req.query?.url;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'url is required' });
    }
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ message: 'only http(s) supported' });
    }

    const resp = await axios.get(url, {
      timeout: 6000,
      // Simple UA to improve chances of OGP
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NotionSSRBot/1.0)' }
    });

    const { title, description, image, siteName } = extractMeta(String(resp.data || ''), url);
    return res.json({
      ok: true,
      url,
      title,
      description,
      image,
      siteName
    });
  } catch (err) {
    console.warn('[notion-ssr] seo/preview error:', err?.message || err);
    return res.status(500).json({ ok: false, message: 'preview failed' });
  }
});

// GET /notion/page/:pageId -> metadata (title, created/updated, cover)
app.get('/notion/page/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    const page = await notion.pages.retrieve({ page_id: pageId });

    // cover
    let coverImage = null;
    if (page.cover) {
      if (page.cover.type === 'external') coverImage = page.cover.external?.url || null;
      if (page.cover.type === 'file') coverImage = page.cover.file?.url || null;
    }

    // title (common property name guess: "Name")
    let title = null;
    const props = page.properties || {};
    const titleProp = Object.values(props).find(p => p?.type === 'title');
    if (titleProp?.title?.length) {
      title = titleProp.title.map(t => t.plain_text).join('');
    }

    res.json({
      id: page.id,
      title,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      coverImage
    });
  } catch (err) {
    console.error('[notion-ssr] page meta error', err?.response?.data || err.message);
    if (err.status === 404) return res.status(404).json({ message: 'page not found' });
    res.status(500).json({ message: 'page meta failed' });
  }
});

app.post('/notion/fetchPages', async (req, res) => {
  try {
    const { databaseId } = req.body || process.env.NOTION_DB;
    if (!databaseId) {
      return res.status(400).json({ message: 'databaseId is required' });
    }
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    const response = await notion.databases.query({ database_id: databaseId });
    res.json(response);
  } catch (err) {
    console.error('[notion-ssr] fetchPages error', err?.response?.data || err.message);
    res.status(500).json({ message: 'fetchPages failed' });
  }
});

// fetchPageBlocks
app.post('/notion/fetchPageBlocks', async (req, res) => {
  try {
    const { pageId } = req.body || {};
    if (!pageId) {
      return res.status(400).json({ message: 'pageId is required' });
    }
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    const response = await notion.blocks.children.list({ block_id: pageId });
    res.json(response);
  } catch (err) {
    console.error('[notion-ssr] fetchPageBlocks error', err?.response?.data || err.message);
    res.status(500).json({ message: 'fetchPageBlocks failed' });
  }
});

// blocks 를 html로 렌더
app.post('/notion/blocksToHtml', async (req, res) => {
  try {
    const { blocks } = req.body || {};
    if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
      return res.status(400).json({ message: 'blocks (non-empty array) is required' });
    }
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    const html = await safeRenderHtml(notion, blocks);
    return res.json({ html });
  } catch (err) {
    console.error('[notion-ssr] blocksToHtml error', err?.response?.data || err.message);
    res.status(500).json({ message: 'blocksToHtml failed' });
  }
});

// Convenience: render a whole Notion page by ID (server-side) to HTML string
app.get('/notion/render/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    // fetch all children blocks for the page and render
    const allBlocks = await fetchAllBlocks(notion, pageId);
    const html = await safeRenderHtml(notion, allBlocks);
    res.json({ html });
  } catch (err) {
    console.error('[notion-ssr] render page error', err?.response?.data || err?.body || err.message, { code: err?.code, status: err?.status });
    res.status(500).json({ message: 'render page failed', detail: err?.message || 'unknown error' });
  }
});

// 데이터베이스 내 페이지들을 렌더링하여 HTML과 메타를 반환
// GET /notion/render-db/:databaseId?pageSize=10&startCursor=...
app.get('/notion/render-db/:databaseId', async (req, res) => {
  try {
    const { databaseId } = req.params;
    if (!databaseId) return res.status(400).json({ message: 'databaseId is required' });

    const pageSize = Math.max(1, Math.min(parseInt(req.query.pageSize) || 10, 20));
    const startCursor = req.query.startCursor;

    const query = { database_id: databaseId, page_size: pageSize };
    if (startCursor) query.start_cursor = startCursor;
    const apiKey = getApiKeyFromReq(req);
    const { notion } = buildNotionTools(apiKey);
    const dbResp = await notion.databases.query(query);
    const pages = dbResp.results || [];

    const renderer = null; // not used directly; use safeRenderHtml instead

    const items = await Promise.all(pages.map(async (page) => {
      // title
      let title = null;
      const props = page.properties || {};
      const titleProp = Object.values(props).find(p => p?.type === 'title');
      if (titleProp?.title?.length) {
        title = titleProp.title.map(t => t.plain_text).join('');
      }

      // cover
      let coverImage = null;
      if (page.cover) {
        if (page.cover.type === 'external') coverImage = page.cover.external?.url || null;
        if (page.cover.type === 'file') coverImage = page.cover.file?.url || null;
      }

      // render blocks
      const allBlocks = await fetchAllBlocks(notion, page.id);
      const html = await safeRenderHtml(notion, allBlocks);

      return {
        id: page.id,
        title,
        createdTime: page.created_time,
        lastEditedTime: page.last_edited_time,
        coverImage,
        html
      };
    }));

    res.json({
      results: items,
      hasMore: dbResp.has_more,
      nextCursor: dbResp.next_cursor || null
    });
  } catch (err) {
    console.error('[notion-ssr] render-db error', err?.response?.data || err.message);
    res.status(500).json({ message: 'render database failed' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Google HTML verification disabled; use DNS TXT verification in Search Console

// Simple ping endpoint that pings search engines to re-fetch the sitemap
app.post('/seo/ping', async (req, res) => {
  try {
    const host = req.get('host');
    const scheme = (req.headers['x-forwarded-proto'] || req.protocol);
    const sitemapUrl = encodeURIComponent(`${scheme}://${host}/sitemap.xml`);
    const agents = [
      `https://www.google.com/ping?sitemap=${sitemapUrl}`,
      `https://www.bing.com/ping?sitemap=${sitemapUrl}`
    ];
    await Promise.allSettled(agents.map(u => axios.get(u, { timeout: 4000 })));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`[notion-ssr] listening on :${PORT}`);
});
