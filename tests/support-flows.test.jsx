import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import ChatWidget from '../src/components/ChatWidget';
import Login from '../src/components/Login';
import { register, sendChatMessage } from '../src/api/api';

vi.mock('../src/api/api', () => ({ register: vi.fn(), sendChatMessage: vi.fn() }));
vi.mock('../src/api/auth', () => ({ login: vi.fn() }));
let container, root;
const click = element => act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
const fill = (element, value) => act(() => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
});
beforeEach(() => {
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.clearAllMocks(); });

test('chat ignores Enter during Korean composition and restores focus after Escape', async () => {
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  const launcher = container.querySelector('button');
  await click(launcher);
  const input = document.querySelector('input');
  await fill(input, '쿠버네티스');
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true })));
  expect(sendChatMessage).not.toHaveBeenCalled();
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(launcher.getAttribute('aria-expanded')).toBe('false');
  expect(document.activeElement).toBe(launcher);
});

test('chat explains an unavailable local endpoint without requesting it automatically', async () => {
  sendChatMessage.mockRejectedValue({ response: { status: 404 } });
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  await click(container.querySelector('button'));
  expect(sendChatMessage).not.toHaveBeenCalled();
  await fill(document.querySelector('input'), '프로젝트 안내');
  await act(() => document.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  expect(sendChatMessage).toHaveBeenCalledWith('프로젝트 안내', { signal: expect.any(AbortSignal) });
  expect(document.body.textContent).toContain('현재 연결된 환경에서는 챗봇을 사용할 수 없습니다.');
});

test('RAG citations keep existing local post IDs and never link generated URLs', async () => {
  sendChatMessage.mockResolvedValue({ data: { answer: '설명 https://untrusted.example/fake', mode: 'hybrid', sources: [
    { post_id: 111, title: 'OpenStack SSH 지연', url: 'https://untrusted.example/fake' },
    { post_id: '../users', title: 'invalid' },
  ] } });
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  await click(container.querySelector('button'));
  await fill(document.querySelector('input'), '오픈스택 SSH 접속이 느린 문제');
  await act(() => document.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  const links = [...container.querySelectorAll('#portfolio-chat a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual(['/blog/111']);
  expect(document.querySelector('input').disabled).toBe(false);
  expect(document.activeElement).toBe(document.querySelector('input'));
});

test('site owner guidance only links to the fixed local profile page', async () => {
  sendChatMessage.mockResolvedValue({ data: {
    answer: '이 사이트는 박현경의 포트폴리오와 기술 블로그입니다.', sources: [], mode: 'navigation',
    links: [null, { url: 'https://untrusted.example/profile' }, { url: '//untrusted.example/profile' },
      { url: '/profile?redirect=https://untrusted.example' }, { url: '/profile', title: '서버가 보낸 제목' }],
  } });
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  const launcher = container.querySelector('[aria-controls="portfolio-chat"]');
  await click(launcher);
  await fill(container.querySelector('input'), '사이트 주인 누구야');
  await act(() => container.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  const links = [...container.querySelectorAll('#portfolio-chat a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual(['/profile']);
  expect(links[0].textContent).toBe('소개 페이지에서 자세히 보기');
  await click(links[0]);
  expect(launcher.getAttribute('aria-expanded')).toBe('false');
});

test('RAG busy response recovers the input for another question', async () => {
  sendChatMessage.mockRejectedValue({ response: { status: 429 } });
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  await click(container.querySelector('button'));
  await fill(document.querySelector('input'), 'JWT 저장');
  await act(() => document.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  expect(document.body.textContent).toContain('다른 질문을 처리 중입니다.');
  expect(document.querySelector('input').disabled).toBe(false);
});

test.each([
  ['rag 챗봇 링크 어딨어?', '/chatbot', 'RAG 챗봇 프로젝트 보기'],
  ['kredis operator', '/kredis', 'Kubernetes Operator (Kredis) 프로젝트 보기'],
])('project guidance renders the registered page and closes chat: %s', async (question, path, title) => {
  sendChatMessage.mockResolvedValue({ data: { answer: '프로젝트 페이지입니다.', sources: [], mode: 'navigation',
    links: [null, { url: `https://untrusted.example${path}` }, { url: `${path}?redirect=bad` },
      { url: path, title: '응답의 임의 제목' }, { url: path }, { url: '/unknown-project' }],
  } });
  await act(() => root.render(<MemoryRouter><ChatWidget /></MemoryRouter>));
  const launcher = container.querySelector('[aria-controls="portfolio-chat"]');
  await click(launcher);
  await fill(container.querySelector('input'), question);
  await act(() => container.querySelector('input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  const links = [...container.querySelectorAll('#portfolio-chat a')];
  expect(links.map(link => link.getAttribute('href'))).toEqual([path]);
  expect(links[0].textContent).toBe(title);
  await click(links[0]);
  expect(launcher.getAttribute('aria-expanded')).toBe('false');
});

test('a pending chat reply preserves focus in the login dialog', async () => {
  let reply;
  sendChatMessage.mockImplementation(() => new Promise(resolve => { reply = resolve; }));
  function ChatWithLogin() {
    const [open, setOpen] = React.useState(false);
    return <><ChatWidget /><button onClick={() => setOpen(true)}>Open login</button><Login open={open} onClose={() => setOpen(false)} /></>;
  }
  await act(() => root.render(<MemoryRouter><ChatWithLogin /></MemoryRouter>));
  await click(container.querySelector('[aria-controls="portfolio-chat"]'));
  const input = container.querySelector('#portfolio-chat input');
  await fill(input, 'ssl');
  await act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  await click([...container.querySelectorAll('button')].find(button => button.textContent === 'Open login'));
  const accountInput = document.querySelector('.account-dialog input[name="username"]');
  await act(() => accountInput.focus());
  expect(document.activeElement).toBe(accountInput);
  await act(() => reply({ data: { answer: '관련 글을 찾았습니다.', sources: [] } }));
  expect(input.disabled).toBe(false);
  expect(container.querySelector('#portfolio-chat').textContent).toContain('관련 글을 찾았습니다.');
  expect(document.activeElement).toBe(accountInput);
});

test('successful registration returns to login and keeps its confirmation visible', async () => {
  register.mockResolvedValue({ data: {} });
  await act(() => root.render(<MemoryRouter><Login open onClose={vi.fn()} /></MemoryRouter>));
  await click([...document.querySelectorAll('button')].find(button => button.textContent === '회원가입'));
  await fill(document.querySelector('input[name="username"]'), 'test-reader');
  await fill(document.querySelector('input[name="password"]'), 'fixture-only');
  await fill(document.querySelector('input[name="confirmPassword"]'), 'fixture-only');
  await act(() => document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
  expect(register).toHaveBeenCalledWith({ username: 'test-reader', password: 'fixture-only' });
  expect(document.querySelector('[role="alert"]')?.textContent).toContain('회원가입이 완료되었습니다.');
  expect(document.querySelector('input[name="confirmPassword"]')).toBeNull();
});
