import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import CreatePost from '../src/components/CreatePost';
import EditPost from '../src/components/EditPost';
import { readDraft, writeDraft, clearDraft, draftKey } from '../src/components/postDraft';
import { createPost, fetchCategories, fetchPost } from '../src/api/api';

vi.mock('../src/api/api', () => ({ createPost: vi.fn(), fetchCategories: vi.fn(), fetchPost: vi.fn(), updatePost: vi.fn() }));
vi.mock('../src/components/markdown/MarkdownEditor', () => ({ default: ({ value, onChange }) => <textarea aria-label="Fixture markdown editor" value={value} onChange={event => onChange(event.target.value)} /> }));

let container, root;
const fill = (element, value) => act(() => {
  const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
});
const submit = () => act(() => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
const click = text => act(() => [...container.querySelectorAll('button')].find(b => b.textContent.includes(text)).click());

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  fetchCategories.mockResolvedValue({ data: [{ id: 9, name: 'Work Experience' }] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.clearAllMocks(); localStorage.clear(); });

const renderCreate = () => act(() => root.render(
  <MemoryRouter initialEntries={['/blog/create']}><Routes><Route path="/blog/create" element={<CreatePost />} /><Route path="/blog" element={<span>목록</span>} /></Routes></MemoryRouter>));
const renderEdit = () => act(() => root.render(
  <MemoryRouter initialEntries={['/blog/edit/112']}><Routes><Route path="/blog/edit/:id" element={<EditPost />} /><Route path="/blog/:id" element={<span>본문</span>} /></Routes></MemoryRouter>));

test('typing in the composer keeps a draft in localStorage', async () => {
  await renderCreate();
  await fill(container.querySelector('#post-title'), '작성 중인 제목');
  await fill(container.querySelector('textarea'), '아직 저장하지 않은 본문');
  expect(readDraft(draftKey('create'))).toMatchObject({ title: '작성 중인 제목', content: '아직 저장하지 않은 본문' });
});

test('a saved draft is offered for restore instead of overwriting the loaded post', async () => {
  writeDraft(draftKey('edit', '112'), { title: '복구할 제목', content: '복구할 본문', categoryId: 9 });
  fetchPost.mockResolvedValue({ data: { title: '서버 제목', content: '서버 본문', category: 'Work Experience', updatedAt: '2026-09-21T00:00:00' } });
  await renderEdit();
  expect(container.querySelector('textarea').value).toBe('서버 본문');
  expect(container.textContent).toContain('작성 중이던 내용');
  await click('복구');
  expect(container.querySelector('textarea').value).toBe('복구할 본문');
  expect(container.querySelector('#post-title').value).toBe('복구할 제목');
});

test('discarding the offer keeps the server content and removes the draft', async () => {
  writeDraft(draftKey('edit', '112'), { title: '버릴 제목', content: '버릴 본문', categoryId: 9 });
  fetchPost.mockResolvedValue({ data: { title: '서버 제목', content: '서버 본문', category: 'Work Experience', updatedAt: '2026-09-21T00:00:00' } });
  await renderEdit();
  await click('버리기');
  expect(container.querySelector('textarea').value).toBe('서버 본문');
  expect(readDraft(draftKey('edit', '112'))).toBe(null);
});

test('a successful save clears the draft', async () => {
  createPost.mockResolvedValue({ data: {} });
  await renderCreate();
  await fill(container.querySelector('#post-title'), '게시할 제목');
  await fill(container.querySelector('textarea'), '게시할 본문');
  expect(readDraft(draftKey('create'))).not.toBe(null);
  await submit();
  expect(readDraft(draftKey('create'))).toBe(null);
});

test('a failed save keeps both the typed content and the draft', async () => {
  createPost.mockRejectedValue({ response: { status: 401 } });
  await renderCreate();
  await fill(container.querySelector('#post-title'), '만료된 세션');
  await fill(container.querySelector('textarea'), '날아가면 안 되는 본문');
  await submit();
  expect(container.querySelector('textarea').value).toBe('날아가면 안 되는 본문');
  expect(readDraft(draftKey('create'))).toMatchObject({ content: '날아가면 안 되는 본문' });
});

test('draft helpers survive unavailable storage', () => {
  const failing = () => { throw new Error('storage disabled'); };
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
  Object.defineProperty(window, 'localStorage', { configurable: true, get: failing });
  expect(() => writeDraft('k', { title: 'x', content: 'y', categoryId: 1 })).not.toThrow();
  expect(readDraft('k')).toBe(null);
  expect(() => clearDraft('k')).not.toThrow();
  Object.defineProperty(window, 'localStorage', original);
});
