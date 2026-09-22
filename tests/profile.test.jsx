import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test } from 'vitest';
import Profile from '../src/components/Profile';

let container;
let root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

test('does not present a stale profile writing-date label', async () => {
  await act(() => root.render(<MemoryRouter><Profile /></MemoryRouter>));
  expect(container.textContent).not.toContain('2026년 7월 작성 이력 기준');
});
