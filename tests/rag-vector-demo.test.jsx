import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test } from 'vitest';
import RagVectorDemo from '../src/components/rag/RagVectorDemo';

let container, root;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

async function renderDemo() {
  await act(() => root.render(<RagVectorDemo />));
}

async function setAngle(value) {
  const slider = container.querySelector('input[type="range"]');
  await act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(slider, String(value));
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('aligning the question with each document gives cosine 1 and moves it to the first rank', async () => {
  await renderDemo();
  for (const [angle, document] of [[30, 'A'], [90, 'B'], [150, 'C']]) {
    await setAngle(angle);
    const first = container.querySelector('.rag-vector-scores > li');
    expect(first.dataset.document).toBe(document);
    expect(first.querySelector('.rag-vector-score').textContent).toBe('1.000');
    expect(first.querySelector('.rag-vector-difference').textContent).toBe('0°');
    expect(container.querySelector('.rag-vector-formula').textContent).toContain('cos(0°) ≈ 1.000');
    const vector = container.querySelector('.rag-vector-query');
    const dx = Number(vector.getAttribute('x2')) - Number(vector.getAttribute('x1'));
    const dy = Number(vector.getAttribute('y2')) - Number(vector.getAttribute('y1'));
    expect(Math.hypot(dx, dy)).toBeCloseTo(120, 10);
  }
  await setAngle(90);
  expect(container.querySelector('[data-document="A"] .rag-vector-score').textContent).toBe('0.500');
  expect(container.querySelector('[data-document="C"] .rag-vector-score').textContent).toBe('0.500');
  expect(container.querySelector('[data-document="A"] .rag-vector-rank').textContent).toBe('2위');
  expect(container.querySelector('[data-document="C"] .rag-vector-rank').textContent).toBe('2위');
});

test('orthogonal and opposing directions keep zero and negative cosine values in the right order', async () => {
  await renderDemo();
  await setAngle(0);
  expect([...container.querySelectorAll('.rag-vector-scores > li')].map(row => [
    row.dataset.document, row.querySelector('.rag-vector-difference').textContent,
    row.querySelector('.rag-vector-score').textContent,
  ])).toEqual([['A', '30°', '0.866'], ['B', '90°', '0.000'], ['C', '150°', '-0.866']]);
  const vector = container.querySelector('.rag-vector-query');
  expect(vector.getAttribute('x2')).toBe('280');
  expect(vector.getAttribute('y2')).toBe('160');
  expect([...container.querySelectorAll('.rag-vector-coordinates')].map(row => row.textContent))
    .toEqual(['q = (1.000, 0.000)', 'dA = (0.866, 0.500)']);
  expect(container.querySelector('.rag-vector-dot-calculation').textContent).toBe('1.000 × 0.866+ 0.000 × 0.500≈ 0.866');
  await setAngle(150);
  expect(container.querySelector('.rag-vector-dot-calculation').textContent).toBe('(-0.866) × (-0.866)+ 0.500 × 0.500≈ 1.000');
});

test('the slider updates recommendations on both sides of the example threshold and can recommend two documents', async () => {
  await renderDemo();
  expect(container.querySelector('details, select, table')).toBeNull();
  expect(container.querySelector('.rag-vector-formula')).not.toBeNull();
  for (const [angle, score, result] of [[66, '0.809', '추천'], [67, '0.799', '제외']]) {
    await setAngle(angle);
    const row = container.querySelector('[data-document="A"]');
    expect(row.querySelector('.rag-vector-score').textContent).toBe(score);
    expect(row.querySelector('.rag-vector-result').textContent).toBe(result);
  }
  for (const [angle, documents] of [[60, ['A', 'B']], [120, ['B', 'C']]]) {
    await setAngle(angle);
    const recommended = [...container.querySelectorAll('.rag-vector-result[data-recommended="true"]')]
      .map(result => result.closest('li').dataset.document);
    expect(recommended).toEqual(documents);
    expect(container.querySelectorAll('.rag-vector-result[data-recommended="false"]')).toHaveLength(1);
  }
});
