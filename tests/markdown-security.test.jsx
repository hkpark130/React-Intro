import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import MarkdownRenderer from '../src/components/markdown/MarkdownRenderer';
import {
  rejectedUrls, urlMarkup, unsafeMarkup, encodedCodeMarkup, decodedCode, encodedAlertMarkup,
} from '../server/notion-service/tests/fixtures/markdown-policy-cases.js';

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
  vi.unstubAllEnvs();
});
const render = content => act(() => root.render(<MarkdownRenderer content={content} />));

test.each(rejectedUrls)('SPA removes unsafe URLs from raw HTML and custom components: %s', async url => {
  await render(urlMarkup(url));
  for (const node of container.querySelectorAll('a, img, video, source')) {
    for (const name of ['href', 'src', 'poster']) expect(node.getAttribute(name), `${node.tagName}.${name}`).toBeFalsy();
  }
  expect(container.textContent).toContain('Source');
  expect(container.textContent).toContain('Bookmark source');
});

test('SPA strips author CSS and active attributes while preserving table layout and disabled task inputs', async () => {
  await render(unsafeMarkup);
  const body = container.querySelector('#body-policy');
  expect(body.getAttribute('style')).toBeNull();
  expect(body.getAttribute('name')).toBeNull();
  const cell = container.querySelector('#cell-policy');
  expect(cell.style.textAlign).toBe('center');
  expect(cell.style.backgroundImage).toBe('');
  expect(cell.style.color).toBe('');
  expect(cell.colSpan).toBe(2);
  expect(cell.rowSpan).toBe(3);
  const input = container.querySelector('input');
  expect(input.type).toBe('checkbox');
  expect(input.disabled).toBe(true);
  expect(input.checked).toBe(true);
  expect(input.getAttribute('value')).toBeNull();
  expect(input.autofocus).toBe(false);
  expect(container.querySelector('#attack-script, #attack-frame, #attack-svg, #attack-math, #attack-style')).toBeNull();
  for (const node of container.querySelectorAll('*')) {
    expect([...node.attributes].some(attr => /^on/i.test(attr.name))).toBe(false);
  }
  expect(container.querySelector('a[title="safe-link"]').rel).toBe('noopener noreferrer');
});

test('SPA renders only named text and background colors while arbitrary CSS stays stripped', async () => {
  await render('<span id="safe-color" data-text-color="red" data-background-color="yellow" style="position:fixed;color:lime">Safe</span> <span id="bad-color" data-text-color="red;background:url(https://example.com/x)" data-background-color="unknown">Bad</span>');
  const safe = container.querySelector('#safe-color');
  expect(safe.dataset.textColor).toBe('red');
  expect(safe.dataset.backgroundColor).toBe('yellow');
  expect(safe.style.color).toBe('rgb(179, 60, 50)');
  expect(safe.style.backgroundColor).toBe('rgb(255, 224, 130)');
  const bad = container.querySelector('#bad-color');
  expect(bad.getAttribute('data-text-color')).toBeNull();
  expect(bad.getAttribute('data-background-color')).toBeNull();
  expect(bad.getAttribute('style')).toBeNull();
});

test('SPA uses clearly visible shared pastel backgrounds for every named background color', async () => {
  await render(['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red']
    .map(token => `<span data-background-color="${token}">${token}</span>`).join(' '));
  const backgrounds = [...container.querySelectorAll('[data-background-color]')].map(node => node.style.backgroundColor);
  expect(backgrounds).toEqual([
    'rgb(223, 228, 226)', 'rgb(232, 205, 184)', 'rgb(247, 197, 143)',
    'rgb(255, 224, 130)', 'rgb(185, 223, 199)', 'rgb(185, 216, 243)',
    'rgb(210, 194, 240)', 'rgb(246, 184, 211)', 'rgb(244, 180, 173)',
  ]);
});

test('SPA decodes an opted-in code body exactly once without treating its closing-tag example as markup', async () => {
  await render(encodedCodeMarkup);
  expect(container.querySelector('pre code').textContent).toBe(decodedCode);
  expect(container.querySelector('script')).toBeNull();
  expect(container.querySelector('strong').textContent).toBe('the complete example');
});

test('SPA decodes opted-in Alert Markdown before parsing nested blocks and checking URLs', async () => {
  await render(encodedAlertMarkup);
  const alerts = container.querySelectorAll('[role="alert"]');
  expect(alerts).toHaveLength(2);
  expect(alerts[0].querySelector('code').textContent).toBe('</AlertBlock>');
  expect(alerts[1].querySelector('strong').textContent).toBe('Nested note');
  expect(alerts[0].querySelector('a').getAttribute('href')).toBeFalsy();
  expect(container.textContent).toContain('After the alert');
});

test('SPA preserves safe relative, fragment, mail and HTTP links but never uses mail as media', async () => {
  await render('[Relative](/blog/99?mode=read#review)\n\n[Fragment](#section)\n\n[Mail](mailto:reader@example.com)\n\n[HTTPS](https://example.com/reference?q=1&part=2)\n\n<video src="/clip.mp4" poster="/cover.png" controls><source src="https://example.com/clip.webm" type="video/webm"></video>\n\n<ZoomableImageModal src="mailto:reader@example.com" alt="Mail is not media" />');
  expect([...container.querySelectorAll('a')].map(node => node.getAttribute('href'))).toEqual([
    '/blog/99?mode=read#review', '#section', 'mailto:reader@example.com', 'https://example.com/reference?q=1&part=2',
  ]);
  expect(container.querySelector('video').getAttribute('src')).toBe('/clip.mp4');
  expect(container.querySelector('video').getAttribute('poster')).toBe('/cover.png');
  expect(container.querySelector('source').getAttribute('src')).toBe('https://example.com/clip.webm');
  expect(container.querySelector('img[alt="Mail is not media"]')).toBeNull();
});

test.each([
  ['bash', 'echo "example"'],
  ['python', 'def example():\n    return 1'],
  ['javascript', 'const example = 1;'],
  ['java', 'public class Example {}'],
  ['go', 'func example() int { return 1 }'],
  ['yaml', 'kind: Pod\nspec:\n  containers: []'],
  ['makefile', 'all:\n\techo example'],
  ['xml', '<example value="1" />'],
])('accordion keeps code text and syntax highlighting for %s', async (language, code) => {
  const encoded = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  await render(`<CodeAccordion language="${language}" contentEncoding="html" defaultExpanded="true" showLineNumbers="false">${encoded}</CodeAccordion>`);
  const block = container.querySelector('pre code');
  expect(block.textContent).toBe(code);
  expect(block.querySelectorAll('.token').length).toBeGreaterThan(0);
});

test('accordion displays unsupported languages as literal text', async () => {
  await render('<CodeAccordion language="unknown-language" defaultExpanded="true" showLineNumbers="false"><script>example()</script></CodeAccordion>');
  expect(container.querySelector('pre code').textContent).toBe('<script>example()</script>');
  expect(container.querySelector('pre code .token')).toBeNull();
  expect(container.querySelector('script')).toBeNull();
});
