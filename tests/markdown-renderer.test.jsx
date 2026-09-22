import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import MarkdownRenderer from '../src/components/markdown/MarkdownRenderer';
import Bookmark from '../src/components/markdown/Bookmark';

let container;
let root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  vi.stubEnv('MODE', 'editorial');
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
const render = content => act(() => root.render(<MarkdownRenderer content={content} />));

test('custom tags and HTML examples remain literal inside fenced and inline code', async () => {
  await render('```text\n<Bookmark url="https://example.com" />\n<b>two words</b>\n<widget />\n```\n\n`<AlertBlock>literal</AlertBlock>`');
  expect(container.querySelector('pre code').textContent).toBe('<Bookmark url="https://example.com" />\n<b>two words</b>\n<widget />\n');
  expect(container.querySelectorAll('code')[1].textContent).toBe('<AlertBlock>literal</AlertBlock>');
  expect(container.querySelector('[role="alert"]')).toBeNull();
});

test('paired accordion consumes its code literally while quoted attributes preserve greater-than and escaped quotes', async () => {
  await render(String.raw`<CodeAccordion title="A > B and \"quoted\"" language="text" defaultExpanded="true" showLineNumbers="false">
<Bookmark url="https://example.com" />
<b>two words</b>
</CodeAccordion>`);
  expect(container.querySelector('button').textContent).toContain('A > B and "quoted"');
  expect(container.querySelector('pre code').textContent).toBe('<Bookmark url="https://example.com" />\n<b>two words</b>');
});

test('legacy pre/xmp HTML examples render as code text', async () => {
  await render('<pre><xmp><script>example()</script>\n<div>example</div></xmp></pre>');
  expect(container.querySelector('pre code').textContent).toContain('<script>example()</script>');
  expect(container.querySelector('pre code').textContent).toContain('<div>example</div>');
  expect(container.querySelector('script')).toBeNull();
});

test('raw HTML code containers keep custom-tag examples visible as text', async () => {
  await render('<p>Example <code>&lt;tag&gt; <Bookmark url="https://example.com" /></code></p>\n\n<pre><code>const quoted = \\"value\\";\n<AlertBlock>literal</AlertBlock></code></pre>');
  expect(container.querySelector('p code').textContent).toBe('<tag> <Bookmark url="https://example.com" />');
  expect(container.querySelector('pre code').textContent).toBe('const quoted = \\"value\\";\n<AlertBlock>literal</AlertBlock>');
  expect(container.querySelector('[role="alert"]')).toBeNull();
});

test('unknown fence languages keep readable code', async () => {
  await render('```not-a-registered-language\nhello <world>\n```');
  expect(container.querySelector('pre code').textContent).toBe('hello <world>\n');
});

test('custom image and nested alert tags preserve casing, attributes and child content', async () => {
  await render('<ALERTBLOCK severity="warning">Outer\n\n<AlertBlock>Inner</AlertBlock>\n\n<ZoomableImageModal src="/diagram.svg" alt="A &amp; B" caption="Topology" /></ALERTBLOCK>');
  expect(container.querySelectorAll('[role="alert"]')).toHaveLength(2);
  expect(container.textContent).toContain('Outer');
  expect(container.textContent).toContain('Inner');
  expect(container.querySelector('img').getAttribute('src')).toBe('/diagram.svg');
  expect(container.querySelector('img').alt).toBe('A & B');
  expect(container.textContent).toContain('Topology');
});

test('closing custom tags inside an AlertBlock fence remain literal within the alert', async () => {
  await render('<AlertBlock>\n```html\n</AlertBlock>\n```\nStill inside\n</AlertBlock>');
  const alert = container.querySelector('[role="alert"]');
  expect(alert.querySelector('pre code').textContent).toBe('</AlertBlock>\n');
  expect(alert.textContent).toContain('Still inside');
  expect(container.querySelectorAll('[role="alert"]')).toHaveLength(1);
});

test('inline closing custom tags inside an AlertBlock do not terminate the container', async () => {
  await render('<AlertBlock>Example `</AlertBlock>` stays inside.</AlertBlock>');
  const alert = container.querySelector('[role="alert"]');
  expect(alert.querySelector('code').textContent).toBe('</AlertBlock>');
  expect(alert.textContent).toContain('stays inside.');
});

test('custom blocks and following Markdown stay in their original blockquote', async () => {
  await render('> <AlertBlock>Note</AlertBlock>\n> continuation **bold**');
  const quote = container.querySelector('blockquote');
  expect(quote.querySelector('[role="alert"]').textContent).toContain('Note');
  expect(quote.textContent).toContain('continuation');
  expect(quote.querySelector('strong').textContent).toBe('bold');
  expect(container.querySelectorAll('blockquote')).toHaveLength(1);
});

