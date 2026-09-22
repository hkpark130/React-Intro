import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import CreatePost from '../src/components/CreatePost';
import EditPost from '../src/components/EditPost';
import { createPost, fetchCategories, fetchPost, updatePost } from '../src/api/api';

vi.mock('../src/api/api', () => ({ createPost: vi.fn(), fetchCategories: vi.fn(), fetchPost: vi.fn(), updatePost: vi.fn() }));
vi.mock('../src/components/markdown/MarkdownEditor', () => ({ default: ({ value, onChange }) => <textarea aria-label="Fixture markdown editor" value={value} onChange={event => onChange(event.target.value)} /> }));
let container, root;
function Location() { const location = useLocation(); return <output>{location.pathname + location.search}</output>; }
const fill = (element, value) => act(() => {
  const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
});
const submit = () => act(() => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
beforeEach(() => {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  fetchCategories.mockResolvedValue({ data: [{ id: 9, name: 'Work Experience' }] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.clearAllMocks(); });

test('create submits the title, untouched markdown and category through the existing API', async () => {
  createPost.mockResolvedValue({ data: {} });
  await act(() => root.render(<MemoryRouter initialEntries={['/blog/create']}><Routes><Route path="/blog/create" element={<CreatePost />} /><Route path="/blog" element={<Location />} /></Routes></MemoryRouter>));
  await fill(container.querySelector('#post-title'), '운영 경험');
  await fill(container.querySelector('textarea'), '# 결과\n\n```bash\necho fixture\n```');
  await submit();
  expect(createPost).toHaveBeenCalledWith({ title: '운영 경험', content: '# 결과\n\n```bash\necho fixture\n```', categoryId: 9 });
  expect(container.querySelector('output')?.textContent).toBe('/blog');
});

test('edit keeps loaded markdown and returns to the same article query after saving', async () => {
  fetchPost.mockResolvedValue({ data: { title: '기존 기록', content: '## 본문\n\n원본 *강조*', category: 'Work Experience' } });
  updatePost.mockResolvedValue({ data: {} });
  await act(() => root.render(<MemoryRouter initialEntries={['/blog/edit/112?page=2&search=OpenStack']}><Routes><Route path="/blog/edit/:id" element={<EditPost />} /><Route path="/blog/:id" element={<Location />} /></Routes></MemoryRouter>));
  expect(container.querySelector('textarea').value).toBe('## 본문\n\n원본 *강조*');
  await fill(container.querySelector('#post-title'), '다듬은 기록');
  await submit();
  expect(updatePost).toHaveBeenCalledWith('112', { title: '다듬은 기록', content: '## 본문\n\n원본 *강조*', categoryId: 9 });
  expect(container.querySelector('output')?.textContent).toBe('/blog/112?page=2&search=OpenStack');
});

test('a failed save leaves the draft available with an actionable error', async () => {
  createPost.mockRejectedValue(new Error('fixture save failure'));
  await act(() => root.render(<MemoryRouter><CreatePost /></MemoryRouter>));
  await fill(container.querySelector('#post-title'), '보존할 제목');
  await fill(container.querySelector('textarea'), '보존할 본문');
  await submit();
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('다시 시도');
  expect(container.querySelector('#post-title').value).toBe('보존할 제목');
  expect(container.querySelector('textarea').value).toBe('보존할 본문');
});

test('edit sends the loaded version and preserves writing when another editor saved first', async () => {
  const updatedAt = '2026-09-14T10:00:00.123456';
  fetchPost.mockResolvedValue({ data: { title: '원본 제목', content: '원본 본문', category: 'Work Experience', updatedAt } });
  updatePost.mockRejectedValue({ response: { status: 409, data: { code: 'POST_EDIT_CONFLICT' } } });
  await act(() => root.render(<MemoryRouter initialEntries={['/blog/edit/112']}><Routes><Route path="/blog/edit/:id" element={<EditPost />} /></Routes></MemoryRouter>));
  await fill(container.querySelector('textarea'), '내가 작성 중인 본문');
  await submit();
  expect(updatePost).toHaveBeenCalledWith('112', { title: '원본 제목', content: '내가 작성 중인 본문', categoryId: 9, expectedUpdatedAt: updatedAt });
  expect(container.querySelector('textarea').value).toBe('내가 작성 중인 본문');
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('다른 창');
  expect(container.querySelector('[role="alert"]')?.textContent).toContain('복사');
});

const validationErrors = [
  { status: 400, code: 'INVALID_POST_TITLE', explanation: '255자' },
  { status: 400, code: 'INVALID_POST_CONTENT', explanation: '본문 내용을 입력' },
  { status: 413, code: 'POST_CONTENT_TOO_LARGE', explanation: '1MiB' },
  { status: 400, code: 'INVALID_POST_CATEGORY', explanation: '다른 카테고리' },
];
const modes = ['create', 'edit'];
const draft = { title: '보존할 제목 🙂', content: '## 보존할 본문\n\n<CodeAccordion title="예제">const text = "한글";</CodeAccordion>', categoryId: 9 };
const loadedVersion = '2026-09-14T10:00:00.123456';
const renderComposer = async (mode) => {
  fetchPost.mockResolvedValue({ data: { title: '원본 제목', content: '원본 본문', category: 'Work Experience', updatedAt: loadedVersion } });
  await act(() => root.render(<MemoryRouter initialEntries={[mode === 'edit' ? '/blog/edit/112' : '/blog/create']}><Routes>
    <Route path="/blog/create" element={<CreatePost />} /><Route path="/blog/edit/:id" element={<EditPost />} />
    <Route path="/blog" element={<Location />} /><Route path="/blog/:id" element={<Location />} />
  </Routes></MemoryRouter>));
  await fill(container.querySelector('#post-title'), draft.title);
  await fill(container.querySelector('textarea'), draft.content);
};

test.each(modes.flatMap(mode => validationErrors.map(error => ({ mode, ...error }))))(
  '$mode explains $code and preserves the draft and version for retry',
  async ({ mode, status, code, explanation }) => {
    const save = mode === 'edit' ? updatePost : createPost;
    save.mockRejectedValueOnce({ response: { status, data: { code, error: 'raw server detail must stay hidden' } } }).mockResolvedValueOnce({ data: {} });
    await renderComposer(mode);
    await submit();
    const alert = container.querySelector('[role="alert"]').textContent;
    expect(alert).toContain(explanation);
    expect(alert).not.toContain('raw server detail');
    expect(container.querySelector('#post-title').value).toBe(draft.title);
    expect(container.querySelector('textarea').value).toBe(draft.content);
    expect(container.querySelector('input[name="categoryId"]').value).toBe('9');
    expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
    expect(container.querySelector('output')).toBeNull();
    await submit();
    expect(save).toHaveBeenCalledTimes(2);
    if (mode === 'edit') expect(save).toHaveBeenLastCalledWith('112', { ...draft, expectedUpdatedAt: loadedVersion });
    else expect(save).toHaveBeenLastCalledWith(draft);
    expect(container.querySelector('output').textContent).toBe(mode === 'edit' ? '/blog/112' : '/blog');
  },
);

const unexpectedErrors = [
  { label: 'unknown validation code', response: { status: 400, data: { code: 'UNKNOWN', error: 'raw server detail' } } },
  { label: 'uncoded payload rejection', response: { status: 413, data: { error: 'raw server detail' } } },
  { label: 'known code with the wrong status', response: { status: 500, data: { code: 'INVALID_POST_TITLE', error: 'raw server detail' } } },
  { label: 'raw internal failure', response: { status: 500, data: 'An error occurred: raw server detail' } },
];
test.each(modes.flatMap(mode => unexpectedErrors.map(error => ({ mode, ...error }))))(
  '$mode uses a safe fallback for $label without losing input',
  async ({ mode, response }) => {
    const save = mode === 'edit' ? updatePost : createPost;
    save.mockRejectedValueOnce({ response });
    await renderComposer(mode);
    await submit();
    const alert = container.querySelector('[role="alert"]').textContent;
    expect(alert).toContain(mode === 'edit' ? '게시글을 수정하는 중 오류' : '게시글을 저장하는 중 오류');
    expect(alert).toContain('다시 시도');
    expect(alert).not.toMatch(/raw server detail|An error occurred|255자/);
    expect(container.querySelector('#post-title').value).toBe(draft.title);
    expect(container.querySelector('textarea').value).toBe(draft.content);
    expect(container.querySelector('input[name="categoryId"]').value).toBe('9');
  },
);

test.each(modes)('%s title input declares the 255 UTF-16 limit and submits a boundary title intact', async (mode) => {
  const save = mode === 'edit' ? updatePost : createPost;
  save.mockResolvedValueOnce({ data: {} });
  await renderComposer(mode);
  const title = '가'.repeat(253) + '🙂';
  const input = container.querySelector('#post-title');
  expect(title.length).toBe(255);
  expect(input.maxLength).toBe(255);
  await fill(input, title);
  await submit();
  if (mode === 'edit') expect(save).toHaveBeenCalledWith('112', { ...draft, title, expectedUpdatedAt: loadedVersion });
  else expect(save).toHaveBeenCalledWith({ ...draft, title });
});
