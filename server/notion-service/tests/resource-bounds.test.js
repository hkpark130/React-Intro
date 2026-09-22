import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/index.js';
import { resolveRuntimeConfig } from '../src/runtime.js';
import { createNotionFetch } from '../src/authoring.js';
import { createRenderCache } from '../src/renderCache.js';

async function listen(t, handler) {
  const server = http.createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return 'http://127.0.0.1:' + server.address().port;
}
const context = limits => ({ signal: new AbortController().signal, calls: 0, bytes: 0, maxCalls: 2, maxBytes: 100, ...limits });

test('Notion transport has fixed destinations, no redirects and shared byte/request budgets', async () => {
  let calls = 0;
  const state = context();
  const request = createNotionFetch(state, async (url, options) => {
    calls++;
    assert.equal(new URL(url).origin, 'https://api.notion.com');
    assert.equal(options.redirect, 'error');
    assert.equal(options.signal, state.signal);
    return new Response('result');
  });
  await assert.rejects(request('http://127.0.0.1/private'));
  assert.equal(calls, 0);
  assert.equal(await (await request('https://api.notion.com/v1/pages/a')).text(), 'result');
  await request('https://api.notion.com/v1/pages/b');
  await assert.rejects(request('https://api.notion.com/v1/pages/c'), error => error.status === 413);
  assert.equal(calls, 2);
  const tooLarge = createNotionFetch(context({ maxBytes: 3 }), async () => new Response('long body'));
  await assert.rejects(tooLarge('https://api.notion.com/v1/pages/a'), error => error.status === 413);
});

test('an aborted Notion operation cannot start another network call', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  const request = createNotionFetch(context({ signal: controller.signal }), async () => { calls++; return new Response('{}'); });
  await assert.rejects(request('https://api.notion.com/v1/pages/a'));
  assert.equal(calls, 0);
});

test('render reuse is bounded by bytes and entries and includes changed content and origin', () => {
  const cache = createRenderCache({ maxEntries: 2, maxBytes: 100 });
  let calls = 0;
  const render = post => { calls++; return post.content; };
  const options = { id: 1, siteOrigin: 'https://example.com' };
  assert.equal(cache.render({ content: 'one' }, options, render), 'one');
  cache.render({ content: 'one' }, options, render);
  assert.equal(calls, 1);
  assert.equal(cache.render({ content: 'two' }, options, render), 'two');
  cache.render({ content: 'two' }, { ...options, siteOrigin: 'https://other.example' }, render);
  assert.equal(calls, 3);
  assert.equal(cache.size, 2);
  assert.ok(cache.bytes <= 100);
  cache.render({ content: 'x'.repeat(101) }, options, render);
  assert.equal(cache.size, 2);
  cache.render({ content: 'one' }, options, render);
  assert.equal(calls, 5);
});

test('simultaneous SSR reads share an API request and the next read sees an edit', async t => {
  let requests = 0;
  let content = 'First saved content';
  const springBase = await listen(t, (_req, res) => {
    requests++;
    setTimeout(() => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ id: 112, title: 'A title', content })); }, 30);
  });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase, SITE_ORIGIN: 'https://example.com' })));
  const pages = await Promise.all(Array.from({ length: 5 }, async () => (await fetch(origin + '/blog/112')).text()));
  assert.equal(requests, 1);
  assert.ok(pages.every(html => html.includes('First saved content')));
  content = 'Newly edited content';
  assert.match(await (await fetch(origin + '/blog/112')).text(), /Newly edited content/);
  assert.equal(requests, 2);
});

test('sitemap API failures do not amplify into full article list requests', async t => {
  const requests = [];
  const springBase = await listen(t, (req, res) => { requests.push(req.url); res.writeHead(404); res.end('{}'); });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase })));
  assert.equal((await fetch(origin + '/sitemap.xml')).status, 502);
  assert.deepEqual(requests, ['/api/posts/sitemap/all']);
});

