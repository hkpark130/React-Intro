import { describe, expect, test } from 'vitest';
import { prepareMarkdown, parseAttributes } from '../src/components/markdown/prepareMarkdown';
import {
  applyMarkdownCommand, insertMarkdown, makeCodeFence, makeTable,
  serializeCustomBlock, findCustomBlock, validateEditorUrl, normalizeNotionId,
} from '../src/components/markdown/editor/editorCommands';

describe('Markdown selection commands', () => {
  test('text color wraps the selected Korean text and preserves a backward selection', () => {
    const result = applyMarkdownCommand('앞 선택 뒤', { start: 2, end: 4, direction: 'backward' }, 'textColor:red');
    expect(result.value).toBe('앞 <span data-text-color="red">선택</span> 뒤');
    expect(result.value.slice(result.start, result.end)).toBe('선택');
    expect(result.direction).toBe('backward');
  });

  test('a second color choice edits the existing span and can add a background without nesting', () => {
    const red = applyMarkdownCommand('선택', { start: 0, end: 2 }, 'textColor:red');
    const blue = applyMarkdownCommand(red.value, red, 'textColor:blue');
    const highlighted = applyMarkdownCommand(blue.value, blue, 'backgroundColor:yellow');
    expect(blue.value).toBe('<span data-text-color="blue">선택</span>');
    expect(highlighted.value).toBe('<span data-text-color="blue" data-background-color="yellow">선택</span>');
    expect(highlighted.value.slice(highlighted.start, highlighted.end)).toBe('선택');
  });

  test('default removes only the requested color and unwraps an empty color span', () => {
    const value = '<span data-text-color="blue" data-background-color="yellow">선택</span>';
    const selection = { start: value.indexOf('선택'), end: value.indexOf('선택') + 2 };
    const textCleared = applyMarkdownCommand(value, selection, 'textColor:default');
    expect(textCleared.value).toBe('<span data-background-color="yellow">선택</span>');
    const backgroundCleared = applyMarkdownCommand(textCleared.value, textCleared, 'backgroundColor:default');
    expect(backgroundCleared.value).toBe('선택');
    expect(backgroundCleared).toMatchObject({ start: 0, end: 2 });
  });

  test('recoloring part of an existing span preserves the surrounding color and selected range', () => {
    const value = '<span data-text-color="red">가나다</span>';
    const start = value.indexOf('나');
    const result = applyMarkdownCommand(value, { start, end: start + 1 }, 'textColor:blue');
    expect(result.value).toBe('<span data-text-color="red">가</span><span data-text-color="blue">나</span><span data-text-color="red">다</span>');
    expect(result.value.slice(result.start, result.end)).toBe('나');
  });

  test('color placeholders stay editable while block and literal selections are rejected', () => {
    const placeholder = applyMarkdownCommand('앞뒤', { start: 1, end: 1 }, 'textColor:green');
    expect(placeholder.value.slice(placeholder.start, placeholder.end)).toBe('색상을 적용할 문구');
    expect(() => applyMarkdownCommand('첫째\n둘째', { start: 0, end: 5 }, 'textColor:red')).toThrow('한 줄의 문구');
    expect(() => applyMarkdownCommand('`코드`', { start: 1, end: 3 }, 'backgroundColor:yellow')).toThrow('코드나 HTML');
    expect(() => applyMarkdownCommand('`코드`', { start: 2, end: 2 }, 'textColor:red')).toThrow('코드나 HTML');
  });

  test('formatting the first empty line does not consume the following paragraph', () => {
    expect(applyMarkdownCommand('\n남길 문단', { start: 0, end: 0 }, 'heading2').value).toBe('## 제목\n남길 문단');
  });
  test('heading levels and paragraph replace markers while preserving the selected text', () => {
    const result = applyMarkdownCommand('## 배포 흐름\n남길 본문', { start: 3, end: 8 }, 'heading3');
    expect(result.value).toBe('### 배포 흐름\n남길 본문');
    expect(result.value.slice(result.start, result.end)).toBe('배포 흐름');
    expect(applyMarkdownCommand(result.value, result, 'paragraph').value).toBe('배포 흐름\n남길 본문');
  });

  test('checklists replace existing list markers and toggle off without losing the items', () => {
    const result = applyMarkdownCommand('1. 구축\n2. 검증\n다음 문단', { start: 0, end: 12 }, 'taskList');
    expect(result.value).toBe('- [ ] 구축\n- [ ] 검증\n다음 문단');
    expect(applyMarkdownCommand(result.value, result, 'taskList').value).toBe('구축\n검증\n다음 문단');
    expect(applyMarkdownCommand('- [x] 검증 완료', { start: 0, end: 11 }, 'unorderedList').value).toBe('- 검증 완료');
  });

  test('strikethrough toggles without changing surrounding words', () => {
    const result = applyMarkdownCommand('앞 이전 뒤', { start: 2, end: 4 }, 'strikethrough');
    expect(result.value).toBe('앞 ~~이전~~ 뒤');
    expect(applyMarkdownCommand(result.value, result, 'strikethrough').value).toBe('앞 이전 뒤');
  });

  test('horizontal rules separate paragraphs instead of turning previous text into a heading', () => {
    expect(applyMarkdownCommand('앞\n뒤', { start: 2, end: 2 }, 'divider').value).toBe('앞\n\n---\n\n뒤');
  });

  test('bold keeps the selected Korean text, surrounding text and backward selection', () => {
    const result = applyMarkdownCommand('앞 한글 뒤', { start: 2, end: 4, direction: 'backward' }, 'bold');
    expect(result).toEqual({ value: '앞 **한글** 뒤', start: 4, end: 6, direction: 'backward' });
    expect(applyMarkdownCommand(result.value, result, 'bold')).toEqual({ value: '앞 한글 뒤', start: 2, end: 4, direction: 'backward' });
  });

  test('empty selections create an editable placeholder at the caret, including after emoji', () => {
    const result = applyMarkdownCommand('🙂 뒤', { start: 2, end: 2 }, 'italic');
    expect(result.value).toBe('🙂*강조할 문구* 뒤');
    expect(result.value.slice(result.start, result.end)).toBe('강조할 문구');
  });

  test('a selection ending at the next line start does not format that next line', () => {
    const value = '첫째\n둘째\n남길 문단';
    const result = applyMarkdownCommand(value, { start: 0, end: 6 }, 'unorderedList');
    expect(result.value).toBe('- 첫째\n- 둘째\n남길 문단');
    expect(result.value.slice(result.start, result.end)).toContain('둘째');
  });

  test('heading changes an existing heading without accumulating prefixes', () => {
    const result = applyMarkdownCommand('# 기존 제목\n본문', { start: 4, end: 4 }, 'heading');
    expect(result.value).toBe('## 기존 제목\n본문');
    expect(result.start).toBe(5);
    expect(applyMarkdownCommand(result.value, result, 'heading').value).toBe('기존 제목\n본문');
  });

  test('block insertion separates adjacent paragraphs and preserves the suffix', () => {
    const result = insertMarkdown('앞뒤', { start: 1, end: 1 }, '<AlertBlock>안내</AlertBlock>', { block: true });
    expect(result.value).toBe('앞\n\n<AlertBlock>안내</AlertBlock>\n\n뒤');
    expect(result.start).toBe(result.end);
    expect(result.value.slice(result.end)).toBe('뒤');
  });

  test('a fence can contain triple backticks and custom closing tags literally', () => {
    const code = '```html\n</CodeAccordion>\n```';
    const fence = makeCodeFence(code, 'text');
    expect(fence).toBe('````text\n```html\n</CodeAccordion>\n```\n````');
    expect(prepareMarkdown(fence).components).toHaveLength(0);
  });

  test('table dimensions are bounded instead of silently allocating an oversized grid', () => {
    expect(makeTable(2, 2).split('\n')).toHaveLength(4);
    expect(() => makeTable(21, 2)).toThrow();
    expect(() => makeTable(2.5, 2)).toThrow();
  });
});

