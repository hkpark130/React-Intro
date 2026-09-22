import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Blog from '../src/components/Blog';
import { fetchPosts, fetchCategories } from '../src/api/api';

vi.mock('../src/api/api', async importOriginal => ({
  ...await importOriginal(), fetchPosts: vi.fn(), fetchCategories: vi.fn(),
}));
let container, root, navigate;
function NavigationHandle() {
  navigate = useNavigate();
  const location = useLocation();
  return <output data-location>{location.pathname}{location.search}</output>;
}
const post = (id, title) => ({ id, title, content: 'A real article introduction.', author: 'editor', category: 'Work Experience', createdAt: '2026-07-22', commentCount: 2 });
const mount = (path = '/blog') => act(() => root.render(<MemoryRouter initialEntries={[path]}><NavigationHandle /><Routes><Route path="/blog" element={<Blog />} /><Route path="/blog/:id" element={<h1>Article page</h1>} /></Routes></MemoryRouter>));
beforeEach(() => {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  fetchCategories.mockResolvedValue({ data: [{ id: 3, name: 'Work Experience' }, { id: 4, name: 'ETC' }] });
  fetchPosts.mockResolvedValue({ data: { posts: [post(112, 'VM traffic')], total: 40 } });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.clearAllMocks(); });

test('article and pagination links retain the submitted search, category, and requested page', async () => {
  await mount('/blog?page=3&search=VM&categoryId=3');
  expect(fetchPosts).toHaveBeenLastCalledWith(20, 10, 'VM', '3');
  const article = [...container.querySelectorAll('a')].find(link => link.textContent.includes('VM traffic'));
  expect(article?.getAttribute('href')).toBe('/blog/112?page=3&fromSearch=VM&categoryId=3');
  const pageFour = container.querySelector('a[aria-label="Go to page 4"]');
  expect(pageFour?.getAttribute('href')).toBe('/blog?page=4&search=VM&categoryId=3');
});

test.each([
  ['/blog', '?page=1'],
  ['/blog?page=3&search=VM&categoryId=3', '?page=3&fromSearch=VM&categoryId=3'],
])('titles and introductions share one article link and preserve navigation from %s', async (path, articleQuery) => {
  fetchPosts.mockResolvedValue({ data: { posts: [
    post(112, 'VM traffic'),
    { ...post(108, 'Second article'), content: 'An introduction with a [reference](/blog/12).' },
  ], total: 40 } });
  await mount(path);

  const articles = [...container.querySelectorAll('article')];
  expect(articles).toHaveLength(2);
  articles.forEach(article => {
    const links = article.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(article.querySelector('h3').closest('a')).toBe(links[0]);
    expect(article.querySelector('p').closest('a')).toBe(links[0]);
    expect(links[0].querySelector('a')).toBeNull();
  });
  expect(articles[1].querySelector('p').textContent).toBe('An introduction with a reference.');
  expect(container.textContent).not.toContain('글 읽기');

  await act(() => articles[1].querySelector('p').click());
  expect(container.querySelector('[data-location]').textContent).toBe(`/blog/108${articleQuery}`);
  await act(() => navigate(-1));
  expect(container.querySelector('[data-location]').textContent).toBe(path);

  await act(() => container.querySelector('article h3').click());
  expect(container.querySelector('[data-location]').textContent).toBe(`/blog/112${articleQuery}`);
});

test('renders the first post with the same ordinary article presentation as every other post', async () => {
  fetchPosts.mockResolvedValue({ data: { posts: [
    post(112, 'VM traffic'),
    post(108, 'Second article'),
  ], total: 2 } });
  await mount('/blog');

  expect(container.querySelector('.blog-feature')).toBeNull();
  expect(container.querySelector('.blog-recent-label')).toBeNull();
  expect([...container.querySelectorAll('.blog-post-list > article')].map(article => article.className)).toEqual(['blog-entry', 'blog-entry']);
  expect([...container.querySelectorAll('.blog-entry h3')].map(title => title.className)).toEqual(['', '']);
});

test('changing a category keeps submitted search and returns to the first page', async () => {
  await mount('/blog?page=3&search=VM&categoryId=3');
  const input = container.querySelector('input[type="search"]');
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'unsent draft');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const category = [...container.querySelectorAll('button')].find(button => button.textContent === 'ETC');
  await act(() => category?.click());
  expect(container.querySelector('[data-location]').textContent).toBe('/blog?page=1&search=VM&categoryId=4');
  expect(fetchPosts).toHaveBeenLastCalledWith(0, 10, 'VM', '4');
});

test('submitting search resets pagination while retaining its category', async () => {
  await mount('/blog?page=3&search=VM&categoryId=3');
  const input = container.querySelector('input[type="search"]');
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Ceph RWX');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(() => container.querySelector('form[role="search"]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(container.querySelector('[data-location]').textContent).toBe('/blog?page=1&search=Ceph+RWX&categoryId=3');
  expect(fetchPosts).toHaveBeenLastCalledWith(0, 10, 'Ceph RWX', '3');
});

test('a slow earlier list response cannot replace newer category results', async () => {
  let resolveOld;
  fetchPosts.mockImplementation((_offset, _limit, _search, category) => category === '3'
    ? new Promise(resolve => { resolveOld = resolve; })
    : Promise.resolve({ data: { posts: [post(108, 'Current result')], total: 1 } }));
  await mount('/blog?categoryId=3');
  await act(() => navigate('/blog?categoryId=4'));
  await act(() => resolveOld({ data: { posts: [post(111, 'Stale result')], total: 1 } }));
  expect(container.textContent).toContain('Current result');
  expect(container.textContent).not.toContain('Stale result');
});

test('a failed search can retry without dropping its URL filters', async () => {
  fetchPosts.mockRejectedValueOnce(new Error('Read failure')).mockResolvedValue({ data: { posts: [post(112, 'Recovered result')], total: 1 } });
  await mount('/blog?page=2&search=VM&categoryId=3');
  expect(container.querySelector('[data-location]').textContent).toBe('/blog?page=2&search=VM&categoryId=3');
  const retry = [...container.querySelectorAll('button')].find(button => button.textContent === '다시 시도');
  await act(() => retry?.click());
  expect(container.textContent).toContain('Recovered result');
  expect(fetchPosts).toHaveBeenLastCalledWith(10, 10, 'VM', '3');
});
