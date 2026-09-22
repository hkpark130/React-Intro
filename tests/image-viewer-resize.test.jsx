import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import ZoomableImageModal from '../src/components/section/ZoomableImageModal.jsx';

let root;
let container;
const viewport = { width: window.innerWidth, height: window.innerHeight };

function setViewport(width, height) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container?.remove();
  setViewport(viewport.width, viewport.height);
  vi.unstubAllGlobals();
});

async function openViewer() {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<ZoomableImageModal imageSrc="/images/clean.png" altText="검증용 구성도" />));
  const trigger = container.querySelector('[role="button"]');
  trigger.focus();
  await act(async () => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  return document.querySelector('[role="dialog"]');
}

function captureSupport(handle) {
  const captures = new Set();
  handle.setPointerCapture = vi.fn(id => captures.add(id));
  handle.hasPointerCapture = vi.fn(id => captures.has(id));
  handle.releasePointerCapture = vi.fn(id => captures.delete(id));
}

function pointer(handle, type, { pointerId = 7, clientX = 100, clientY = 100 } = {}) {
  const event = new MouseEvent(type, { clientX, clientY, button: 0, bubbles: true, cancelable: true });
  Object.defineProperties(event, { pointerId: { value: pointerId }, pointerType: { value: 'touch' }, isPrimary: { value: true } });
  act(() => handle.dispatchEvent(event));
}

const widthOf = dialog => Number.parseFloat(getComputedStyle(dialog).width);

test('tracks only the captured pointer and stops resizing after pointercancel', async () => {
  const dialog = await openViewer();
  const handle = dialog.querySelector('[aria-label="resize-e"]');
  captureSupport(handle);
  const initialWidth = widthOf(dialog);
  pointer(handle, 'pointerdown');
  expect(handle.setPointerCapture).toHaveBeenCalledWith(7);
  pointer(handle, 'pointermove', { pointerId: 8, clientX: 60 });
  expect(widthOf(dialog)).toBe(initialWidth);
  pointer(handle, 'pointermove', { clientX: 80 });
  const resizedWidth = widthOf(dialog);
  expect(resizedWidth).toBeLessThan(initialWidth);
  pointer(handle, 'pointercancel');
  expect(handle.releasePointerCapture).toHaveBeenCalledWith(7);
  pointer(handle, 'pointermove', { clientX: 40 });
  expect(widthOf(dialog)).toBe(resizedWidth);
});

test('clamps an open window to a smaller viewport and releases capture on resize and unmount', async () => {
  const dialog = await openViewer();
  const handle = dialog.querySelector('[aria-label="resize-s"]');
  captureSupport(handle);
  pointer(handle, 'pointerdown');
  setViewport(280, 340);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(widthOf(dialog)).toBeLessThanOrEqual(256);
  expect(Number.parseFloat(getComputedStyle(dialog).height)).toBeLessThanOrEqual(316);
  expect(handle.releasePointerCapture).toHaveBeenCalledWith(7);
  pointer(handle, 'pointerdown', { pointerId: 9 });
  act(() => root.unmount());
  root = null;
  expect(handle.releasePointerCapture).toHaveBeenCalledWith(9);
});

async function dismissHeldResize() {
  const dialog = await openViewer();
  const handle = dialog.querySelector('[aria-label="resize-s"]');
  captureSupport(handle);
  pointer(handle, 'pointerdown');
  act(() => dialog.querySelector('.zoomable-image-close').click());
  // Let MUI's existing exit transition remove the dialog.
  await act(async () => new Promise(resolve => setTimeout(resolve, 250)));
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  return container.querySelector('.zoomable-image-trigger');
}

function touchClick(trigger, detail = 1) {
  const event = new MouseEvent('click', { detail, bubbles: true, cancelable: true });
  Object.defineProperties(event, { pointerId: { value: 7 }, pointerType: { value: 'touch' } });
  act(() => trigger.dispatchEvent(event));
}

test('ignores the terminal click from a resize gesture dismissed while the pointer was held', async () => {
  const trigger = await dismissHeldResize();
  pointer(trigger, 'pointerup');
  touchClick(trigger);
  expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test.each(['pointer', 'keyboard', 'assistive click'])('permits a fresh %s activation while a dismissed resize click is pending', async (input) => {
  const trigger = await dismissHeldResize();
  if (input === 'pointer') {
    // A browser may reuse a pointer ID for a later interaction.
    pointer(trigger, 'pointerdown');
    pointer(trigger, 'pointerup');
    touchClick(trigger);
  } else if (input === 'keyboard') {
    act(() => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
  } else {
    touchClick(trigger, 0);
  }
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
});
