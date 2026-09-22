import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import axios from 'axios';
import { Client } from '@notionhq/client';
import { createApp } from '../src/index.js';
import { resolveRuntimeConfig } from '../src/runtime.js';

async function listen(t, handler) {
  const server = http.createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('editorial rejects Notion and all SEO fetch routes before network work', async t => {
  let requests = 0;
  const originalGet = axios.get;
  const originalRequest = Client.prototype.request;
  axios.get = async () => { requests++; return { data: '<title>Unexpected request</title>' }; };
  Client.prototype.request = async () => { requests++; throw new Error('Notion transport disabled in test'); };
  t.after(() => { axios.get = originalGet; Client.prototype.request = originalRequest; });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'editorial' })));
  for (const [path, method, body] of [
    ['/seo/preview?url=http://127.0.0.1/example', 'GET'],
    ['/seo/ping', 'POST'],
    ['/notion/page/local-example', 'GET'],
    ['/notion/convert', 'POST', { pageId: 'local-example' }],
  ]) {
    const response = await fetch(origin + path, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    assert.equal(response.status, 503);
  }
  assert.equal(requests, 0);
});

test('blog route validates IDs and emits canonical HTML independent of listing query', async t => {
  const paths = [];
  const springBase = await listen(t, (req, res) => {
    paths.push(req.url);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ id: 112, title: '한글 제목', content: '<Bookmark url="https://example.com/source" title="Source" />' }));
  });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase, SITE_ORIGIN: 'https://example.com' })));
  assert.equal((await fetch(origin + '/blog/not-a-number')).status, 400);
  assert.equal(paths.length, 0);
  const response = await fetch(origin + '/blog/112?page=5&categoryId=2');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /한글 제목/);
  assert.match(html, /rel="canonical" href="https:\/\/example.com\/blog\/112"/);
  assert.ok(!html.includes('categoryId'));
  assert.deepEqual(paths, ['/api/posts/112']);
});
