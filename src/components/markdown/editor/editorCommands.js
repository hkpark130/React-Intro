import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { parseAttributes } from '../prepareMarkdown';
import { sanitizeMarkdownUrl } from '../urlPolicy';
import {
  markdownBackgroundColors, markdownTextColors, normalizeMarkdownColor,
} from '../../../../server/notion-service/src/markdown/colorPolicy.js';

const parser = unified().use(remarkParse);
const tagPattern = /<(\/?)([a-z][\w-]*)((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^'">])*)>/gi;
const blockTypes = { codeaccordion: 'code', zoomableimagemodal: 'image', bookmark: 'bookmark', alertblock: 'alert', alert: 'alert' };
const blockTags = { code: 'CodeAccordion', image: 'ZoomableImageModal', bookmark: 'Bookmark', alert: 'AlertBlock' };

export function normalizeSelection(value, selection = {}) {
  const start = Math.max(0, Math.min(value.length, selection.start ?? value.length));
  const end = Math.max(start, Math.min(value.length, selection.end ?? start));
  return { start, end, direction: selection.direction || 'none' };
}

export function insertMarkdown(value, selection, text, { block = false } = {}) {
  const { start, end, direction } = normalizeSelection(value, selection);
  const before = value.slice(0, start);
  const after = value.slice(end);
  const leading = block && before ? '\n'.repeat(Math.max(0, 2 - (before.match(/\n*$/)?.[0].length || 0))) : '';
  const trailing = block ? '\n'.repeat(Math.max(0, 2 - (after.match(/^\n*/)?.[0].length || 0))) : '';
  const inserted = leading + text + trailing;
  return { value: before + inserted + after, start: start + inserted.length, end: start + inserted.length, direction };
}

function wrapSelection(value, selection, marker, placeholder) {
  const { start, end, direction } = normalizeSelection(value, selection);
  const selected = value.slice(start, end);
  if (selected && value.slice(start - marker.length, start) === marker && value.slice(end, end + marker.length) === marker) {
    return { value: value.slice(0, start - marker.length) + selected + value.slice(end + marker.length), start: start - marker.length, end: end - marker.length, direction };
  }
  if (selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2) {
    const inner = selected.slice(marker.length, -marker.length);
    return { value: value.slice(0, start) + inner + value.slice(end), start, end: start + inner.length, direction };
  }
  const text = selected || placeholder;
  return { value: value.slice(0, start) + marker + text + marker + value.slice(end), start: start + marker.length, end: start + marker.length + text.length, direction };
}

function prefixLines(value, selection, command) {
  const { start, end, direction } = normalizeSelection(value, selection);
  const lineStart = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const endProbe = end > start && value[end - 1] === '\n' ? end - 1 : end;
  const newline = value.indexOf('\n', endProbe);
  const lineEnd = newline < 0 ? value.length : newline;
  const lines = value.slice(lineStart, lineEnd).split('\n');
  const heading = command === 'heading' ? 2 : /^heading[1-6]$/.test(command) ? Number(command.at(-1)) : 0;
  const pattern = heading || command === 'paragraph' ? /^#{1,6}\s+/ : command === 'quote' ? /^>\s?/ : /^(?:[-+*]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/;
  const same = heading ? new RegExp(`^#{${heading}}\\s+`) : command === 'quote' ? /^>\s?/ : command === 'orderedList' ? /^\d+[.)]\s+/ : command === 'taskList' ? /^[-+*]\s+\[[ xX]\]\s+/ : /^[-+*]\s+(?!\[[ xX]\]\s)/;
  const remove = command === 'paragraph' || lines.every(line => same.test(line));
  let offset = lineStart;
  const edits = [];
  const nextLines = lines.map((line, index) => {
    const existing = line.match(pattern)?.[0] || '';
    const prefix = remove ? '' : heading ? `${'#'.repeat(heading)} ` : command === 'quote' ? '> ' : command === 'orderedList' ? `${index + 1}. ` : command === 'taskList' ? '- [ ] ' : '- ';
    edits.push({ offset, removed: existing.length, added: prefix.length });
    offset += line.length + 1;
    return prefix + line.slice(existing.length);
  });
  const mapOffset = position => {
    let delta = 0;
    for (const edit of edits) {
      if (position < edit.offset) break;
      if (position <= edit.offset + edit.removed) return edit.offset + delta + edit.added;
      delta += edit.added - edit.removed;
    }
    return position + delta;
  };
  let result = { value: value.slice(0, lineStart) + nextLines.join('\n') + value.slice(lineEnd), start: mapOffset(start), end: mapOffset(end), direction };
  if (lineStart === lineEnd && !remove) {
    const placeholder = heading ? '제목' : command === 'quote' ? '인용할 문구' : '목록 항목';
    result = { ...result, value: result.value.slice(0, result.start) + placeholder + result.value.slice(result.end), end: result.start + placeholder.length };
  }
  return result;
}

const colorSpanPattern = /<\/?span\b[^>]*>/gi;

function parseColorSpan(opening) {
  const attributes = {};
  const rest = opening
    .replace(/^<span\b/i, '')
    .replace(/>$/, '')
    .replace(/\s+(data-(?:text|background)-color)\s*=\s*(["'])(.*?)\2/gi, (_match, name, _quote, color) => {
      attributes[name] = color;
      return '';
    });
  if (rest.trim()) return null;
  const textColor = normalizeMarkdownColor(attributes['data-text-color'], markdownTextColors);
  const backgroundColor = normalizeMarkdownColor(attributes['data-background-color'], markdownBackgroundColors);
  if (!textColor && !backgroundColor) return null;
  return { textColor, backgroundColor };
}

function colorSpans(value) {
  const stack = [];
  const spans = [];
  for (const token of value.matchAll(colorSpanPattern)) {
    if (/^<\/span/i.test(token[0])) {
      const opening = stack.pop();
      if (opening?.colors) spans.push({ ...opening, closeStart: token.index, closeEnd: token.index + token[0].length });
    } else if (!/\/\s*>$/.test(token[0])) {
      stack.push({ openStart: token.index, contentStart: token.index + token[0].length, colors: parseColorSpan(token[0]) });
    }
  }
  return spans;
}

export function getActiveMarkdownColors(value, selection) {
  const range = normalizeSelection(value, selection);
  return colorSpans(value)
    .filter(span => span.contentStart <= range.start && range.end <= span.closeStart)
    .sort((left, right) => (left.closeEnd - left.openStart) - (right.closeEnd - right.openStart))[0]?.colors || {};
}

function formattingLiteralRanges(source) {
  const ranges = [];
  const walk = node => {
    if (['code', 'inlineCode', 'html'].includes(node.type)) ranges.push([node.position.start.offset, node.position.end.offset]);
    else node.children?.forEach(walk);
  };
  walk(parser.parse(source));
  return ranges;
}

function serializeColorSpan(text, colors) {
  if (!text) return '';
  const attributes = [
    colors.textColor && `data-text-color="${colors.textColor}"`,
    colors.backgroundColor && `data-background-color="${colors.backgroundColor}"`,
  ].filter(Boolean).join(' ');
  return attributes ? `<span ${attributes}>${text}</span>` : text;
}

function applyColorCommand(value, selection, kind, requestedColor) {
  const range = normalizeSelection(value, selection);
  const attribute = kind === 'textColor' ? 'textColor' : 'backgroundColor';
  const palette = kind === 'textColor' ? markdownTextColors : markdownBackgroundColors;
  const color = requestedColor === 'default' ? '' : normalizeMarkdownColor(requestedColor, palette);
  if (requestedColor !== 'default' && !color) throw new Error('지원하지 않는 색상입니다.');
  const selected = value.slice(range.start, range.end);
  if (/\r?\n/.test(selected)) throw new Error('색상은 한 줄의 문구에만 적용할 수 있습니다.');
  const overlapsLiteral = formattingLiteralRanges(value).some(([start, end]) => start < range.end && end > range.start);
  if (overlapsLiteral || findCustomBlock(value, range)) throw new Error('코드나 HTML, 커스텀 블록 안에서는 색상을 적용할 수 없습니다.');

  const enclosing = colorSpans(value)
    .filter(span => span.contentStart <= range.start && range.end <= span.closeStart)
    .sort((left, right) => (left.closeEnd - left.openStart) - (right.closeEnd - right.openStart))[0];
  if (enclosing) {
    if (!color && !enclosing.colors[attribute]) return { value, ...range };
    const beforeText = value.slice(enclosing.contentStart, range.start);
    const selectedText = selected || '색상을 적용할 문구';
    const afterText = value.slice(range.end, enclosing.closeStart);
    const selectedColors = { ...enclosing.colors, [attribute]: color };
    const before = serializeColorSpan(beforeText, enclosing.colors);
    const middle = serializeColorSpan(selectedText, selectedColors);
    const after = serializeColorSpan(afterText, enclosing.colors);
    const replacement = before + middle + after;
    const middleOpening = middle.indexOf(selectedText);
    const start = enclosing.openStart + before.length + middleOpening;
    return {
      value: value.slice(0, enclosing.openStart) + replacement + value.slice(enclosing.closeEnd),
      start, end: start + selectedText.length, direction: range.direction,
    };
  }
  if (!color) return { value, ...range };
  const text = selected || '색상을 적용할 문구';
  const replacement = serializeColorSpan(text, { [attribute]: color });
  const start = range.start + replacement.indexOf(text);
  return {
    value: value.slice(0, range.start) + replacement + value.slice(range.end),
    start, end: start + text.length, direction: range.direction,
  };
}

export function applyMarkdownCommand(value, selection, command) {
  const colorCommand = /^(textColor|backgroundColor):([a-z]+)$/.exec(command);
  if (colorCommand) return applyColorCommand(value, selection, colorCommand[1], colorCommand[2]);
  if (command === 'bold') return wrapSelection(value, selection, '**', '굵게 쓸 문구');
  if (command === 'italic') return wrapSelection(value, selection, '*', '강조할 문구');
  if (command === 'strikethrough') return wrapSelection(value, selection, '~~', '취소할 문구');
  if (command === 'divider') return insertMarkdown(value, selection, '---', { block: true });
  if (command === 'inlineCode') {
    const range = normalizeSelection(value, selection);
    const text = value.slice(range.start, range.end) || '코드';
    if (text.includes('\n')) return insertMarkdown(value, range, makeCodeFence(text), { block: true });
    const size = Math.max(0, ...[...text.matchAll(/`+/g)].map(match => match[0].length)) + 1;
    const marker = '`'.repeat(size);
    const padding = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
    const replacement = marker + padding + text + padding + marker;
    const start = range.start + marker.length + padding.length;
    return { value: value.slice(0, range.start) + replacement + value.slice(range.end), start, end: start + text.length, direction: range.direction };
  }
  return prefixLines(value, selection, command);
}

/** Offer slash commands only on a blank prose line, never in literal examples. */
export function canOpenSlashMenu(value, selection) {
  const { start, end } = normalizeSelection(value, selection);
  if (start !== end) return false;
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const next = value.indexOf('\n', start);
  if (!/^ {0,3}$/.test(value.slice(from, next < 0 ? value.length : next))) return false;
  const literals = [];
  const walk = node => {
    if (['code', 'inlineCode', 'html'].includes(node.type)) literals.push([node.position.start.offset, node.position.end.offset]);
    else node.children?.forEach(walk);
  };
  walk(parser.parse(value));
  return !literals.some(([a, b]) => a <= start && start <= b) && !findCustomBlock(value, selection);
}

export function makeCodeFence(code, language = 'text') {
  const size = Math.max(3, ...[...code.matchAll(/`+/g)].map(match => match[0].length + 1));
  const fence = '`'.repeat(size);
  const safeLanguage = /^[\w+-]*$/.test(language) ? language : 'text';
  return `${fence}${safeLanguage}\n${code}\n${fence}`;
}

export function makeTable(rows, columns) {
  if (![rows, columns].every(number => Number.isInteger(number) && number >= 1 && number <= 20)) throw new Error('행과 열은 1부터 20 사이의 정수로 입력하세요.');
  const row = cells => `| ${cells.join(' | ')} |`;
  return [row(Array.from({ length: columns }, (_, index) => `제목 ${index + 1}`)), row(Array(columns).fill('---')), ...Array.from({ length: rows }, () => row(Array(columns).fill('내용')))].join('\n');
}

export function validateEditorUrl(value, { link = false } = {}) {
  if (typeof value !== 'string' || !value || /[\s<>"]/.test(value)) return false;
  return Boolean(sanitizeMarkdownUrl(value, { kind: link ? 'link' : 'media', allowRelative: true }));
}

export function makeMarkdownLink(label, url) {
  if (!validateEditorUrl(url, { link: true })) throw new Error('https:// 주소, 사이트 안의 경로 또는 #목차 주소를 입력하세요.');
  const safeLabel = (label || url).replace(/\\/g, '\\\\').replace(/[[\]]/g, '\\$&').replace(/\r?\n/g, ' ');
  return `[${safeLabel}](<${url}>)`;
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/\\/g, '&#92;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#13;').replace(/\n/g, '&#10;');
}

const encodeBody = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const decodeBody = value => value.replace(/&(amp|lt|gt);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>' }[name]));

export function serializeCustomBlock(type, form, existing = {}) {
  const attributes = { ...existing.attributes };
  const tagName = existing.tagName || blockTags[type];
  let body = '';
  if (type === 'code') {
    if (!form.codeString?.trim()) throw new Error('코드 내용을 입력하세요.');
    Object.assign(attributes, { title: form.title || '', language: form.language || 'text', defaultexpanded: String(Boolean(form.defaultExpanded)), showlinenumbers: String(form.showLineNumbers !== false), wraplines: String(form.wrapLines !== false), contentencoding: 'html' });
    body = `\n${encodeBody(form.codeString)}\n`;
  } else if (type === 'image') {
    if (!validateEditorUrl(form.src)) throw new Error('이미지의 https:// 주소 또는 /로 시작하는 사이트 경로를 입력하세요.');
    Object.assign(attributes, { src: form.src, alt: form.alt || '', caption: form.caption || '' });
  } else if (type === 'bookmark') {
    if (!validateEditorUrl(form.url)) throw new Error('북마크의 http(s) 주소 또는 사이트 경로를 입력하세요.');
    if (form.imageUrl && !validateEditorUrl(form.imageUrl)) throw new Error('미리보기 이미지 주소를 확인하세요.');
    Object.assign(attributes, { url: form.url, title: form.title || '', description: form.description || '', imageurl: form.imageUrl || '' });
  } else if (type === 'alert') {
    if (!form.message?.trim()) throw new Error('안내 내용을 입력하세요.');
    attributes.severity = ['info', 'success', 'warning', 'error'].includes(form.severity) ? form.severity : 'info';
    attributes.contentencoding = 'html';
    body = `\n\n${encodeBody(form.message)}\n\n`;
  } else throw new Error('지원하지 않는 블록입니다.');
  const canonicalNames = { defaultexpanded: 'defaultExpanded', showlinenumbers: 'showLineNumbers', wraplines: 'wrapLines', imageurl: 'imageUrl', contentencoding: 'contentEncoding' };
  const serialized = Object.entries(attributes).filter(([key, value]) => /^[\w-]+$/.test(key) && value !== '').map(([key, value]) => ` ${canonicalNames[key] || key}="${escapeAttribute(value)}"`).join('');
  const source = body ? `<${tagName}${serialized}>${body}</${tagName}>` : `<${tagName}${serialized} />`;
  if (type === 'alert' && !findCustomBlock(source, { start: 0, end: source.length })) throw new Error('안내 내용에 닫히지 않은 Alert 태그가 있습니다. 태그 예제는 코드 서식으로 감싸세요.');
  return existing.continuationPrefix ? source.split('\n').map((line, index) => (index ? existing.continuationPrefix : '') + line).join('\n') : source;
}

function literalRanges(source) {
  const ranges = [];
  const walk = node => {
    if (node.type === 'code' || node.type === 'inlineCode') ranges.push([node.position.start.offset, node.position.end.offset]);
    else node.children?.forEach(walk);
  };
  walk(parser.parse(source));
  return ranges;
}

/** Locate editable source only; never interpret JavaScript or tags inside code examples. */
export function findCustomBlock(value, selection) {
  const { start, end } = normalizeSelection(value, selection);
  const literals = literalRanges(value);
  const alertLiterals = literalRanges(value.replace(tagPattern, (raw, closing, name) => /^alert(?:block)?$/i.test(name) ? raw.replace(/[^\r\n]/g, 'x') : raw));
  const inside = (ranges, offset) => ranges.some(([from, to]) => from <= offset && offset < to);
  const stack = [];
  const blocks = [];
  let htmlCode = null;
  const add = (token, close) => {
    const [raw, , tagName, rawAttributes] = token;
    const prefix = value.slice(value.lastIndexOf('\n', token.index - 1) + 1, token.index);
    const container = /^(?:[ \t]+|>[ \t]?|(?:[-+*]|\d{1,9}[.)])[ \t]+)*$/.test(prefix) ? prefix : '';
    const continuationPrefix = container.replace(/(?:[-+*]|\d{1,9}[.)])(?=[ \t])/g, marker => ' '.repeat(marker.length));
    let content = close ? value.slice(token.index + raw.length, close.index) : '';
    if (continuationPrefix) content = content.split('\n').map((line, index) => index && line.startsWith(continuationPrefix) ? line.slice(continuationPrefix.length) : line).join('\n');
    content = content.replace(/^\r?\n/, '').replace(/\r?\n[ \t]*$/, '');
    const attributes = parseAttributes(rawAttributes.replace(/\/\s*$/, ''));
    if (String(attributes.contentencoding).toLowerCase() === 'html') content = decodeBody(content);
    const boolean = (name, fallback) => attributes[name] == null ? fallback : !['false', '0', 'no', 'off', 'hidden'].includes(String(attributes[name]).toLowerCase());
    const type = blockTypes[tagName.toLowerCase()];
    const form = type === 'code' ? { title: attributes.title || '', language: attributes.language || 'java', codeString: content, defaultExpanded: boolean('defaultexpanded', false), showLineNumbers: boolean('showlinenumbers', true), wrapLines: boolean('wraplines', true) }
      : type === 'image' ? { src: attributes.src || '', alt: attributes.alt || '', caption: attributes.caption || '' }
      : type === 'bookmark' ? { url: attributes.url || '', title: attributes.title || '', description: attributes.description || '', imageUrl: attributes.imageurl || '' }
      : { severity: attributes.severity || 'info', message: content.replace(/^\n|\n$/g, '') };
    const blockEnd = close ? close.index + close[0].length : token.index + raw.length;
    blocks.push({ type, tagName, attributes, form, start: token.index, end: blockEnd, continuationPrefix, source: value.slice(token.index, blockEnd) });
  };
  for (const token of value.matchAll(tagPattern)) {
    const [, closing, rawName, attributes] = token;
    const name = rawName.toLowerCase();
    if (htmlCode) { if (closing && name === htmlCode) htmlCode = null; continue; }
    if (inside(literals, token.index)) continue;
    const codeParent = stack.find(item => item[2].toLowerCase() === 'codeaccordion');
    if (codeParent && name !== 'codeaccordion') continue;
    if (!codeParent && !closing && (name === 'pre' || name === 'code')) { htmlCode = name; continue; }
    if (!blockTypes[name]) continue;
    if (stack.some(item => /^alert(?:block)?$/i.test(item[2])) && inside(alertLiterals, token.index)) continue;
    if (!closing) {
      if (/\/\s*$/.test(attributes)) add(token);
      else stack.push(token);
    } else {
      const index = stack.findLastIndex(item => item[2].toLowerCase() === name);
      if (index !== -1) {
        const open = stack[index];
        stack.splice(index);
        add(open, token);
      }
    }
  }
  return blocks.filter(block => block.start <= start && (start < block.end || start !== end) && block.end >= end).sort((a, b) => (a.end - a.start) - (b.end - b.start))[0] || null;
}

export function normalizeNotionId(value) {
  const input = value.trim();
  const uuid = '[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}';
  if (new RegExp(`^${uuid}$`, 'i').test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || !/(^|\.)notion\.(so|site)$/i.test(url.hostname)) return null;
    return url.pathname.match(new RegExp(`(${uuid})/?$`, 'i'))?.[1] || null;
  } catch { return null; }
}
