import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { parseFragment, serialize } from 'parse5';
import GithubSlugger from 'github-slugger';
import { prepareMarkdown, parseAttributes } from './prepareMarkdown.js';
import { sanitizeMarkdownUrl } from './urlPolicy.js';
import { markdownTags, markdownAttributes, languageClassPattern, tableAlignmentPattern, normalizeMarkdownAttributes } from './htmlPolicy.js';
import { markdownColorCss } from './colorPolicy.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

export function validatePostId(value) {
  if (!/^[1-9]\d*$/.test(String(value))) throw new Error('Invalid post ID');
  return String(value);
}

export function validateOrigin(value, loopback = false) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Invalid HTTP origin'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
      || url.pathname !== '/' || url.search || url.hash
      || (loopback && (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)))) {
    throw new Error(loopback ? 'Expected a loopback HTTP origin' : 'Invalid HTTP origin');
  }
  return url.origin;
}

const allowed = {
  allowedTags: markdownTags,
  allowedAttributes: markdownAttributes,
  allowedStyles: { '*': { 'text-align': [tableAlignmentPattern] } },
  allowedClasses: { code: [languageClassPattern] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'], video: ['http', 'https'], source: ['http', 'https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'poster'], allowProtocolRelative: false,
  transformTags: {
    '*': (tagName, attrs) => ({
      tagName,
      attribs: Object.fromEntries(Object.entries(normalizeMarkdownAttributes(tagName, attrs)).map(([name, value]) => [name, value === true ? '' : value])),
    }),
  },
};

function renderComponent(component) {
  const attrs = parseAttributes(component.attributes);
  switch (component.tagName.toLowerCase()) {
    case 'codeaccordion': {
      const expanded = ['true', '1', 'yes', 'on', 'open'].includes(String(attrs.defaultexpanded ?? '').trim().toLowerCase());
      const code = `<pre><code>${escapeHtml(component.content.replace(/^\n+|\n+$/g, ''))}</code></pre>`;
      return `<details${expanded ? ' open' : ''}><summary>${escapeHtml(attrs.title || '코드 살펴보기')}</summary>${code}</details>`;
    }
    case 'literalcode': return `<pre><code>${escapeHtml(component.content)}</code></pre>`;
    case 'inlinecode': return `<code>${escapeHtml(component.content)}</code>`;
    case 'zoomableimagemodal': {
      const src = sanitizeMarkdownUrl(attrs.src, { kind: 'media' });
      return `<figure>${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(attrs.alt || '')}" loading="lazy">` : `<span>${escapeHtml(attrs.alt || '')}</span>`}${attrs.caption ? `<figcaption>${escapeHtml(attrs.caption)}</figcaption>` : ''}</figure>`;
    }
    case 'bookmark': {
      const url = sanitizeMarkdownUrl(attrs.url);
      const label = escapeHtml(attrs.title || attrs.url || 'Bookmark');
      return `<div>${url ? `<a href="${escapeHtml(url)}">${label}</a>` : label}${attrs.description ? `<p>${escapeHtml(attrs.description)}</p>` : ''}</div>`;
    }
    case 'alert':
    case 'alertblock': {
      const requestedSeverity = String(attrs.severity || '').toLowerCase();
      const severity = ['info', 'warning', 'error'].includes(requestedSeverity) ? requestedSeverity : 'info';
      return `<aside role="note" data-severity="${severity}">${renderBlogContent(component.content)}</aside>`;
    }
    default: return '';
  }
}

/** Pure rendering: no metadata fetch, DOM execution, credentials or network. */
export function renderBlogContent(content) {
  return serialize(renderContentDocument(content));
}

function renderContentDocument(content) {
  const prepared = prepareMarkdown(content);
  const components = new Map(prepared.components.map(component => [component.id, component]));
  const html = marked.parse(prepared.text, { gfm: true, breaks: true }).replace(
    /<(div|span) data-custom-placeholder="([^"]+)"><\/\1>/g,
    (placeholder, tag, id) => components.has(id) ? renderComponent(components.get(id)) : placeholder,
  );
  return addHeadingIds(parseFragment(sanitizeHtml(html, allowed)));
}

function addHeadingIds(doc) {
  const slugger = new GithubSlugger();
  // Match rehype-slug: concatenate descendant text, skip explicit IDs, and
  // count duplicate generated slugs separately for each Markdown render.
  const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
  const walk = node => {
    if (/^h[1-6]$/.test(node.tagName || '') && !node.attrs.some(attr => attr.name === 'id' && attr.value)) {
      node.attrs = node.attrs.filter(attr => attr.name !== 'id');
      node.attrs.push({ name: 'id', value: slugger.slug(text(node)) });
    }
    node.childNodes?.forEach(walk);
  };
  walk(doc);
  return doc;
}

function plainText(doc) {
  const walk = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(walk).join(node.tagName === 'p' ? '' : ' ');
  return walk(doc).replace(/\s+/g, ' ').trim();
}

export function renderBlogPage(post, { id, siteOrigin }) {
  const canonical = `${validateOrigin(siteOrigin)}/blog/${validatePostId(id)}`;
  const title = String(post?.title || 'Blog');
  const contentDocument = renderContentDocument(post?.content || '');
  const contentHtml = serialize(contentDocument);
  const description = plainText(contentDocument).slice(0, 160);
  const createdAt = post?.createdAt || '';
  const updatedAt = post?.updatedAt || createdAt;
  const cover = sanitizeMarkdownUrl(post?.coverImage, { kind: 'media' });
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: title, description,
    datePublished: createdAt || undefined, dateModified: updatedAt || undefined,
    image: cover || undefined, mainEntityOfPage: canonical,
    author: { '@type': 'Person', name: String(post?.author || 'Admin') },
  }).replace(/</g, '\\u003c');
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}">`;
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${meta('description', description)}${meta('og:type', 'article', true)}${meta('og:url', canonical, true)}${meta('og:title', title, true)}${meta('og:description', description, true)}
${meta('twitter:card', cover ? 'summary_large_image' : 'summary')}${meta('twitter:title', title)}${meta('twitter:description', description)}
${cover ? meta('og:image', cover, true) + meta('twitter:image', cover) : ''}
${meta('article:published_time', createdAt, true)}${meta('article:modified_time', updatedAt, true)}
<link rel="canonical" href="${escapeHtml(canonical)}"><script type="application/ld+json">${jsonLd}</script>
<style>body{font-family:system-ui,sans-serif;max-width:860px;margin:24px auto;padding:0 16px;line-height:1.8;overflow-wrap:anywhere}img,video{max-width:100%;height:auto}pre{overflow-x:auto;white-space:pre;line-height:1.6;padding:16px;background:#f5f6f8}pre code{overflow-wrap:normal}table{display:block;overflow-x:auto;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd}aside,blockquote{margin:20px 0;padding:8px 16px;border-left:3px solid #1976d2}h1{line-height:1.35}summary{cursor:pointer}${markdownColorCss()}</style>
</head><body><article><h1>${escapeHtml(title)}</h1>${contentHtml}</article></body></html>`;
}
