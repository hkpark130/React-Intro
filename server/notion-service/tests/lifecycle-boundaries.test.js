import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Buffer } from 'node:buffer';
import { once } from 'node:events';
import { setImmediate as nextTurn } from 'node:timers/promises';
import express from 'express';
import { createApp } from '../src/index.js';
import { createAuthoringGate } from '../src/authoring.js';
import { createSpringClient, resolveRuntimeConfig } from '../src/runtime.js';

const PAGE = '11111111-1111-4111-8111-111111111111';
const SECOND = '22222222-2222-4222-8222-222222222222';
const THIRD = '33333333-3333-4333-8333-333333333333';
const HEADERS = { Authorization: 'Bearer lifecycle-admin-fixture' };

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

async function listen(t, handler) {
  const server = http.createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return 'http://127.0.0.1:' + server.address().port;
}

function jsonResponse(res, value, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(value));
}

async function adminConfig(t) {
  const springBase = await listen(t, (req, res) => {
    if (req.url !== '/api/users/me' || req.headers.authorization !== HEADERS.Authorization) {
      return jsonResponse(res, {}, 401);
    }
    jsonResponse(res, { id: 1, role: 'ADMIN' });
  });
  return resolveRuntimeConfig({ SSR_MODE: 'development', SPRING_BASE: springBase, NOTION_API_KEY: 'lifecycle-fixture-only' });
}

async function notionFixture(t, handler) {
  const notionOrigin = await listen(t, handler);
  const transport = globalThis.fetch;
  // Keep the real application, SDK, request budgets and AbortSignal. Only the
  // final Notion transport destination is a local HTTP fixture.
  t.mock.method(globalThis, 'fetch', (input, options) => {
    const url = new URL(typeof input === 'string' ? input : input.url || input);
    return transport(url.origin === 'https://api.notion.com' ? notionOrigin + url.pathname + url.search : input, options);
  });
  return listen(t, createApp(await adminConfig(t)));
}

function pendingFetch(url, options) {
  const promise = fetch(url, options);
  // A failing assertion still closes fixtures, which can reject unfinished reads.
  promise.catch(() => {});
  return promise;
}

test('disconnecting an administrator import cancels its upstream and returns exactly one slot', { timeout: 5000 }, async t => {
  const arrivals = new Map([PAGE, SECOND, THIRD].map(id => [id, deferred()]));
  const waiting = new Map();
  const origin = await notionFixture(t, (req, res) => {
    const id = new URL(req.url, 'http://fixture.invalid').pathname.split('/').at(-1);
    const closed = deferred();
    res.once('close', closed.resolve);
    waiting.set(id, { res, closed });
    arrivals.get(id).resolve();
  });
  const controller = new AbortController();
  t.after(() => controller.abort());
  const first = pendingFetch(origin + '/notion/page/' + PAGE, { headers: HEADERS, signal: controller.signal });
  const second = pendingFetch(origin + '/notion/page/' + SECOND, { headers: HEADERS });
  await Promise.all([arrivals.get(PAGE).promise, arrivals.get(SECOND).promise]);
  assert.equal((await fetch(origin + '/notion/page/' + THIRD, { headers: HEADERS })).status, 429);

  controller.abort();
  await assert.rejects(first, error => error.name === 'AbortError');
  await waiting.get(PAGE).closed.promise;
  const replacement = pendingFetch(origin + '/notion/page/' + THIRD, { headers: HEADERS });
  await arrivals.get(THIRD).promise;
  // The second request still occupies its slot; disconnect must not release both.
  assert.equal((await fetch(origin + '/notion/page/' + PAGE, { headers: HEADERS })).status, 429);
  jsonResponse(waiting.get(SECOND).res, { id: SECOND, properties: {} });
  jsonResponse(waiting.get(THIRD).res, { id: THIRD, properties: {} });
  const completed = await Promise.all([second, replacement]);
  assert.ok(completed.every(response => response.status === 200));
  await Promise.all(completed.map(response => response.json()));
});

