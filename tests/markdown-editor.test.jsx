import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import MarkdownEditor from '../src/components/markdown/MarkdownEditor';
import { notionApi, notionConvert } from '../src/api/api';
import { parseAttributes, prepareMarkdown } from '../src/components/markdown/prepareMarkdown';

vi.mock('../src/api/api', () => ({ notionApi: { get: vi.fn() }, notionConvert: vi.fn() }));
let root, container, replaceDraft;
const pageId = '0123456789abcdef0123456789abcdef';
const sourceId = '11111111222233334444555555555555';
function Harness({ initial = '' }) {
  const [value, setValue] = useState(initial);
  replaceDraft = setValue;
  return <MarkdownEditor value={value} onChange={setValue} />;
}
const render = initial => act(() => root.render(<Harness initial={initial} />));
const editor = () => container.querySelector('textarea[aria-label="게시글 Markdown 본문"]');
const button = (label, scope = document) => [...scope.querySelectorAll('button')].find(element => element.textContent.replace(/[↶↷]/g, '').trim() === label);
const click = element => act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); await Promise.resolve(); });
const choose = (start, end = start, direction = 'none') => act(() => {
  editor().focus(); editor().setSelectionRange(start, end, direction);
  editor().dispatchEvent(new Event('select', { bubbles: true }));
  document.dispatchEvent(new Event('selectionchange'));
});
const fill = (element, value, { inputType = 'insertText', isComposing = false, caret = value.length } = {}) => act(() => {
  element.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType, isComposing }));
  const prototype = element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
  element.setSelectionRange(caret, caret);
  element.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, isComposing }));
});
const key = (keyName, options = {}) => act(() => editor().dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, ...options })));
const finishDialog = () => act(() => new Promise(resolve => setTimeout(resolve, 250)));

beforeEach(() => {
  vi.stubEnv('MODE', 'editorial');
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount()); container.remove(); vi.clearAllMocks(); vi.restoreAllMocks(); vi.unstubAllEnvs();
});

test('formatting, undo and redo preserve the Korean selection and do not submit a parent form', async () => {
  const submit = vi.fn(event => event.preventDefault());
  await act(() => root.render(<form onSubmit={submit}><Harness initial="앞 한글 뒤" /></form>));
  await choose(2, 4, 'backward');
  await click(button('굵게', container));
  expect(editor().value).toBe('앞 **한글** 뒤');
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([4, 6, 'backward']);
  await key('z', { ctrlKey: true });
  expect(editor().value).toBe('앞 한글 뒤');
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([2, 4, 'backward']);
  await key('z', { ctrlKey: true, shiftKey: true });
  expect(editor().value).toBe('앞 **한글** 뒤');
  expect(submit).not.toHaveBeenCalled();
});

test('the color palette applies one undoable text color and restores the selected range', async () => {
  await render('앞 선택 뒤');
  await choose(2, 4, 'backward');
  await click(button('색상', container));
  const palette = document.querySelector('[role="dialog"][aria-label="색상 선택"]');
  expect(palette).not.toBeNull();
  await click(button('글자색 빨강', palette));
  await finishDialog();
  expect(editor().value).toBe('앞 <span data-text-color="red">선택</span> 뒤');
  const selectedStart = editor().value.indexOf('선택');
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([selectedStart, selectedStart + 2, 'backward']);
  await click(button('색상', container));
  expect(button('글자색 빨강', document.querySelector('[role="dialog"][aria-label="색상 선택"]')).getAttribute('aria-pressed')).toBe('true');
  await act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await finishDialog();
  await click(button('실행 취소', container));
  expect(editor().value).toBe('앞 선택 뒤');
});

