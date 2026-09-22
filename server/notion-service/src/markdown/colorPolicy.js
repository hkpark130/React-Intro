export const markdownColorOptions = [
  { token: 'default', label: '기본' },
  { token: 'gray', label: '회색' },
  { token: 'brown', label: '갈색' },
  { token: 'orange', label: '주황' },
  { token: 'yellow', label: '노랑' },
  { token: 'green', label: '초록' },
  { token: 'blue', label: '파랑' },
  { token: 'purple', label: '보라' },
  { token: 'pink', label: '분홍' },
  { token: 'red', label: '빨강' },
];

export const markdownTextColors = {
  gray: '#586662',
  brown: '#76533d',
  orange: '#9a4e1b',
  yellow: '#765d00',
  green: '#2d6a4f',
  blue: '#2866a8',
  purple: '#6650a4',
  pink: '#9d3f70',
  red: '#b33c32',
};

export const markdownBackgroundColors = {
  gray: '#dfe4e2',
  brown: '#e8cdb8',
  orange: '#f7c58f',
  yellow: '#ffe082',
  green: '#b9dfc7',
  blue: '#b9d8f3',
  purple: '#d2c2f0',
  pink: '#f6b8d3',
  red: '#f4b4ad',
};

export function normalizeMarkdownColor(value, palette) {
  const token = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return Object.hasOwn(palette, token) ? token : '';
}

export function markdownColorStyle(textColor, backgroundColor) {
  const text = normalizeMarkdownColor(textColor, markdownTextColors);
  const background = normalizeMarkdownColor(backgroundColor, markdownBackgroundColors);
  return {
    ...(text ? { color: markdownTextColors[text] } : {}),
    ...(background ? { backgroundColor: markdownBackgroundColors[background] } : {}),
  };
}

export function markdownColorCss() {
  const rules = [];
  for (const [token, color] of Object.entries(markdownTextColors)) rules.push(`[data-text-color="${token}"]{color:${color}}`);
  for (const [token, color] of Object.entries(markdownBackgroundColors)) rules.push(`[data-background-color="${token}"]{background-color:${color}}`);
  return rules.join('');
}
