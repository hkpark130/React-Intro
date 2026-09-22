import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFragment } from 'parse5';
import { renderBlogContent } from '../src/markdown/renderBlog.js';
import {
  rejectedUrls, urlMarkup, unsafeMarkup, encodedCodeMarkup, decodedCode, encodedAlertMarkup,
} from './fixtures/markdown-policy-cases.js';

const descendants = (node, tag) => (node.childNodes || []).flatMap(child => [
  ...(tag === '*' || child.tagName === tag ? [child] : []), ...descendants(child, tag),
]);
const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
const attr = (node, name) => node?.attrs?.find(item => item.name === name)?.value;

for (const url of rejectedUrls) {
  test(`SSR removes unsafe URLs from raw HTML and custom components: ${url}`, () => {
    const doc = parseFragment(renderBlogContent(urlMarkup(url)));
    for (const node of descendants(doc, '*')) {
      for (const name of ['href', 'src', 'poster']) assert.ok(!attr(node, name), `${node.tagName}.${name}`);
    }
    assert.match(text(doc), /Source/);
    assert.match(text(doc), /Bookmark source/);
  });
}

test('SSR strips author CSS and active attributes while preserving table layout and disabled task inputs', () => {
  const doc = parseFragment(renderBlogContent(unsafeMarkup));
  const elements = descendants(doc, '*');
  const body = elements.find(node => attr(node, 'id') === 'body-policy');
  assert.equal(attr(body, 'style'), undefined);
  assert.equal(attr(body, 'name'), undefined);
  const cell = elements.find(node => attr(node, 'id') === 'cell-policy');
  assert.equal(attr(cell, 'style'), 'text-align:center');
  assert.equal(attr(cell, 'colspan'), '2');
  assert.equal(attr(cell, 'rowspan'), '3');
  const input = descendants(doc, 'input')[0];
  assert.equal(attr(input, 'type'), 'checkbox');
  assert.equal(attr(input, 'disabled'), '');
  assert.equal(attr(input, 'checked'), '');
  assert.equal(attr(input, 'value'), undefined);
  assert.equal(attr(input, 'autofocus'), undefined);
  assert.ok(!elements.some(node => /^attack-/.test(attr(node, 'id') || '')));
  assert.ok(elements.every(node => (node.attrs || []).every(item => !/^on/i.test(item.name))));
});

test('SSR preserves only named text and background color tokens and never author CSS', () => {
  const doc = parseFragment(renderBlogContent('<span id="safe-color" data-text-color="red" data-background-color="yellow" style="position:fixed;color:lime">Safe</span> <span id="bad-color" data-text-color="red;background:url(https://example.com/x)" data-background-color="unknown">Bad</span>'));
  const elements = descendants(doc, '*');
  const safe = elements.find(node => attr(node, 'id') === 'safe-color');
  assert.equal(attr(safe, 'data-text-color'), 'red');
  assert.equal(attr(safe, 'data-background-color'), 'yellow');
  assert.equal(attr(safe, 'style'), undefined);
  const bad = elements.find(node => attr(node, 'id') === 'bad-color');
  assert.equal(attr(bad, 'data-text-color'), undefined);
  assert.equal(attr(bad, 'data-background-color'), undefined);
  assert.equal(attr(bad, 'style'), undefined);
});

test('SSR decodes an opted-in code body exactly once without treating its closing-tag example as markup', () => {
  const doc = parseFragment(renderBlogContent(encodedCodeMarkup));
  assert.equal(text(descendants(doc, 'code')[0]), decodedCode);
  assert.equal(descendants(doc, 'script').length, 0);
  assert.equal(text(descendants(doc, 'strong')[0]), 'the complete example');
});

test('SSR decodes opted-in Alert Markdown before parsing nested blocks and checking URLs', () => {
  const doc = parseFragment(renderBlogContent(encodedAlertMarkup));
  const alerts = descendants(doc, 'aside');
  assert.equal(alerts.length, 2);
  assert.equal(text(descendants(alerts[0], 'code')[0]), '</AlertBlock>');
  assert.equal(text(descendants(alerts[1], 'strong')[0]), 'Nested note');
  assert.ok(!attr(descendants(alerts[0], 'a')[0], 'href'));
  assert.match(text(doc), /After the alert/);
});

test('SSR preserves safe relative, fragment, mail and HTTP links but never uses mail as media', () => {
  const doc = parseFragment(renderBlogContent('[Relative](/blog/99?mode=read#review)\n\n[Fragment](#section)\n\n[Mail](mailto:reader@example.com)\n\n[HTTPS](https://example.com/reference?q=1&part=2)\n\n<video src="/clip.mp4" poster="/cover.png" controls><source src="https://example.com/clip.webm" type="video/webm"></video>\n\n<ZoomableImageModal src="mailto:reader@example.com" alt="Mail is not media" />'));
  assert.deepEqual(descendants(doc, 'a').map(node => attr(node, 'href')), [
    '/blog/99?mode=read#review', '#section', 'mailto:reader@example.com', 'https://example.com/reference?q=1&part=2',
  ]);
  assert.equal(attr(descendants(doc, 'video')[0], 'src'), '/clip.mp4');
  assert.equal(attr(descendants(doc, 'video')[0], 'poster'), '/cover.png');
  assert.equal(attr(descendants(doc, 'source')[0], 'src'), 'https://example.com/clip.webm');
  assert.ok(!descendants(doc, 'img').some(node => attr(node, 'alt') === 'Mail is not media'));
});