test('canceling the color palette with Escape restores focus and the original selection', async () => {
  await render('앞 선택 뒤');
  await choose(2, 4, 'backward');
  await click(button('색상', container));
  await act(() => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  await finishDialog();
  expect(document.querySelector('[role="dialog"][aria-label="색상 선택"]')).toBeNull();
  expect(document.activeElement).toBe(editor());
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([2, 4, 'backward']);
});

test('background color and default removal are separate undoable edits', async () => {
  await render('선택');
  await choose(0, 2);
  await click(button('색상', container));
  await click(button('배경색 노랑', document.querySelector('[role="dialog"][aria-label="색상 선택"]')));
  await finishDialog();
  const highlighted = '<span data-background-color="yellow">선택</span>';
  expect(editor().value).toBe(highlighted);
  await click(button('색상', container));
  const palette = document.querySelector('[role="dialog"][aria-label="색상 선택"]');
  expect(button('배경색 노랑', palette).getAttribute('aria-pressed')).toBe('true');
  await click(button('배경색 기본', palette));
  await finishDialog();
  expect(editor().value).toBe('선택');
  await click(button('실행 취소', container));
  expect(editor().value).toBe(highlighted);
});

test('the searchable toolbox opens the same color palette for the saved selection', async () => {
  await render('선택');
  await choose(0, 2, 'backward');
  await click(button('도구 검색', container));
  const search = document.querySelector('input[aria-label="도구 검색"]');
  await fill(search, '색상');
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
  expect(document.querySelector('[role="dialog"][aria-label="색상 선택"]')).not.toBeNull();
  await click(button('글자색 초록', document.querySelector('[role="dialog"][aria-label="색상 선택"]')));
  await finishDialog();
  expect(editor().value).toBe('<span data-text-color="green">선택</span>');
  expect(editor().selectionDirection).toBe('backward');
});

test('color controls stay disabled while Korean composition is active', async () => {
  await render('');
  await act(() => editor().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' })));
  expect(button('색상', container).disabled).toBe(true);
  await click(button('색상', container));
  expect(document.querySelector('[role="dialog"][aria-label="색상 선택"]')).toBeNull();
  await act(() => editor().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' })));
});

test('native typing and toolbar edits share one history, with branching after undo', async () => {
  await render('앞'); await choose(1);
  await fill(editor(), '앞뒤');
  await fill(editor(), '앞뒤!');
  await choose(0, 1); await click(button('굵게', container));
  expect(editor().value).toBe('**앞**뒤!');
  await click(button('실행 취소', container)); expect(editor().value).toBe('앞뒤!');
  await click(button('실행 취소', container)); expect(editor().value).toBe('앞');
  await click(button('다시 실행', container)); expect(editor().value).toBe('앞뒤!');
  await choose(3); await fill(editor(), '앞뒤!새');
  expect(button('다시 실행', container).disabled).toBe(true);
  await act(() => editor().dispatchEvent(new InputEvent('beforeinput', { inputType: 'historyUndo', bubbles: true, cancelable: true })));
  expect(editor().value).toBe('앞뒤!');
});

test('a Korean composition is one undo step and composing shortcuts leave the IME alone', async () => {
  await render(''); await choose(0);
  await act(() => editor().dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '' })));
  await fill(editor(), 'ㅎ', { inputType: 'insertCompositionText', isComposing: true });
  await fill(editor(), '하', { inputType: 'insertCompositionText', isComposing: true });
  await key('z', { ctrlKey: true, isComposing: true, keyCode: 229 });
  expect(editor().value).toBe('하');
  await fill(editor(), '한', { inputType: 'insertCompositionText', isComposing: true });
  await act(() => editor().dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '한' })));
  await key('z', { ctrlKey: true }); expect(editor().value).toBe('');
  await key('z', { ctrlKey: true, shiftKey: true }); expect(editor().value).toBe('한');
  await fill(editor(), '한글');
  await key('z', { ctrlKey: true }); expect(editor().value).toBe('한');
});

test('canceling a dialog and switching preview restore the original selection', async () => {
  await render('앞 선택 뒤'); await choose(2, 4, 'backward');
  await click(button('링크', container));
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  await fill(document.querySelector('#editor-block-url'), 'https://example.com');
  await click(button('취소')); await finishDialog();
  expect(document.activeElement).toBe(editor());
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([2, 4, 'backward']);
  await click(button('미리보기', container)); await click(button('작성', container));
  expect(document.activeElement).toBe(editor());
  expect([editor().selectionStart, editor().selectionEnd]).toEqual([2, 4]);
  await key('b', { metaKey: true }); expect(editor().value).toBe('앞 **선택** 뒤');
});

test('an existing custom block can be edited without duplicating it or losing quoted attributes', async () => {
  const initial = '앞\n\n<ZoomableImageModal src="/diagram.svg" alt="기존 그림" caption="이전" />\n\n뒤';
  await render(initial); await choose(initial.indexOf('caption'));
  await click(button('블록 수정', container));
  await fill(document.querySelector('#editor-block-caption'), '따옴표 "제목" & <다음>');
  await click(button('변경 적용')); await finishDialog();
  const prepared = prepareMarkdown(editor().value);
  expect(prepared.components).toHaveLength(1);
  expect(parseAttributes(prepared.components[0].attributes).caption).toBe('따옴표 "제목" & <다음>');
  expect(editor().value.startsWith('앞\n\n')).toBe(true);
  expect(editor().value.endsWith('\n\n뒤')).toBe(true);
  await click(button('실행 취소', container)); expect(editor().value).toBe(initial);
});

