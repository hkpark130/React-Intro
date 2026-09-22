import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { markdownTags } from './htmlPolicy.js';

const parser = unified().use(remarkParse);
const customTags = new Set(['codeaccordion', 'zoomableimagemodal', 'bookmark', 'alert', 'alertblock']);
const allowedTags = new Set(markdownTags);
// Quotes (including the editor's backslash escapes) belong to the attribute,
// so a > in a title cannot terminate a tag.
const tagPattern = /<(\/?)([a-z][\w-]*)((?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^'">])*)>/gi;

function decodeEntities(value) {
  return value.replace(/&(quot|apos|amp|lt|gt|#\d+|#x[\da-f]+);/gi, (entity, code) => {
    const named = { quot: '"', apos: "'", amp: '&', lt: '<', gt: '>' };
    if (named[code.toLowerCase()]) return named[code.toLowerCase()];
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

export function parseAttributes(source = '') {
  const attributes = {};
  const pattern = /([\w-]+)(?:\s*=\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    const value = match[2] ?? match[3] ?? match[4];
    attributes[match[1].toLowerCase()] = value === undefined ? true : decodeEntities(value.replace(/\\(["'\\])/g, '$1'));
  }
  return attributes;
}

function codeRanges(markdown, unwrapAlerts = false) {
  const ranges = [];
  const walk = node => {
    if (node.type === 'code' || node.type === 'inlineCode') {
      ranges.push([node.position.start.offset, node.position.end.offset]);
    } else node.children?.forEach(walk);
  };
  // Alert bodies are Markdown even when their wrappers look like raw HTML to
  // remark. Mask only those wrappers, preserving every offset and newline.
  // Non-whitespace keeps an inline wrapper from becoming an indented code block.
  const source = unwrapAlerts ? markdown.replace(tagPattern, (tag, closing, name) =>
    ['alert', 'alertblock'].includes(name.toLowerCase()) ? tag.replace(/[^\r\n]/g, 'x') : tag) : markdown;
  walk(parser.parse(source));
  return ranges;
}

// Remark emits disjoint code ranges in source order. Token checks need not
// rescan every fenced/inline code range for every tag in a long article.
function containsOffset(ranges, offset) {
  let low = 0;
  let high = ranges.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const [start, end] = ranges[middle];
    if (offset < start) high = middle - 1;
    else if (offset >= end) low = middle + 1;
    else return true;
  }
  return false;
}

function matchingEnds(tokens, isLiteral, isAlertLiteral) {
  const ends = new Map();
  const stacks = new Map();
  const rawEnds = new Map();
  // Raw pre/code preserve the historical first-closing-tag behavior.
  for (let index = tokens.length - 1; index >= 0; index--) {
    const token = tokens[index];
    const name = token[2].toLowerCase();
    if (name !== 'pre' && name !== 'code') continue;
    if (token[1]) rawEnds.set(name, index);
    else if (rawEnds.has(name)) ends.set(index, rawEnds.get(name));
  }
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    const name = token[2].toLowerCase();
    if (!customTags.has(name)) continue;
    const literal = name === 'alert' || name === 'alertblock' ? isAlertLiteral : isLiteral;
    if (literal(token.index)) continue;
    const stack = stacks.get(name) || [];
    if (token[1]) {
      const start = stack.pop();
      if (start !== undefined) ends.set(start, index);
    } else if (!/\/\s*$/.test(token[3])) stack.push(index);
    stacks.set(name, stack);
  }
  return ends;
}

/** Preserve Markdown literals before handling the existing, non-executable tag vocabulary. */
export function prepareMarkdown(value) {
  if (typeof value !== 'string' || !value) return { text: '', components: [] };
  const tokens = [...value.matchAll(tagPattern)];
  if (!tokens.length) return { text: value, components: [] };
  const ranges = codeRanges(value);
  const isLiteral = offset => containsOffset(ranges, offset);
  const hasAlerts = tokens.some(token => !token[1] && /^(?:alert|alertblock)$/i.test(token[2]) && !isLiteral(token.index));
  const alertRanges = hasAlerts ? codeRanges(value, true) : ranges;
  const isAlertLiteral = offset => containsOffset(alertRanges, offset);
  const ends = matchingEnds(tokens, isLiteral, isAlertLiteral);
  const components = [];
  let text = '';
  let cursor = 0;
  const placeholder = (tagName, attributes, content, offset) => {
    const linePrefix = value.slice(value.lastIndexOf('\n', offset - 1) + 1, offset);
    // Quotes and list markers may alternate in either order at any depth.
    const container = /^(?:[ \t]+|>[ \t]?|(?:[-+*]|\d{1,9}[.)])[ \t]+)*/.exec(linePrefix)[0];
    // New lines must continue the same quote/list. A list marker is used only
    // on its first line; continuation lines retain its equivalent indentation.
    const prefix = container.replace(/(?:[-+*]|\d{1,9}[.)])(?=[ \t])/g, marker => ' '.repeat(marker.length));
    // The outer Markdown parser owns the quote/list prefix. Remove that prefix
    // once from child lines before rendering the component's own Markdown/code.
    let inner = prefix ? content.split('\n').map((line, index) => {
      if (!index) return line;
      if (line.startsWith(prefix)) return line.slice(prefix.length);
      return line === prefix.trimEnd() ? '' : line;
    }).join('\n') : content;
    // The editor opts in when literal closing tags occur in a component body.
    // Decode once, after matching wrappers and removing the outer container.
    if (['codeaccordion', 'alert', 'alertblock'].includes(tagName)
        && /\bcontentencoding\s*=/i.test(attributes)
        && parseAttributes(attributes).contentencoding === 'html') inner = decodeEntities(inner);
    const id = `__CUSTOM_COMPONENT_${components.length}__`;
    components.push({ id, tagName, attributes, content: inner });
    if (tagName === 'inlinecode') return `<span data-custom-placeholder="${id}"></span>`;
    // An empty first list item cannot be followed by a blank line before its
    // content. Keep a block that already starts its source line on that line.
    const before = linePrefix === container ? '' : `\n${prefix}\n${prefix}`;
    return `${before}<div data-custom-placeholder="${id}"></div>\n${prefix}\n${prefix}`;
  };

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.index < cursor || isLiteral(token.index)) continue;
    const [raw, closing, rawName, attributes] = token;
    const name = rawName.toLowerCase();
    text += value.slice(cursor, token.index);
    cursor = token.index + raw.length;

    // Historical posts use xmp inside pre to explain HTML, including script tags.
    if (!closing && name === 'pre') {
      const legacy = /^\s*<xmp\b[^>]*>([\s\S]*?)<\/xmp>\s*<\/pre>/i.exec(value.slice(cursor));
      if (legacy) {
        text += placeholder('literalcode', '', legacy[1], token.index);
        cursor += legacy[0].length;
        continue;
      }
    }

    if (!closing && customTags.has(name)) {
      if (/\/\s*$/.test(attributes)) {
        text += placeholder(name, attributes.replace(/\/\s*$/, ''), '', token.index);
        continue;
      }
      const endIndex = ends.get(index);
      const end = tokens[endIndex];
      if (end) {
        text += placeholder(name, attributes, value.slice(cursor, end.index), token.index);
        cursor = end.index + end[0].length;
        index = endIndex;
        continue;
      }
    }

    // Protect raw HTML code containers from custom-tag extraction too.
    if (!closing && (name === 'pre' || name === 'code')) {
      const endIndex = ends.get(index);
      const end = tokens[endIndex];
      if (end) {
        let inner = value.slice(cursor, end.index);
        if (name === 'pre') inner = inner.replace(/^\s*<code\b[^>]*>([\s\S]*)<\/code>\s*$/i, '$1');
        text += placeholder(name === 'pre' ? 'literalcode' : 'inlinecode', '', decodeEntities(inner), token.index);
        cursor = end.index + end[0].length;
        index = endIndex;
        continue;
      }
    }
    // Compatibility escape only; this is not a general-purpose HTML sanitizer.
    text += allowedTags.has(name) ? raw : raw.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  return { text: text + value.slice(cursor), components };
}
