import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFragment, parse } from 'parse5';
import { renderBlogContent, renderBlogPage } from '../src/markdown/renderBlog.js';

const descendants = (node, tag) => (node.childNodes || []).flatMap(child => [
  ...(child.tagName === tag ? [child] : []), ...descendants(child, tag),
]);
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const attr = (node, name) => node?.attrs?.find(item => item.name === name)?.value;
const page = overrides => renderBlogPage({ id: 112, title: 'Example', content: 'Experience summary', createdAt: '2026-07-22T00:00:00', ...overrides }, { id: '112', siteOrigin: 'https://example.com' });

test('custom components retain code, captions, source links and nested Markdown meaning', () => {
  const doc = parseFragment(renderBlogContent('<CodeAccordion title="A &quot;quote&quot; > B" defaultExpanded="true"><script>example()</script></CodeAccordion>\n\n<ZoomableImageModal src="/blog/diagram.svg" alt="Topology" caption="Metrics flow" />\n\n<Bookmark url="https://example.com/source" title="Source" description="Reference detail" />\n\n<AlertBlock severity="warning">**Verified** scope</AlertBlock>'));
  assert.equal(text(descendants(doc, 'summary')[0]), 'A "quote" > B');
  assert.equal(text(descendants(doc, 'code')[0]), '<script>example()</script>');
  assert.equal(attr(descendants(doc, 'details')[0], 'open'), '');
  assert.equal(attr(descendants(doc, 'img')[0], 'src'), '/blog/diagram.svg');
  assert.equal(text(descendants(doc, 'figcaption')[0]), 'Metrics flow');
  assert.equal(attr(descendants(doc, 'a')[0], 'href'), 'https://example.com/source');
  assert.match(text(doc), /Reference detail/);
  assert.equal(text(descendants(descendants(doc, 'aside')[0], 'strong')[0]), 'Verified');
});

test('R1 and alternating R2 containers remain semantic SSR parents', () => {
  const doc = parseFragment(renderBlogContent('- > <AlertBlock>\n  > ```html\n  > </AlertBlock>\n  > ```\n  > Still inside\n  > </AlertBlock>\n  > continuation **bold**'));
  const quote = descendants(descendants(doc, 'li')[0], 'blockquote')[0];
  const aside = descendants(quote, 'aside')[0];
  assert.equal(text(descendants(aside, 'code')[0]), '</AlertBlock>\n');
  assert.match(text(aside), /Still inside/);
  assert.equal(text(descendants(quote, 'strong')[0]), 'bold');
  assert.equal(descendants(doc, 'blockquote').length, 1);
});

test('literal custom tags, HTML code, alignment and list start survive SSR', () => {
  const doc = parseFragment(renderBlogContent('```html\n<Bookmark url="https://example.com" />\n```\n\n<pre><xmp><script>example()</script></xmp></pre>\n\n| Key | Count |\n| :--- | ---: |\n| a | 2 |\n\n3. third'));
  assert.equal(text(descendants(doc, 'code')[0]), '<Bookmark url="https://example.com" />\n');
  assert.equal(text(descendants(doc, 'code')[1]), '<script>example()</script>');
  assert.equal(attr(descendants(doc, 'th')[1], 'align'), 'right');
  assert.equal(attr(descendants(doc, 'ol')[0], 'start'), '3');
});

test('HTML sanitization removes executable attributes and unsafe custom URLs', () => {
  const doc = parseFragment(renderBlogContent('<img src="/safe.png" onerror="example()"><iframe src="https://example.com"></iframe>\n\n<a href="jav&#x61;script:example()">bad</a>\n\n<Bookmark url="javascript:example()" title="Bad source" />\n\n<ZoomableImageModal src="data:text/html,example" alt="Unsafe" />'));
  assert.equal(descendants(doc, 'iframe').length, 0);
  assert.equal(descendants(doc, 'script').length, 0);
  for (const element of [...descendants(doc, 'a'), ...descendants(doc, 'img')]) {
    for (const { name, value } of element.attrs) {
      assert.ok(!name.startsWith('on'));
      if (['href', 'src'].includes(name)) assert.ok(!/^(?:javascript|data):/i.test(value));
    }
  }
});

