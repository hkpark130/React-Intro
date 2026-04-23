/**
 * @file MarkdownRenderer의 내부 유틸 로직 검증.
 * 함수가 export되지 않아 간접 테스트 — 컴포넌트 렌더링 결과로 확인.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';

const setup = (content) => render(
  <MemoryRouter>
    <MarkdownRenderer content={content} />
  </MemoryRouter>
);

describe('MarkdownRenderer custom tags', () => {
  it('renders plain markdown heading', () => {
    const { container } = setup('# Hello');
    expect(container.querySelector('h1')?.textContent).toContain('Hello');
  });

  it('extracts and renders CodeAccordion', () => {
    const md = `<CodeAccordion title="테스트" language="javascript">\nconst x = 1;\n</CodeAccordion>`;
    const { container } = setup(md);
    expect(container.textContent).toContain('테스트');
  });

  it('extracts and renders AlertBlock', () => {
    const { container } = setup(`<AlertBlock severity="warning">주의</AlertBlock>`);
    expect(container.textContent).toContain('주의');
  });

  it('escapes unknown HTML tags', () => {
    const { container } = setup(`<foobar>bad</foobar>`);
    expect(container.innerHTML).not.toContain('<foobar>');
  });
});