test.each(['- Before\n  ', '- '])('custom blocks and following Markdown stay in their original list item: %s', async prefix => {
  await render(`${prefix}<AlertBlock>Note</AlertBlock>\n  continuation **bold**`);
  const item = container.querySelector('li');
  expect(item.querySelector('[role="alert"]').textContent).toContain('Note');
  expect(item.textContent).toContain('continuation');
  expect(item.querySelector('strong').textContent).toBe('bold');
  expect(container.querySelectorAll('li')).toHaveLength(1);
});

test('a multiline quoted alert preserves fenced code without introducing a second quote', async () => {
  await render('> <AlertBlock>\n> ```html\n> </AlertBlock>\n> ```\n> Still inside\n> </AlertBlock>\n> continuation');
  const alert = container.querySelector('blockquote [role="alert"]');
  expect(alert.querySelector('pre code').textContent).toBe('</AlertBlock>\n');
  expect(alert.textContent).toContain('Still inside');
  expect(container.querySelectorAll('blockquote')).toHaveLength(1);
  expect(container.querySelector('blockquote').textContent).toContain('continuation');
});

test('a listed accordion removes container indentation from its literal code', async () => {
  await render('- <CodeAccordion language="text" defaultExpanded="true" showLineNumbers="false">\n  first\n    indented\n  </CodeAccordion>\n  continuation');
  const item = container.querySelector('li');
  expect(item.querySelector('pre code').textContent).toBe('first\n  indented');
  expect(item.textContent).toContain('continuation');
});

test.each([
  { start: '- > ', continuation: '  > ', parent: 'li > blockquote' },
  { start: '> - ', continuation: '>   ', parent: 'blockquote > ul > li' },
  { start: '- > - > ', continuation: '  >   > ', parent: 'li > blockquote > ul > li > blockquote' },
  { start: '> 3. > - ', continuation: '>    >   ', parent: 'blockquote > ol > li > blockquote > ul > li' },
])('alternating Markdown containers preserve alert and continuation parents: $start', async ({ start, continuation, parent }) => {
  await render(`${start}<AlertBlock>Note</AlertBlock>\n${continuation}continuation **bold**`);
  const context = container.querySelector(parent);
  expect(context).not.toBeNull();
  expect(context.querySelector('[role="alert"]')?.textContent).toContain('Note');
  expect(context.textContent).toContain('continuation');
  expect(context.querySelector('strong')?.textContent).toBe('bold');
});

test('alternating containers strip only their own prefix from accordion code', async () => {
  await render('- > - > <CodeAccordion language="text" defaultExpanded="true" showLineNumbers="false">\n  >   > first\n  >   >   indented\n  >   > </CodeAccordion>\n  >   > continuation');
  const context = container.querySelector('li > blockquote > ul > li > blockquote');
  expect(context?.querySelector('pre code')?.textContent).toBe('first\n  indented');
  expect(context?.textContent).toContain('continuation');
});

test('an alert fence inside a listed quote keeps the closing tag literal', async () => {
  await render('- > <AlertBlock>\n  > ```html\n  > </AlertBlock>\n  > ```\n  > Still inside\n  > </AlertBlock>\n  > continuation');
  const quote = container.querySelector('li > blockquote');
  const alert = quote?.querySelector('[role="alert"]');
  expect(alert?.querySelector('pre code')?.textContent).toBe('</AlertBlock>\n');
  expect(alert?.textContent).toContain('Still inside');
  expect(container.querySelectorAll('blockquote')).toHaveLength(1);
  expect(quote?.textContent).toContain('continuation');
});

test('GFM alignment, HTML cell spans, ordered-list start and in-page links survive component mapping', async () => {
  await render('| Name | Count |\n| :--- | ---: |\n| a | 2 |\n\n3. third\n4. fourth\n\n[section](#section)\n\n<table><tbody><tr><td colspan="2" rowspan="3">wide</td></tr></tbody></table>');
  expect(container.querySelectorAll('th')[1].style.textAlign).toBe('right');
  expect(container.querySelectorAll('td')[1].style.textAlign).toBe('right');
  expect(container.querySelector('td[colspan="2"]').rowSpan).toBe(3);
  expect(container.querySelector('ol').start).toBe(3);
  expect(container.querySelector('a[href="#section"]').target).toBe('');
});

test('editorial bookmarks show current source text without metadata, favicon or remote thumbnail requests', async () => {
  const request = vi.spyOn(axios, 'get').mockRejectedValue(new Error('Unexpected external metadata request'));
  await act(() => root.render(<Bookmark url="https://example.com/article" title="First" description="Source" imageUrl="https://example.com/image.png" />));
  await act(() => root.render(<Bookmark url="https://example.com/article" title="Revised" description="Updated source" />));
  expect(container.textContent).toContain('Revised');
  expect(container.textContent).toContain('Updated source');
  expect(container.querySelector('a').href).toBe('https://example.com/article');
  expect(container.querySelectorAll('img')).toHaveLength(0);
  expect(request).not.toHaveBeenCalled();
});
