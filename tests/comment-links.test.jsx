import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { linkifyComment } from '../src/components/commentLinks';

let container, root;
beforeEach(() => { container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); });
afterEach(async () => { await act(() => root.unmount()); container.remove(); });

const render = text => act(() => root.render(<p>{linkifyComment(text)}</p>));
const links = () => [...container.querySelectorAll('a')];

test('an http and an https address in one comment both become links', async () => {
  await render('https://hub.docker.com/r/ollama/ollama https://github.com/ollama/ollama');
  expect(links().map(a => a.getAttribute('href'))).toEqual([
    'https://hub.docker.com/r/ollama/ollama', 'https://github.com/ollama/ollama',
  ]);
  expect(container.textContent).toBe('https://hub.docker.com/r/ollama/ollama https://github.com/ollama/ollama');
});

test('links open in a new tab without handing over the opener', async () => {
  await render('참고 https://example.com/docs 입니다');
  const [link] = links();
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
});

test('surrounding text is preserved exactly', async () => {
  await render('앞 https://example.com 뒤\n둘째 줄');
  expect(container.textContent).toBe('앞 https://example.com 뒤\n둘째 줄');
  expect(links()).toHaveLength(1);
});

test('trailing sentence punctuation stays out of the link', async () => {
  await render('여기 https://example.com/a. 그리고 (https://example.com/b) 끝');
  expect(links().map(a => a.getAttribute('href'))).toEqual(['https://example.com/a', 'https://example.com/b']);
  expect(container.textContent).toBe('여기 https://example.com/a. 그리고 (https://example.com/b) 끝');
});

test('a script-bearing scheme is never turned into a link', async () => {
  await render('javascript:alert(1) 그리고 data:text/html,<script>alert(1)</script>');
  expect(links()).toHaveLength(0);
  expect(container.querySelector('script')).toBe(null);
  expect(container.textContent).toContain('javascript:alert(1)');
});

test('markup inside a comment stays text and is not parsed as HTML', async () => {
  await render('<img src=x onerror=alert(1)> <b>굵게</b>');
  expect(container.querySelector('img')).toBe(null);
  expect(container.querySelector('b')).toBe(null);
  expect(container.textContent).toBe('<img src=x onerror=alert(1)> <b>굵게</b>');
});

test('an address carrying credentials is rejected by the shared URL policy', async () => {
  await render('https://user:pw@example.com/x');
  expect(links()).toHaveLength(0);
});

test('plain comments without an address render unchanged', async () => {
  const text = 'git diff 내용만 리뷰해 주기 때문에 피드백 내용이 별로 좋지 않고';
  await render(text);
  expect(links()).toHaveLength(0);
  expect(container.textContent).toBe(text);
});

test('empty or non-string input does not throw', async () => {
  await render('');
  expect(container.textContent).toBe('');
  expect(() => linkifyComment(null)).not.toThrow();
});
