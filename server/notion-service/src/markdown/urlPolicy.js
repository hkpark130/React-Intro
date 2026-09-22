const relativeOrigin = 'https://markdown.invalid';
const relativeBase = `${relativeOrigin}/`;
const linkSchemes = new Set(['http', 'https', 'mailto']);
const mediaSchemes = new Set(['http', 'https']);

/**
 * A display/navigation policy, not an SSR fetch allowlist. Call after the
 * Markdown/HTML parser has decoded attributes; never decode the result again.
 */
export function sanitizeMarkdownUrl(value, { kind = 'link', allowRelative = true } = {}) {
  if (typeof value !== 'string') return '';
  // WHATWG URL parsing can silently remove controls or turn backslashes into
  // authority separators. Reject those spellings before normalizing the URL.
  // eslint-disable-next-line no-control-regex -- Matching controls is the validation, not a literal typo.
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return '';
  const candidate = value.trim();
  if (!candidate || candidate.startsWith('//')) return '';

  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(candidate)?.[1].toLowerCase();
  if (scheme && !(kind === 'link' ? linkSchemes : mediaSchemes).has(scheme)) return '';
  if (!scheme && !allowRelative) return '';
  // Keep only explicit HTTP authorities, rather than browser repairs such as
  // "https:example.com" and "https:///example.com".
  if (mediaSchemes.has(scheme) && !/^https?:\/\/[^/?#]/i.test(candidate)) return '';

  try {
    const url = new URL(candidate, relativeBase);
    if (url.username || url.password) return '';
    if (!scheme && url.origin !== relativeOrigin) return '';
    if (scheme === 'mailto' && !url.pathname) return '';
    return candidate;
  } catch {
    return '';
  }
}
