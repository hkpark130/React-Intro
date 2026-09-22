import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import process from 'node:process';
import { createSpringClient, fetchBlogPost, resolveRuntimeConfig } from '../src/runtime.js';

async function localServer(t, handler) {
  const server = http.createServer(handler).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('editorial defaults are loopback and remote or ambiguous settings fail closed', () => {
  const config = resolveRuntimeConfig({ SSR_MODE: 'editorial' });
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.springBase, 'http://127.0.0.1:8100');
  for (const springBase of ['https://example.com', 'http://127.0.0.1:8100/api', 'http://user:pass@127.0.0.1:8100', 'http://localhost.example.com', 'file:///tmp/blog']) {
    assert.throws(() => resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase }));
  }
  assert.throws(() => resolveRuntimeConfig({ SSR_MODE: 'editroial' }));
});

test('redirect responses are rejected without reaching even a loopback destination', async t => {
  let reached = 0;
  const destination = await localServer(t, (req, res) => { reached++; res.end('{"id":112}'); });
  const springBase = await localServer(t, (req, res) => { res.writeHead(302, { Location: destination }); res.end(); });
  const client = createSpringClient(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase }));
  await assert.rejects(fetchBlogPost(client, '112'));
  assert.equal(reached, 0);
});

test('editorial Spring requests ignore proxy environment variables', async t => {
  let proxied = 0;
  const proxy = await localServer(t, (req, res) => { proxied++; res.end('{"id":999}'); });
  const springBase = await localServer(t, (req, res) => { res.setHeader('Content-Type', 'application/json'); res.end('{"id":112}'); });
  const keys = ['HTTP_PROXY', 'http_proxy', 'HTTPS_PROXY', 'https_proxy', 'ALL_PROXY', 'all_proxy', 'NO_PROXY', 'no_proxy'];
  const old = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  try {
    for (const key of keys) process.env[key] = key.toLowerCase() === 'no_proxy' ? '' : proxy;
    const client = createSpringClient(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase }));
    assert.deepEqual(await fetchBlogPost(client, '112'), { id: 112 });
    assert.equal(proxied, 0);
  } finally {
    for (const key of keys) { if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key]; }
  }
});

test('invalid IDs fail before requesting another Spring route', async t => {
  let requests = 0;
  const springBase = await localServer(t, (req, res) => { requests++; res.end('{}'); });
  const client = createSpringClient(resolveRuntimeConfig({ SSR_MODE: 'editorial', SPRING_BASE: springBase }));
  for (const id of ['../categories', '112?other=1', '-1', 'abc']) await assert.rejects(fetchBlogPost(client, id));
  assert.equal(requests, 0);
});