test('the ninth different SSR read is rejected and a failed upstream returns its slot', { timeout: 5000 }, async t => {
  const arrivals = new Map(Array.from({ length: 9 }, (_, index) => [String(index + 1), deferred()]));
  const waiting = new Map();
  const springBase = await listen(t, (req, res) => {
    const id = req.url.split('/').at(-1);
    waiting.set(id, res);
    arrivals.get(id)?.resolve();
  });
  const origin = await listen(t, createApp(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase, SITE_ORIGIN: 'https://example.com' })));
  const firstEight = Array.from({ length: 8 }, (_, index) => pendingFetch(origin + '/blog/' + (index + 1)));
  await Promise.all([...arrivals.values()].slice(0, 8).map(arrival => arrival.promise));
  const busy = await fetch(origin + '/blog/9');
  assert.equal(busy.status, 503);
  assert.equal(busy.headers.get('Retry-After'), '1');
  assert.equal(waiting.size, 8);
  assert.equal(waiting.has('9'), false);

  jsonResponse(waiting.get('1'), {}, 500);
  assert.equal((await firstEight[0]).status, 502);
  const ninth = pendingFetch(origin + '/blog/9');
  await arrivals.get('9').promise;
  assert.equal((await fetch(origin + '/blog/10')).status, 503);
  assert.equal(waiting.has('10'), false);
  for (let id = 2; id <= 9; id++) {
    jsonResponse(waiting.get(String(id)), { id, title: 'Fixture ' + id, content: 'Saved body ' + id });
  }
  const completed = await Promise.all([...firstEight.slice(1), ninth]);
  assert.ok(completed.every(response => response.status === 200));
  await Promise.all(completed.map(response => response.text()));
});

test('Notion responses share the real 4 MiB budget and excess returns 413 without partial conversion', { timeout: 5000 }, async t => {
  const sizedPage = (bytes, nextCursor) => {
    const page = { object: 'list', results: [], has_more: !!nextCursor, next_cursor: nextCursor, padding: '' };
    page.padding = 'x'.repeat(bytes - Buffer.byteLength(JSON.stringify(page)));
    const body = JSON.stringify(page);
    assert.equal(Buffer.byteLength(body), bytes);
    return body;
  };
  const bodies = [sizedPage(2 * 1024 * 1024, 'second-page'), sizedPage(2 * 1024 * 1024, 'third-page'), JSON.stringify({ results: [], has_more: false, next_cursor: null })];
  let reads = 0;
  const origin = await notionFixture(t, (_req, res) => {
    const body = bodies[reads++];
    assert.ok(body, 'A budget failure must not continue pagination');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(body);
  });
  const response = await fetch(origin + '/notion/convert', { method: 'POST', headers: { ...HEADERS, 'Content-Type': 'application/json' }, body: JSON.stringify({ pageId: PAGE }) });
  assert.equal(response.status, 413);
  assert.equal(reads, 3); // Two successful responses total exactly 4 MiB.
  const result = await response.json();
  assert.equal(typeof result.message, 'string');
  assert.equal(result.markdown, undefined);
  assert.equal(result.html, undefined);
});

test('the 30 second authoring deadline aborts jobs and returns capacity under a fake clock', { timeout: 5000 }, async t => {
  const config = await adminConfig(t);
  const app = express();
  const bothReady = deferred();
  const signals = [];
  app.use('/notion', createAuthoringGate(config, createSpringClient(config)), (req, res) => {
    if (req.path === '/complete') return jsonResponse(res, { ok: true });
    signals.push(req.notionContext.signal);
    if (signals.length === 2) bothReady.resolve();
  });
  const origin = await listen(t, app);
  t.mock.timers.enable({ apis: ['setTimeout'] });

  // Native HTTP avoids mixing the test clock with fetch's pooled-connection timers.
  const request = path => new Promise((resolve, reject) => {
    const pending = http.get(origin + path, { headers: HEADERS }, res => {
      res.resume();
      res.once('end', () => resolve(res.statusCode));
    });
    pending.once('error', reject);
  });
  let completed = 0;
  const first = request('/notion/pending-a').then(status => { completed++; return status; });
  const second = request('/notion/pending-b').then(status => { completed++; return status; });
  first.catch(() => {}); second.catch(() => {});
  await bothReady.promise;
  t.mock.timers.tick(29999);
  await nextTurn();
  assert.equal(completed, 0);
  assert.ok(signals.every(signal => !signal.aborted));
  t.mock.timers.tick(1);
  assert.deepEqual(await Promise.all([first, second]), [504, 504]);
  assert.ok(signals.every(signal => signal.aborted));
  assert.equal(await request('/notion/complete'), 200);
});
