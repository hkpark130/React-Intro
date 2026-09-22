import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import BlogDetail from '../src/components/BlogDetail';
import { fetchPost, fetchComments, fetchCategories } from '../src/api/api';

vi.mock('../src/api/api', async importOriginal => ({
  ...await importOriginal(), fetchPost: vi.fn(), fetchComments: vi.fn(), fetchCategories: vi.fn(),
}));
let container, root, navigate;
function NavigationHandle() { navigate = useNavigate(); return null; }
const post = (id, title) => ({ id, title, content: 'Verified article body.', author: 'editorial-admin', category: 'ETC', createdAt: '2026-09-11T00:00:00', updatedAt: '2026-09-11T00:00:00' });
const mount = () => act(() => root.render(<MemoryRouter initialEntries={['/blog/112']}><NavigationHandle /><Routes><Route path="/blog/:id" element={<BlogDetail />} /></Routes></MemoryRouter>));
beforeEach(() => {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  vi.stubEnv('MODE', 'editorial');
  fetchCategories.mockResolvedValue({ data: [] });
  fetchComments.mockResolvedValue({ data: { comments: [] } });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.clearAllMocks(); vi.unstubAllEnvs(); });

test('comment GET failure leaves the fetched article visible with a separate warning', async () => {
  fetchPost.mockResolvedValue({ data: post(112, 'Readable article') });
  fetchComments.mockRejectedValue(new Error('Local comment failure fixture'));
  await mount();
  expect(container.querySelector('h1')?.textContent).toBe('Readable article');
  expect(container.querySelector('.markdown-body')?.textContent).toContain('Verified article body.');
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('댓글');
  expect(container.textContent).not.toContain('아직 댓글이 없습니다.');
});

test('an older article response cannot overwrite the next route', async () => {
  let resolveFirst;
  const first = new Promise(resolve => { resolveFirst = resolve; });
  fetchPost.mockImplementation(id => id === '112' ? first : Promise.resolve({ data: post(111, 'Second article') }));
  await mount();
  await act(() => navigate('/blog/111'));
  expect(container.querySelector('h1')?.textContent).toBe('Second article');
  await act(() => resolveFirst({ data: post(112, 'Stale first article') }));
  expect(container.querySelector('h1')?.textContent).toBe('Second article');
});

test('article GET failure remains a page error and does not request comments', async () => {
  fetchPost.mockRejectedValue(new Error('Local article failure fixture'));
  await mount();
  expect(container.querySelector('.markdown-body')).toBeNull();
  expect(container.textContent).toContain('게시글을 불러올 수 없습니다.');
  expect(fetchComments).not.toHaveBeenCalled();
});

test('an older comments response cannot populate the next article', async () => {
  let resolveComments;
  const firstComments = new Promise(resolve => { resolveComments = resolve; });
  fetchPost.mockImplementation(id => Promise.resolve({ data: post(Number(id), id === '112' ? 'First article' : 'Second article') }));
  fetchComments.mockImplementation(id => id === '112' ? firstComments : Promise.resolve({ data: { comments: [] } }));
  await mount();
  await act(() => navigate('/blog/111'));
  await act(() => resolveComments({ data: { comments: [{ id: 1, content: 'Stale comment', author: 'Fixture', createdAt: '2026-09-11T00:00:00' }] } }));
  expect(container.querySelector('h1')?.textContent).toBe('Second article');
  expect(container.textContent).not.toContain('Stale comment');
});

test('table of contents links resolve to rendered duplicate headings and expand folded sections', async () => {
  fetchPost.mockResolvedValue({ data: { ...post(112, 'Article with sections'), content: 'Opening paragraph.\n\n## 같은 제목\n\nFirst section.\n\n<details><summary>추가 내용</summary>\n\n## 같은 제목\n\nFolded content.\n\n</details>' } });
  await mount();
  const links = [...container.querySelectorAll('nav[aria-label="이 글의 목차"] ol a')];
  expect(links).toHaveLength(2);
  expect(links[0].hash).not.toBe(links[1].hash);
  for (const link of links) expect(document.getElementById(decodeURIComponent(link.hash.slice(1)))?.textContent).toBe('같은 제목');
  await act(() => links[1].click());
  expect(container.querySelector('details').open).toBe(true);
});
