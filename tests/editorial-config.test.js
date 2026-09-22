// @vitest-environment node
import { afterEach, expect, test, vi } from 'vitest';
import configExport from '../vite.config.js';

const config = mode => typeof configExport === 'function'
  ? configExport({ command: 'serve', mode }) : configExport;
afterEach(() => vi.unstubAllEnvs());

test('editorial mode fixes browser API to same origin and proxies only loopback Spring', () => {
  vi.stubEnv('VITE_API_URL', '');
  vi.stubEnv('EDITORIAL_API_TARGET', '');
  const result = config('editorial');
  expect(result.server.host).toBe('127.0.0.1');
  expect(result.server.proxy['/api'].target).toBe('http://127.0.0.1:8100');
  expect(Object.keys(result.server.proxy)).toEqual(['/api/chat', '/api']);
  expect(result.server.proxy['/api/chat'].target).toBe('http://127.0.0.1:8000');
  expect(result.server.proxy['/api/chat'].followRedirects).toBe(false);
  expect(result.define['import.meta.env.VITE_API_URL']).toBe('""');
});

test.each(['https://example.com', 'http://localhost.example.com:8100', 'http://192.0.2.1:8100', 'file:///tmp/api', 'http://user:pass@127.0.0.1:8100', 'http://127.0.0.1:8100/api'])('editorial mode rejects unsafe target %s', target => {
  vi.stubEnv('EDITORIAL_API_TARGET', target);
  expect(() => config('editorial')).toThrow(/loopback|로컬|origin/i);
});

test('editorial mode refuses a stale remote VITE_API_URL', () => {
  vi.stubEnv('EDITORIAL_API_TARGET', 'http://127.0.0.1:8100');
  vi.stubEnv('VITE_API_URL', 'https://example.com');
  expect(() => config('editorial')).toThrow(/VITE_API_URL/);
});

test.each(['https://example.com', 'http://192.0.2.1:8000', 'http://user:pass@127.0.0.1:8000', 'http://127.0.0.1:8000/chat'])('RAG proxy refuses remote or credential-bearing origin %s', target => {
  vi.stubEnv('RAG_API_TARGET', target);
  expect(() => config('editorial')).toThrow(/RAG_API_TARGET/);
});

test.each(['http://127.0.0.1:8101', 'http://localhost:8100', 'http://[::1]:8100'])('editorial mode accepts explicit loopback origin %s', target => {
  vi.stubEnv('EDITORIAL_API_TARGET', target);
  vi.stubEnv('VITE_API_URL', '');
  expect(config('editorial').server.proxy['/api'].target).toBe(target);
});
