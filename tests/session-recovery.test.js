import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const post = vi.fn();
const responseHandlers = [];
vi.mock('axios', () => {
  const client = () => ({
    post,
    defaults: {},
    interceptors: {
      request: { use: vi.fn() },
      response: { use: (onOk, onError) => responseHandlers.push({ onOk, onError }) },
    },
  });
  return { default: { create: client } };
});

const futureToken = seconds => 'h.' + btoa(JSON.stringify({ sub: 'editorial-admin', exp: Math.floor(Date.now() / 1000) + seconds })) + '.s';

let auth;
beforeEach(async () => {
  vi.resetModules();
  responseHandlers.length = 0;
  localStorage.clear();
  post.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  auth = await import('../src/api/auth');
});
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

test('an expired access token still tries the refresh cookie instead of forcing a re-login', async () => {
  localStorage.setItem('accessToken', futureToken(-60));
  post.mockResolvedValue({ data: { accessToken: futureToken(1800) } });
  await auth.restoreSession();
  expect(post).toHaveBeenCalledWith('/users/refresh');
  expect(auth.getCurrentUser()?.username).toBe('editorial-admin');
});

test('a visitor who never logged in does not call refresh at all', async () => {
  await expect(auth.restoreSession()).resolves.toBe(false);
  expect(post).not.toHaveBeenCalled();
});

test('a rejected refresh clears local auth without throwing', async () => {
  localStorage.setItem('accessToken', futureToken(-60));
  post.mockRejectedValue({ response: { status: 401 } });
  await expect(auth.restoreSession()).resolves.toBe(false);
  expect(localStorage.getItem('accessToken')).toBe(null);
});

test('a valid access token is kept and no refresh is requested', async () => {
  localStorage.setItem('accessToken', futureToken(1800));
  await auth.restoreSession();
  expect(post).not.toHaveBeenCalled();
});

test('a 401 response refreshes once and replays the original request', async () => {
  const api = await import('../src/api/api');
  const handler = responseHandlers.find(h => h.onError);
  expect(handler).toBeTruthy();
  post.mockResolvedValue({ data: { accessToken: futureToken(1800) } });
  const replay = vi.fn().mockResolvedValue({ data: 'ok' });
  api.api.request = replay;
  const failed = { config: { url: '/posts/57', method: 'put' }, response: { status: 401 } };
  await expect(handler.onError(failed)).resolves.toMatchObject({ data: 'ok' });
  expect(post).toHaveBeenCalledWith('/users/refresh');
  expect(replay).toHaveBeenCalledTimes(1);
});

test('a second 401 on the same request is not retried again', async () => {
  await import('../src/api/api');
  const handler = responseHandlers.find(h => h.onError);
  post.mockResolvedValue({ data: { accessToken: futureToken(1800) } });
  const already = { config: { url: '/posts/57', method: 'put', _retriedAfterRefresh: true }, response: { status: 401 } };
  await expect(handler.onError(already)).rejects.toBe(already);
  expect(post).not.toHaveBeenCalled();
});

test('a 401 from the refresh endpoint itself is not retried', async () => {
  await import('../src/api/api');
  const handler = responseHandlers.find(h => h.onError);
  const refreshFailure = { config: { url: '/users/refresh', method: 'post' }, response: { status: 401 } };
  await expect(handler.onError(refreshFailure)).rejects.toBe(refreshFailure);
  expect(post).not.toHaveBeenCalled();
});
