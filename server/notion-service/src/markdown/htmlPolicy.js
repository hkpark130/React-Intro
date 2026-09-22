import { sanitizeMarkdownUrl } from './urlPolicy.js';
import { markdownBackgroundColors, markdownTextColors, normalizeMarkdownColor } from './colorPolicy.js';

// The author-controlled vocabulary is shared by the HTML sanitizer and the
// browser's HAST sanitizer. Component UI adds its own trusted attributes later.
export const markdownTags = [
  'section', 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a',
  'ul', 'ol', 'li', 'pre', 'code', 'em', 'strong', 'br', 'hr', 'blockquote',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption',
  'details', 'summary', 'aside', 'video', 'source', 'u', 'small', 'mark', 'b', 'del', 'input',
];

export const markdownAttributes = {
  '*': ['id', 'title'],
  a: ['href'], img: ['src', 'alt', 'width', 'height', 'loading'],
  code: ['class'], details: ['open'], aside: ['role', 'data-severity'],
  ol: ['start'], li: ['value'],
  th: ['align', 'colspan', 'rowspan', 'style'], td: ['align', 'colspan', 'rowspan', 'style'],
  video: ['src', 'controls', 'poster', 'width', 'height', 'preload'], source: ['src', 'type'],
  input: ['type', 'checked', 'disabled'],
  span: ['data-text-color', 'data-background-color'],
};

export const languageClassPattern = /^language-[\w-]+$/;
export const tableAlignmentPattern = /^(?:left|right|center)$/;

const alignment = value => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return tableAlignmentPattern.test(normalized) ? normalized : '';
};

// This accepts only a tiny value grammar and emits fresh CSS. It does not
// forward arbitrary declarations, URLs, escapes, functions or !important.
function tableStyle(value) {
  if (typeof value !== 'string') return '';
  let textAlign = '';
  for (const declaration of value.split(';')) {
    const match = /^\s*text-align\s*:\s*(left|right|center)\s*$/i.exec(declaration);
    if (match) textAlign = match[1].toLowerCase();
  }
  return textAlign ? `text-align:${textAlign}` : '';
}

/** Normalize the few allowed URL, CSS and interactive values before sanitizing. */
export function normalizeMarkdownAttributes(tagName, input) {
  if (tagName === 'input') {
    return { type: 'checkbox', disabled: true, ...(Object.hasOwn(input, 'checked') && input.checked !== false ? { checked: true } : {}) };
  }
  const attrs = { ...input };
  if (tagName === 'span') {
    const textColor = normalizeMarkdownColor(attrs['data-text-color'], markdownTextColors);
    const backgroundColor = normalizeMarkdownColor(attrs['data-background-color'], markdownBackgroundColors);
    if (textColor) attrs['data-text-color'] = textColor;
    else delete attrs['data-text-color'];
    if (backgroundColor) attrs['data-background-color'] = backgroundColor;
    else delete attrs['data-background-color'];
  }
  for (const name of ['href', 'src', 'poster']) {
    if (!Object.hasOwn(attrs, name)) continue;
    const safe = sanitizeMarkdownUrl(attrs[name], { kind: name === 'href' ? 'link' : 'media' });
    if (safe) attrs[name] = safe;
    else delete attrs[name];
  }
  const cell = tagName === 'th' || tagName === 'td';
  const safeStyle = cell ? tableStyle(attrs.style) : '';
  if (safeStyle) {
    attrs.style = safeStyle;
    // CSS takes precedence over the legacy align attribute. Removing the
    // redundant attribute also prevents the JSX adapter from reversing that.
    delete attrs.align;
  }
  else delete attrs.style;
  if (Object.hasOwn(attrs, 'align')) {
    const safeAlign = cell ? alignment(attrs.align) : '';
    if (safeAlign) attrs.align = safeAlign;
    else delete attrs.align;
  }
  return attrs;
}
