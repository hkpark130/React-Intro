import process from 'node:process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { resolveRuntimeConfig, createSpringClient, fetchBlogPost } from './runtime.js';
import { renderBlogPage, validateOrigin, validatePostId, escapeHtml } from './markdown/renderBlog.js';
import { createAuthoringGate } from './authoring.js';
import { createRenderCache } from './renderCache.js';

export function createApp(config = resolveRuntimeConfig(process.env)) {
  const app = express();
  const springClient = createSpringClient(config);
  const renderCache = createRenderCache();
  const postRequests = new Map();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  if (config.editorial) {
    app.use(['/notion', '/seo'], (_req, res) => res.status(503).json({ message: 'External metadata and Notion requests are disabled in editorial mode' }));
  }
  app.use(express.json({ limit: '1mb' }));
  const siteOrigin = req => config.siteOrigin || validateOrigin(req.protocol + '://' + req.get('host'));

  // The same-origin proxy keeps the browser/API boundary simple. Spring verifies
  // author permissions; Notion credentials only come from the server environment.
  let notionRouter;
  app.use('/notion', createAuthoringGate(config, springClient), async (req, res, next) => {
    try {
      notionRouter ||= import('./notionRoutes.js').then(module => module.createNotionRouter(config));
      const router = await notionRouter;
      if (!req.notionContext.signal.aborted) router(req, res, next);
    } catch { if (!res.headersSent) res.status(503).json({ message: 'Notion 가져오기를 시작할 수 없습니다.' }); }
  });

  app.get('/blog/:id', async (req, res) => {
    let id;
    try { id = validatePostId(req.params.id); } catch { return res.status(400).json({ message: 'Invalid post ID' }); }
    try {
      let pending = postRequests.get(id);
      if (!pending) {
        if (postRequests.size >= 8) return res.status(503).set('Retry-After', '1').json({ message: 'Blog SSR busy' });
        pending = fetchBlogPost(springClient, id).finally(() => postRequests.delete(id));
        postRequests.set(id, pending);
      }
      const post = await pending;
      const html = renderCache.render(post, { id, siteOrigin: siteOrigin(req) }, renderBlogPage);
      res.status(200).type('html').send(html);
    } catch (error) {
      res.status(error?.response?.status === 404 ? 404 : 502).json({ message: 'Blog SSR unavailable' });
    }
  });

  app.get('/robots.txt', (req, res) => {
    try { res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: ' + siteOrigin(req) + '/sitemap.xml\n'); }
    catch { res.status(400).type('text/plain').send('Invalid site origin'); }
  });

  let sitemapCache = { origin: '', xml: '', time: 0 };
  let sitemapRequest;
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const origin = siteOrigin(req);
      if (sitemapCache.origin === origin && Date.now() - sitemapCache.time < 60000) return res.type('application/xml').send(sitemapCache.xml);
      sitemapRequest ||= springClient.get('/api/posts/sitemap/all').finally(() => { sitemapRequest = undefined; });
      const { data: posts } = await sitemapRequest;
      if (!Array.isArray(posts) || posts.length > 10000) throw new Error('Invalid sitemap response');
      const urls = posts.map(post => {
        const id = validatePostId(post.id);
        const modified = post.updatedAt || post.createdAt;
        const lastmod = modified && Number.isFinite(Date.parse(modified)) ? '<lastmod>' + new Date(modified).toISOString() + '</lastmod>' : '';
        return '<url><loc>' + escapeHtml(origin + '/blog/' + id) + '</loc>' + lastmod + '</url>';
      }).join('');
      const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + escapeHtml(origin + '/') + '</loc></url>' + urls + '</urlset>';
      sitemapCache = { origin, xml, time: Date.now() };
      res.type('application/xml').send(xml);
    } catch {
      // An API failure must not fan out into full-content crawling.
      res.status(502).type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  });

  // Compatibility for old link cards: no HTTP/DNS requests are made.
  app.get('/seo/preview', (req, res) => {
    try {
      const source = req.query.url;
      if (typeof source !== 'string' || source.length > 2048) throw new Error('Invalid URL');
      const url = new URL(source);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid URL');
      res.json({ ok: true, url: url.href, title: url.hostname, description: '', image: '', siteName: url.hostname, source: 'url' });
    } catch { res.status(400).json({ message: '올바른 HTTP 또는 HTTPS 링크를 입력해 주세요.' }); }
  });
  app.post('/seo/ping', (_req, res) => res.status(410).json({ message: 'Sitemap ping is not used. The sitemap remains available at /sitemap.xml.' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    const status = error.status === 413 ? 413 : error.status === 400 ? 400 : 500;
    res.status(status).json({ message: status === 413 ? '요청 내용이 너무 큽니다.' : status === 400 ? '요청 형식을 확인해 주세요.' : '요청을 처리하지 못했습니다.' });
  });
  return app;
}

// Importing the app for tests never opens a listener.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const config = resolveRuntimeConfig({ ...process.env, SSR_MODE: process.argv.includes('--editorial') ? 'editorial' : process.env.SSR_MODE });
  createApp(config).listen(config.port, config.host, () => {
    console.log('[notion-ssr] listening on port ' + config.port + (config.editorial ? ' (loopback editorial)' : ''));
  });
}
