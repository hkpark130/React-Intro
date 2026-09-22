import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import axios from 'axios';
import Bookmark from '../src/components/markdown/Bookmark';

vi.mock('axios', () => ({ default: { get: vi.fn().mockResolvedValue({ data: {} }) } }));
let root, container;
beforeEach(() => {
  vi.stubEnv('MODE', 'production');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.clearAllMocks(); vi.unstubAllEnvs();
});

test('the whole link card is keyboard accessible and uses saved metadata without requests', async () => {
  await act(() => root.render(<Bookmark url="https://example.com/article" title="저장한 제목" description="저장한 설명" />));
  expect(axios.get).not.toHaveBeenCalled();
  expect(container.firstElementChild.tagName).toBe('A');
  expect(container.firstElementChild.getAttribute('href')).toBe('https://example.com/article');
  expect(container.textContent).toContain('저장한 제목');
  expect(container.textContent).toContain('저장한 설명');
  expect(container.querySelector('img[src*="google.com"]')).toBeNull();
});

test('unsafe custom URLs cannot become interactive cards or images', async () => {
  await act(() => root.render(<Bookmark url="javascript:alert(1)" title="주소 확인" imageUrl="data:text/html,bad" />));
  expect(container.querySelector('a')).toBeNull();
  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).toContain('주소 확인');
});

test('changing a card updates its metadata immediately and local preview never fetches remote images', async () => {
  vi.stubEnv('MODE', 'editorial');
  await act(() => root.render(<Bookmark url="https://example.com/first" title="처음" />));
  await act(() => root.render(<Bookmark url="https://example.com/second" title="바뀐 제목" imageUrl="https://example.com/remote.png" />));
  expect(container.textContent).toContain('바뀐 제목');
  expect(container.textContent).not.toContain('처음');
  expect(container.querySelector('img')).toBeNull();
  expect(axios.get).not.toHaveBeenCalled();
});

