import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import OpenStackBuild from '../src/components/OpenStackBuild';

let container;
let root;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  vi.unstubAllGlobals();
});

test('OpenStack build page presents the three original build photos and opens one in the modal', async () => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);

  await act(async () => root.render(<MemoryRouter><OpenStackBuild /></MemoryRouter>));

  const images = [...container.querySelectorAll('img.zoomable-image-trigger')];
  expect(images.map(image => image.src)).toEqual(expect.arrayContaining([
    'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbRw9Bo%2FbtsItjpjIBk%2F4ErKKTsBw1dtFBSLKWAeA0%2Fimg.png',
    'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FAninp%2FbtsIs2Ad14r%2FZFAUQtg9N9ympZZxt6QMW0%2Fimg.png',
    'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbVV1VC%2FbtsIzyTOdZE%2Fd3nza7CIkYWGhInt6dFCuk%2Fimg.png',
  ]));
  expect(container.textContent).toContain('초기 장비 구성. MAAS·Juju의 관리 관계와 노드 연결을 정리했다.');
  expect(container.textContent).toContain('Juju로 배치한 서비스와 서비스 사이의 relation을 확인한 화면.');
  expect(container.textContent).toContain('당시 컴퓨트 노드별 자원과 인스턴스 현황을 확인한 화면.');
  expect(container.querySelector('a[href="/blog/54"]')).not.toBeNull();

  await act(async () => images[0].click());
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(document.querySelector('img.zoomable-image-content').src).toBe(images[0].src);
});