test('a code example is not mistaken for an editable component', async () => {
  const source = '```html\n<AlertBlock>예제</AlertBlock>\n```';
  await render(source); await choose(source.indexOf('AlertBlock'));
  await click(button('블록 수정', container));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(container.querySelector('[role="status"]').textContent).toContain('안에 커서를');
  expect(editor().value).toBe(source);
});

test('preview uses the existing Markdown and custom components without changing source', async () => {
  const source = '# 제목\n\n**강조**와 ~~삭제~~\n\n| 이름 | 값 |\n| --- | --- |\n| A | B |\n\n<AlertBlock severity="warning">안내 **내용**</AlertBlock>\n\n<CodeAccordion language="text" defaultExpanded="true">\nconst value = 1;\n</CodeAccordion>\n\n<Bookmark url="https://example.com" title="참고" description="설명" />';
  await render(source); await click(button('미리보기', container));
  const preview = container.querySelector('[aria-label="본문 미리보기"]');
  expect(preview.querySelector('h1').textContent).toBe('제목');
  expect(preview.querySelector('del').textContent).toBe('삭제');
  expect(preview.querySelector('table')).not.toBeNull();
  expect(preview.querySelector('[role="alert"]').textContent).toContain('안내 내용');
  expect(preview.querySelector('pre code').textContent).toContain('const value = 1;');
  expect(preview.textContent).toContain('참고');
  expect(editor().value).toBe(source);
});

test('narrow layouts offer writing and preview without a split view', async () => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
  await render('모바일 초안');
  expect(button('나란히', container)).toBeUndefined();
  expect(container.querySelector('.markdown-editor').dataset.view).toBe('write');
  await click(button('미리보기', container));
  expect(container.querySelector('.markdown-editor').dataset.view).toBe('preview');
  await click(button('작성', container)); expect(editor().value).toBe('모바일 초안');
});

test('slash menu searches commands and inserts a checklist as a single undoable command', async () => {
  await render('앞\n\n'); await choose(3);
  await key('/');
  const search = document.querySelector('input[aria-label="도구 검색"]');
  expect(search).not.toBeNull();
  await fill(search, '체크');
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
  await finishDialog();
  expect(editor().value).toBe('앞\n\n- [ ] 목록 항목');
  expect(document.activeElement).toBe(editor());
  await key('z', { ctrlKey: true }); expect(editor().value).toBe('앞\n\n');
});

test('slash leaves literal code, URLs and Korean composition alone', async () => {
  for (const source of ['https:', '```bash\n\n```', '<CodeAccordion>\n\n</CodeAccordion>']) {
    await render(''); await act(() => replaceDraft(source));
    await choose(source.indexOf('\n') < 0 ? source.length : source.indexOf('\n') + 1);
    await key('/');
    expect(document.querySelector('input[aria-label="도구 검색"]')).toBeNull();
    expect(editor().value).toBe(source);
  }
  await act(() => replaceDraft(''));
  await key('/', { isComposing: true, keyCode: 229 });
  expect(document.querySelector('input[aria-label="도구 검색"]')).toBeNull();
});

test('canceling the searchable toolbox preserves a selected range', async () => {
  await render('앞 선택 뒤'); await choose(2, 4, 'backward');
  await click(button('도구 검색', container));
  const search = document.querySelector('input[aria-label="도구 검색"]');
  expect(search).not.toBeNull();
  await fill(search, '없는 도구');
  expect(document.querySelector('[role="dialog"]').textContent).toContain('검색 결과가 없습니다');
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
  await finishDialog();
  expect(editor().value).toBe('앞 선택 뒤');
  expect([editor().selectionStart, editor().selectionEnd, editor().selectionDirection]).toEqual([2, 4, 'backward']);
});

test('a command selected after loading a different draft cannot edit the new draft', async () => {
  await render('선택한 글'); await choose(0, 5);
  await click(button('도구 검색', container));
  const search = document.querySelector('input[aria-label="도구 검색"]');
  await fill(search, '굵게');
  await act(() => replaceDraft('새로 불러온 글'));
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
  await finishDialog();
  expect(editor().value).toBe('새로 불러온 글');
  expect(container.querySelector('[role="status"]').textContent).toContain('본문이 바뀌었습니다');
});

