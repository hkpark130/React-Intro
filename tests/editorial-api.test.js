import { afterEach, expect, test, vi } from 'vitest';

afterEach(() => { localStorage.removeItem('accessToken'); localStorage.removeItem('notion.apiKey'); vi.unstubAllEnvs(); vi.resetModules(); });

test('Notion authoring sends blog authorization and removes the legacy browser key', async () => {
  vi.stubEnv('MODE', 'production');
  localStorage.setItem('accessToken', 'fixture-access-token');
  localStorage.setItem('notion.apiKey', 'fixture-obsolete-browser-key');
  const { notionApi, notionConvert } = await import('../src/api/api.js');
  notionApi.defaults.adapter = async config => ({ data: { markdown: 'test' }, status: 200, statusText: 'OK', headers: {}, config });
  const response = await notionConvert({ pageId: '11111111111141118111111111111111' });
  expect(response.config.headers.Authorization).toBe('Bearer fixture-access-token');
  expect(response.config.headers['x-notion-api-key']).toBeUndefined();
  expect(localStorage.getItem('notion.apiKey')).toBeNull();
  localStorage.removeItem('accessToken');
});

test('editorial post requests use the relative API even with a stale browser environment', async () => {
  vi.stubEnv('MODE', 'editorial');
  vi.stubEnv('VITE_API_URL', 'https://example.com');
  const { api, fetchPosts } = await import('../src/api/api.js');
  api.defaults.adapter = async config => ({ data: { posts: [], total: 0 }, status: 200, statusText: 'OK', headers: {}, config });
  const response = await fetchPosts(0, 10, '한글');
  expect(api.getUri(response.config)).toBe('/api/posts?offset=0&limit=10&search=%ED%95%9C%EA%B8%80');
  expect(response.data).toEqual({ posts: [], total: 0 });
});

test('editorial Notion import is rejected before it reaches the network adapter', async () => {
  vi.stubEnv('MODE', 'editorial');
  const { notionApi, notionConvert } = await import('../src/api/api.js');
  const network = vi.fn();
  notionApi.defaults.adapter = network;
  await expect(notionConvert({ pageId: 'local-example' })).rejects.toThrow(/로컬 편집 모드/);
  expect(network).not.toHaveBeenCalled();
});

test('chat uses same origin with a deadline and no blog Authorization header', async () => {
  vi.stubEnv('MODE', 'production');
  vi.stubEnv('VITE_API_URL', 'https://example.com');
  localStorage.setItem('accessToken', 'fixture-access-token');
  const { chatApi, sendChatMessage } = await import('../src/api/api.js');
  chatApi.defaults.adapter = async config => ({ data: { answer: '관련 글', sources: [] }, status: 200, statusText: 'OK', headers: {}, config });
  const response = await sendChatMessage('JWT');
  expect(chatApi.getUri(response.config)).toBe('/api/chat');
  expect(response.config.headers.Authorization).toBeUndefined();
  expect(response.config.timeout).toBe(65000);
});
