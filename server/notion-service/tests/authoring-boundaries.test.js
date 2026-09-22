import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import axios from 'axios';
import { Client } from '@notionhq/client';
import { createApp } from '../src/index.js';
import { resolveRuntimeConfig } from '../src/runtime.js';

const PAGE = '11111111-1111-4111-8111-111111111111';
const DATABASE = '22222222-2222-4222-8222-222222222222';
const SOURCE = '33333333-3333-4333-8333-333333333333';

async function listen(t, handler) {
  const server = http.createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return 'http://127.0.0.1:' + server.address().port;
}

async function fixture(t, notionRequest) {
  const authCalls = [];
  const springBase = await listen(t, (req, res) => {
    authCalls.push({ url: req.url, authorization: req.headers.authorization });
    res.setHeader('Content-Type', 'application/json');
    if (req.url !== '/api/users/me') { res.writeHead(404); return res.end('{}'); }
    if (req.headers.authorization === 'Bearer admin-fixture') return res.end('{"id":1,"role":"ADMIN"}');
    if (req.headers.authorization === 'Bearer member-fixture') return res.end('{"id":2,"role":"USER"}');
    res.writeHead(401); res.end('{}');
  });
  const original = Client.prototype.request;
  Client.prototype.request = notionRequest;
  t.after(() => { Client.prototype.request = original; });
  const config = resolveRuntimeConfig({ SSR_MODE: 'development', SPRING_BASE: springBase, NOTION_API_KEY: 'fixture-only-notion-key' });
  return { origin: await listen(t, createApp(config)), authCalls };
}

test('Notion verifies the blog administrator before reading a private page', async t => {
  let reads = 0;
  const { origin, authCalls } = await fixture(t, async () => { reads++; return { id: PAGE, properties: {} }; });
  assert.equal((await fetch(origin + '/notion/page/' + PAGE)).status, 401);
  assert.equal(reads, 0);
  assert.equal(authCalls.length, 0);
  assert.equal((await fetch(origin + '/notion/page/' + PAGE, { headers: { Authorization: 'Bearer member-fixture' } })).status, 403);
  assert.equal(reads, 0);
  assert.equal((await fetch(origin + '/notion/page/' + PAGE, { headers: { Authorization: 'Bearer admin-fixture' } })).status, 200);
  assert.equal(reads, 1);
  assert.deepEqual(authCalls.map(item => item.url), ['/api/users/me', '/api/users/me']);
});

test('browser-supplied Notion secrets and malformed IDs never reach Notion', async t => {
  let reads = 0;
  const { origin } = await fixture(t, async () => { reads++; return { id: PAGE, properties: {} }; });
  for (const request of [
    { path: '/notion/page/' + PAGE + '?apiKey=fixture-browser-key' },
    { path: '/notion/page/' + PAGE, headers: { 'x-notion-api-key': 'fixture-browser-key' } },
    { path: '/notion/convert', method: 'POST', body: { pageId: PAGE, notionKey: 'fixture-browser-key' } },
    { path: '/notion/page/not-a-page-id' },
  ]) {
    const response = await fetch(origin + request.path, { method: request.method || 'GET', headers: { Authorization: 'Bearer admin-fixture', 'Content-Type': 'application/json', ...request.headers }, body: request.body ? JSON.stringify(request.body) : undefined });
    assert.equal(response.status, 400);
  }
  assert.equal(reads, 0);
});

test('a database picker reads metadata without fetching every page body', async t => {
  const requests = [];
  const { origin } = await fixture(t, async args => {
    requests.push(args.path);
    if (args.path === 'databases/' + DATABASE) return { data_sources: [{ id: SOURCE, name: '기술 기록' }] };
    if (args.path === 'data_sources/' + SOURCE + '/query') return { results: [{ id: PAGE, properties: { Name: { type: 'title', title: [{ plain_text: '선택할 글' }] } } }], has_more: false, next_cursor: null };
    return { results: [], has_more: false };
  });
  const response = await fetch(origin + '/notion/render-db/' + DATABASE + '?pageSize=10', { headers: { Authorization: 'Bearer admin-fixture' } });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.results[0]?.title, '선택할 글');
  assert.deepEqual(requests, ['databases/' + DATABASE, 'data_sources/' + SOURCE + '/query']);
  assert.ok(!data.results.some(page => page.html));
});