test('command search waits for Korean composition before accepting Enter', async () => {
  await render(''); await choose(0); await key('/');
  const search = document.querySelector('input[aria-label="도구 검색"]');
  await fill(search, '제목');
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, isComposing: true, keyCode: 229 })));
  expect(document.querySelector('input[aria-label="도구 검색"]')).toBe(search);
  expect(editor().value).toBe('');
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })));
  await act(() => search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
  await finishDialog();
  expect(editor().value).toBe('## 제목');
});

test('editorial mode has no browser key controls and makes no Notion request', async () => {
  await render('로컬 초안'); await click(button('Notion', container));
  const dialog = document.querySelector('[role="dialog"]');
  expect(dialog.textContent).toContain('Notion 외부 조회를 사용하지 않습니다');
  expect(dialog.querySelector('input[type="password"]')).toBeNull();
  expect(dialog.textContent).not.toMatch(/API 키|키 저장/);
  await fill(document.querySelector('#notion-import-identifier'), pageId);
  expect(button('본문에 가져오기').disabled).toBe(true);
  expect(notionConvert).not.toHaveBeenCalled(); expect(notionApi.get).not.toHaveBeenCalled();
});

test('Notion lists metadata, selects a data source, paginates, then converts only the chosen page', async () => {
  vi.stubEnv('MODE', 'test');
  notionApi.get.mockResolvedValueOnce({ data: { requiresDataSource: true, dataSources: [{ id: sourceId, name: '기술 기록' }], results: [] } })
    .mockResolvedValueOnce({ data: { results: [{ id: pageId, title: '첫 페이지' }], nextCursor: 'fixture-cursor', hasMore: true } })
    .mockResolvedValueOnce({ data: { results: [{ id: sourceId, title: '둘째 페이지' }], nextCursor: null, hasMore: false } });
  notionConvert.mockResolvedValue({ data: { markdown: '## 가져온 글' } });
  await render('앞뒤'); await choose(1); await click(button('Notion', container));
  await click(button('데이터베이스')); await fill(document.querySelector('#notion-import-identifier'), pageId);
  await click(button('목록 불러오기'));
  expect(notionConvert).not.toHaveBeenCalled();
  await act(() => document.querySelector('#notion-data-source').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })));
  await click([...document.querySelectorAll('[role="option"]')].find(element => element.textContent === '기술 기록'));
  await click(button('목록 불러오기'));
  expect(notionApi.get.mock.calls[1][0]).toContain(`dataSourceId=${sourceId}`);
  expect(notionConvert).not.toHaveBeenCalled();
  await click(button('더 보기'));
  expect(notionApi.get.mock.calls[2][0]).toContain('startCursor=fixture-cursor');
  await click(document.querySelector('button[aria-label="둘째 페이지 가져오기"]'));
  await finishDialog();
  expect(notionConvert).toHaveBeenCalledTimes(1);
  expect(notionConvert.mock.calls[0][0]).toEqual({ pageId: sourceId });
  expect(notionConvert.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  expect(editor().value).toBe('앞\n\n## 가져온 글\n\n뒤');
  await click(button('실행 취소', container)); expect(editor().value).toBe('앞뒤');
});

test('cancel aborts a pending import and a late response never overwrites the draft', async () => {
  vi.stubEnv('MODE', 'test');
  let resolveImport;
  notionConvert.mockImplementation(() => new Promise(resolve => { resolveImport = resolve; }));
  await render('보존할 글'); await click(button('Notion', container));
  await fill(document.querySelector('#notion-import-identifier'), pageId); await click(button('본문에 가져오기'));
  const signal = notionConvert.mock.calls[0][1].signal;
  await click(button('닫기')); expect(signal.aborted).toBe(true);
  await act(() => resolveImport({ data: { markdown: '늦게 온 글' } }));
  await finishDialog(); expect(editor().value).toBe('보존할 글');
});

test('a new external draft invalidates history and cannot be overwritten by an in-flight import', async () => {
  vi.stubEnv('MODE', 'test');
  let resolveImport;
  notionConvert.mockImplementation(() => new Promise(resolve => { resolveImport = resolve; }));
  await render('원본'); await choose(0, 2); await click(button('굵게', container));
  await click(button('Notion', container)); await fill(document.querySelector('#notion-import-identifier'), pageId);
  await click(button('본문에 가져오기'));
  await act(() => replaceDraft('새로 불러온 다른 글'));
  await act(() => resolveImport({ data: { markdown: '이전 요청 결과' } }));
  expect(editor().value).toBe('새로 불러온 다른 글');
  expect(document.querySelector('[role="dialog"] [role="alert"]').textContent).toContain('본문이 바뀌었습니다');
  expect(button('실행 취소', container).disabled).toBe(true);
});
