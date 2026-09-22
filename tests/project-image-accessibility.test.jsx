import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import ZoomableImageModal from '../src/components/section/ZoomableImageModal.jsx';

let root;
let container;
afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});

test('project architecture images open with the keyboard and expose named dialog controls', async () => {
  // jsdom has no layout observer; retain the real modal and keyboard behavior.
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ZoomableImageModal imageSrc="/images/clean.png" altText="인증 계층 구조" />));
  const trigger = container.querySelector('[role="button"]');
  expect(trigger).not.toBeNull();
  expect(trigger.tabIndex).toBe(0);
  await act(async () => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  const closeButton = document.querySelector('button[aria-label="이미지 닫기"]');
  expect(closeButton).not.toBeNull();
  await act(async () => closeButton.click());
});
