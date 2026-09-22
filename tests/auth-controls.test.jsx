import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Blog from '../src/components/Blog';
import BlogDetail from '../src/components/BlogDetail';
import { api, fetchCategories, fetchComments, fetchPost, fetchPosts } from '../src/api/api';
import { getCurrentUser, isAuthenticated, login, logout } from '../src/api/auth';

vi.mock('../src/api/api', async importOriginal => ({
  ...await importOriginal(),
  fetchPost: vi.fn(),
  fetchPosts: vi.fn(),
  fetchComments: vi.fn(),
  fetchCategories: vi.fn(),
}));

let container;
let root;

function encode(value) {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function token({ exp, role = 'USER', sub = 'editorial-admin' }) {
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp, role, sub })}.fixture-signature`;
}

function button(name) {
  return [...container.querySelectorAll('button')].find(candidate => candidate.textContent.trim() === name);
}

async function mountDetail() {
  await act(() => root.render(
    <MemoryRouter initialEntries={['/blog/56']}>
      <Routes><Route path="/blog/:id" element={<BlogDetail />} /></Routes>
    </MemoryRouter>,
  ));
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  fetchPost.mockResolvedValue({ data: {
    id: 56,
    title: 'OpenStack article',
    content: 'Verified body.',
    author: 'editorial-admin',
    category: 'Work Experience',
    createdAt: '2024-07-09T09:32:35.958',
    updatedAt: '2026-09-14T10:33:25.74607',
  } });
  fetchComments.mockResolvedValue({ data: { comments: [] } });
  fetchCategories.mockResolvedValue({ data: [] });
  fetchPosts.mockResolvedValue({ data: { posts: [], total: 0 } });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

test('an expired or malformed access token has no current user', () => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) - 1 }));
  expect(isAuthenticated()).toBe(false);
  expect(getCurrentUser()).toBeNull();

  localStorage.setItem('accessToken', 'not-a-jwt');
  expect(isAuthenticated()).toBe(false);
  expect(getCurrentUser()).toBeNull();
});

test('an expired author token does not expose post edit controls', async () => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) - 1 }));
  await mountDetail();
  expect(button('수정')).toBeUndefined();
  expect(button('삭제')).toBeUndefined();
});

test('same-tab login exposes controls for the valid post author without remounting', async () => {
  await mountDetail();
  expect(button('수정')).toBeUndefined();

  const accessToken = token({ exp: Math.floor(Date.now() / 1000) + 600 });
  vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { accessToken } });
  await act(() => login('editorial-admin', 'fixture-password'));

  expect(button('수정')).toBeTruthy();
  expect(button('삭제')).toBeTruthy();
});

test('failed server logout still clears local auth and hides controls in the same tab', async () => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) + 600 }));
  await mountDetail();
  expect(button('수정')).toBeTruthy();

  vi.spyOn(api, 'post').mockRejectedValueOnce(new Error('logout endpoint unavailable'));
  await act(() => logout().catch(() => {}));

  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(button('수정')).toBeUndefined();
  expect(button('삭제')).toBeUndefined();
});

test('failed server logout keeps its warning while switching the index to logged out controls', async () => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) + 600 }));
  await act(() => root.render(<MemoryRouter><Blog /></MemoryRouter>));
  expect(button('로그아웃')).toBeTruthy();

  vi.spyOn(api, 'post').mockRejectedValueOnce(new Error('logout endpoint unavailable'));
  await act(() => button('로그아웃').click());

  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(button('로그인')).toBeTruthy();
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('로그아웃하지 못했습니다.');
});

test('controls disappear when the current author token expires', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-18T00:00:00.000Z'));
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) + 1 }));
  await mountDetail();
  expect(button('수정')).toBeTruthy();

  await act(() => vi.advanceTimersByTime(1001));

  expect(button('수정')).toBeUndefined();
  expect(button('삭제')).toBeUndefined();
});

test.each([
  ['the post author', 'USER', 'editorial-admin'],
  ['an administrator', 'ADMIN', 'another-user'],
])('valid %s keeps post edit controls', async (_label, role, sub) => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) + 600, role, sub }));
  await mountDetail();
  expect(button('수정')).toBeTruthy();
  expect(button('삭제')).toBeTruthy();
});

test('a valid unrelated user cannot see post edit controls', async () => {
  localStorage.setItem('accessToken', token({ exp: Math.floor(Date.now() / 1000) + 600, sub: 'other-user' }));
  await mountDetail();
  expect(button('수정')).toBeUndefined();
  expect(button('삭제')).toBeUndefined();
});