describe('custom block source compatibility', () => {
  test('attribute quotes, ampersands, backslashes, newlines and markup round-trip without new attributes', () => {
    const title = '한글 "제목" & <요소> \\ "끝"\n두 번째 줄';
    const source = serializeCustomBlock('bookmark', { url: 'https://example.com/?a=1&b=2', title, description: '" onload="bad', imageUrl: '' });
    const prepared = prepareMarkdown(source);
    expect(prepared.components).toHaveLength(1);
    const attrs = parseAttributes(prepared.components[0].attributes);
    expect(attrs.title).toBe(title);
    expect(attrs.description).toBe('" onload="bad');
    expect(attrs.onload).toBeUndefined();
    expect(findCustomBlock(source, { start: source.indexOf('title'), end: source.indexOf('title') }).form.title).toBe(title);
  });

  test('editing paired legacy code keeps display flags and quote/list continuation prefixes', () => {
    const source = '> <CodeAccordion title="이전" language="bash" showLineNumbers="false" wrapLines="false">\n> echo ok\n> </CodeAccordion>\n> 이후';
    const block = findCustomBlock(source, { start: source.indexOf('echo'), end: source.indexOf('echo') });
    expect(block.form.codeString).toBe('echo ok');
    const edited = serializeCustomBlock(block.type, { ...block.form, title: '새 제목' }, block);
    const updated = source.slice(0, block.start) + edited + source.slice(block.end);
    const component = prepareMarkdown(updated).components[0];
    expect(parseAttributes(component.attributes)).toMatchObject({ title: '새 제목', showlinenumbers: 'false', wraplines: 'false' });
    expect(component.content.trim()).toBe('echo ok');
    expect(updated).toContain('\n> </CodeAccordion>\n> 이후');
  });

  test('custom-looking tags in fences, inline code and HTML code are not editable blocks', () => {
    for (const source of ['```html\n<Bookmark url="https://example.com" />\n```', '`<AlertBlock>예제</AlertBlock>`', '<pre><code><Bookmark url="https://example.com" /></code></pre>']) {
      const offset = source.indexOf('Bookmark') > -1 ? source.indexOf('Bookmark') : source.indexOf('AlertBlock');
      expect(findCustomBlock(source, { start: offset, end: offset })).toBeNull();
    }
  });

  test('code bodies containing another custom component still select the enclosing code block', () => {
    const source = '<CodeAccordion language="html">\n<Bookmark url="https://example.com" />\n</CodeAccordion>';
    expect(findCustomBlock(source, { start: source.indexOf('Bookmark'), end: source.indexOf('Bookmark') }).type).toBe('code');
  });

  test('legacy Alert remains editable and a closing tag in fenced content is literal', () => {
    const source = '<Alert severity="warning">\n\n```html\n</Alert>\n```\n\n본문\n</Alert>';
    const block = findCustomBlock(source, { start: source.indexOf('본문'), end: source.indexOf('본문') });
    expect(block.tagName).toBe('Alert');
    expect(serializeCustomBlock('alert', { ...block.form, severity: 'info' }, block)).toContain('<Alert severity="info"');
  });

  test('unsafe URLs are rejected and custom code delimiters survive encoded body round-trips', () => {
    for (const value of ['javascript:alert(1)', '//example.com/image.svg', 'data:text/html,bad', '/\\example.com', 'https://example.com/\nvalue']) {
      expect(validateEditorUrl(value)).toBe(false);
    }
    expect(validateEditorUrl('/architecture/diagram.svg')).toBe(true);
    expect(validateEditorUrl('#section', { link: true })).toBe(true);
    expect(validateEditorUrl('mailto:writer@example.com', { link: true })).toBe(true);
    const codeString = '</CodeAccordion>\n&lt;literal&gt; & "quotes"';
    const source = serializeCustomBlock('code', { codeString, language: 'html' });
    expect(source).toContain('contentEncoding="html"');
    expect(findCustomBlock(source, { start: 0, end: source.length }).form.codeString).toBe(codeString);
    expect(prepareMarkdown(source).components[0].content.trim()).toBe(codeString);
  });

  test('Notion accepts a page URL or UUID and rejects arbitrary paths', () => {
    const id = '0123456789abcdef0123456789abcdef';
    expect(normalizeNotionId(`https://www.notion.so/A-page-${id}?source=copy_link`)).toBe(id);
    expect(normalizeNotionId('01234567-89ab-cdef-0123-456789abcdef')).toBe('01234567-89ab-cdef-0123-456789abcdef');
    expect(normalizeNotionId('../other-route')).toBeNull();
  });
});