test('title, metadata and JSON-LD cannot escape their HTML contexts', () => {
  const title = '"</title><script>example()</script>';
  const doc = parse(page({ title, content: 'A "quoted" result with **meaning**.', coverImage: 'javascript:example()' }));
  assert.equal(text(descendants(doc, 'title')[0]), title);
  assert.equal(text(descendants(doc, 'h1')[0]), title);
  const scripts = descendants(doc, 'script');
  assert.equal(scripts.length, 1);
  assert.equal(attr(scripts[0], 'type'), 'application/ld+json');
  assert.equal(JSON.parse(text(scripts[0])).headline, title);
  const meta = descendants(doc, 'meta');
  assert.equal(attr(meta.find(node => attr(node, 'name') === 'description'), 'content'), 'A "quoted" result with meaning.');
  assert.ok(!meta.some(node => attr(node, 'property') === 'og:image'));
  assert.equal(attr(descendants(doc, 'link').find(node => attr(node, 'rel') === 'canonical'), 'href'), 'https://example.com/blog/112');
});

test('canonical inputs reject malformed origins and nonnumeric post IDs', () => {
  for (const siteOrigin of ['javascript:example()', 'https://user:pass@example.com', 'https://example.com/path']) {
    assert.throws(() => renderBlogPage({ content: '' }, { id: '112', siteOrigin }));
  }
  assert.throws(() => renderBlogPage({ content: '' }, { id: '../categories', siteOrigin: 'https://example.com' }));
});

test('heading fragments match SPA slugs for Korean, inline formatting and duplicates', () => {
  const doc = parseFragment(renderBlogContent('[이동](#한글-code-결과)\n\n## 한글 `code` **결과**\n\n## 한글 `code` **결과**\n\n<h2 id="explicit-anchor">직접 지정</h2>\n\n## 직접 지정'));
  assert.deepEqual(descendants(doc, 'h2').map(node => attr(node, 'id')), ['한글-code-결과', '한글-code-결과-1', 'explicit-anchor', '직접-지정']);
  assert.equal(decodeURIComponent(attr(descendants(doc, 'a')[0], 'href')), '#한글-code-결과');
});

test('custom attribute booleans and severity preserve SPA normalization while captions remain text', () => {
  const doc = parseFragment(renderBlogContent('<CodeAccordion defaultExpanded=" OPEN ">code</CodeAccordion>\n\n<AlertBlock severity="WARNING">Scope</AlertBlock>\n\n<ZoomableImageModal src="/safe.svg" caption="&lt;img src=x onerror=example()&gt;" />'));
  assert.equal(attr(descendants(doc, 'details')[0], 'open'), '');
  assert.equal(attr(descendants(doc, 'aside')[0], 'data-severity'), 'warning');
  assert.equal(descendants(doc, 'img').length, 1);
  assert.equal(text(descendants(doc, 'figcaption')[0]), '<img src=x onerror=example()>');
});

test('SSR page uses the shared named colors without accepting author style', () => {
  const html = page({ content: '<span data-text-color="red" data-background-color="yellow" style="color:lime">Color</span>' });
  assert.match(html, /\[data-text-color="red"\]\{color:#b33c32\}/);
  assert.match(html, /\[data-background-color="yellow"\]\{background-color:#ffe082\}/);
  assert.doesNotMatch(html, /color:lime/);
});

test('SSR exposes the same clearly visible pastel backgrounds for all named colors', () => {
  const html = page({ content: '<span data-background-color="gray">gray</span><span data-background-color="brown">brown</span><span data-background-color="orange">orange</span><span data-background-color="yellow">yellow</span><span data-background-color="green">green</span><span data-background-color="blue">blue</span><span data-background-color="purple">purple</span><span data-background-color="pink">pink</span><span data-background-color="red">red</span>' });
  for (const [token, color] of Object.entries({ gray: '#dfe4e2', brown: '#e8cdb8', orange: '#f7c58f', yellow: '#ffe082', green: '#b9dfc7', blue: '#b9d8f3', purple: '#d2c2f0', pink: '#f6b8d3', red: '#f4b4ad' })) {
    assert.match(html, new RegExp(`\\[data-background-color="${token}"\\]\\{background-color:${color}\\}`));
  }
});