test('link metadata fallback never crawls an arbitrary destination', async t => {
  let externalReads = 0;
  const original = axios.get;
  axios.get = async () => { externalReads++; return { data: '<title>Unexpected crawl</title>' }; };
  t.after(() => { axios.get = original; });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'development' })));
  const response = await fetch(origin + '/seo/preview?url=' + encodeURIComponent('https://example.com/article'));
  assert.equal(response.status, 200);
  assert.equal(externalReads, 0);
  assert.equal((await response.json()).title, 'example.com');
  assert.equal((await fetch(origin + '/seo/preview?url=javascript:alert(1)')).status, 400);
});

test('multiple Notion data sources require an explicit member selection', async t => {
  const second = '44444444-4444-4444-8444-444444444444';
  const requested = [];
  const { origin } = await fixture(t, async args => {
    requested.push(args.path);
    if (args.path === 'databases/' + DATABASE) return { data_sources: [{ id: SOURCE, name: '첫 원본' }, { id: second, name: '둘째 원본' }] };
    return { results: [], has_more: true, next_cursor: PAGE };
  });
  const headers = { Authorization: 'Bearer admin-fixture' };
  const base = origin + '/notion/render-db/' + DATABASE;
  const picker = await (await fetch(base, { headers })).json();
  assert.equal(picker.requiresDataSource, true);
  assert.equal(picker.dataSources.length, 2);
  assert.deepEqual(requested, ['databases/' + DATABASE]);
  const selected = await (await fetch(base + '?dataSourceId=' + second + '&startCursor=' + PAGE, { headers })).json();
  assert.equal(selected.hasMore, true);
  assert.equal(selected.nextCursor, PAGE);
  assert.ok(requested.includes('data_sources/' + second + '/query'));
  assert.equal((await fetch(base + '?dataSourceId=' + PAGE, { headers })).status, 400);
});

test('concurrent imports are bounded and capacity returns after completing requests', async t => {
  const pending = [];
  let started = 0;
  let bothStarted;
  const ready = new Promise(resolve => { bothStarted = resolve; });
  const { origin } = await fixture(t, () => {
    started++;
    if (started > 2) return Promise.resolve({ id: PAGE, properties: {} });
    const request = new Promise(resolve => pending.push(resolve));
    if (started === 2) bothStarted();
    return request;
  });
  const request = () => fetch(origin + '/notion/page/' + PAGE, { headers: { Authorization: 'Bearer admin-fixture' } });
  const first = request(), second = request();
  await ready;
  assert.equal((await request()).status, 429);
  pending.forEach(resolve => resolve({ id: PAGE, properties: {} }));
  assert.ok((await Promise.all([first, second])).every(response => response.status === 200));
  assert.equal((await request()).status, 200);
});

test('selected-page conversion keeps nested content and uses the shared safe renderer', async t => {
  const child = '55555555-5555-4555-8555-555555555555';
  const requests = [];
  const richText = text => [{ type: 'text', text: { content: text, link: null }, plain_text: text, annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null }];
  const { origin } = await fixture(t, async args => {
    requests.push(args.path);
    if (args.path === 'blocks/' + PAGE + '/children') return { results: [
      { object: 'block', id: child, type: 'paragraph', has_children: true, paragraph: { rich_text: richText('가져온 상위 문단') } },
      { object: 'block', id: SOURCE, type: 'bookmark', has_children: false, bookmark: { url: 'javascript:alert(1)', caption: richText('위험 주소') } },
      { object: 'block', id: DATABASE, type: 'code', has_children: false, code: { language: 'html', rich_text: richText('<script>alert(1)</script>'), caption: [] } },
    ], has_more: false, next_cursor: null };
    if (args.path === 'blocks/' + child + '/children') return { results: [
      { object: 'block', id: SOURCE, type: 'paragraph', has_children: false, paragraph: { rich_text: richText('하위 구축 기록도 보존됩니다.') } },
    ], has_more: false, next_cursor: null };
    throw new Error('Unexpected request');
  });
  const response = await fetch(origin + '/notion/convert', { method: 'POST', headers: { Authorization: 'Bearer admin-fixture', 'Content-Type': 'application/json' }, body: JSON.stringify({ pageId: PAGE }) });
  assert.equal(response.status, 200);
  const { markdown, html } = await response.json();
  assert.match(markdown, /가져온 상위 문단/);
  assert.match(markdown, /하위 구축 기록도 보존됩니다/);
  assert.match(html, /하위 구축 기록도 보존됩니다/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script|href=["']javascript:/i);
  assert.deepEqual(requests, ['blocks/' + PAGE + '/children', 'blocks/' + child + '/children']);
});
