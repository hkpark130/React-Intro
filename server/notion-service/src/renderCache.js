import { createHash } from 'node:crypto';

// The input is fetched from Spring for each request, so an edit invalidates
// rendered HTML immediately without another service or a cross-process cache.
export function createRenderCache({ maxEntries = 24, maxBytes = 4 * 1024 * 1024 } = {}) {
  const entries = new Map();
  let bytes = 0;
  return {
    render(post, options, renderPage) {
      const key = createHash('sha256').update(JSON.stringify([post, options])).digest('hex');
      const previous = entries.get(key);
      if (previous) {
        entries.delete(key); entries.set(key, previous);
        return previous.html;
      }
      const html = renderPage(post, options);
      const size = new TextEncoder().encode(html).byteLength;
      if (size > maxBytes) return html;
      while (entries.size >= maxEntries || bytes + size > maxBytes) {
        const oldestKey = entries.keys().next().value;
        bytes -= entries.get(oldestKey).size;
        entries.delete(oldestKey);
      }
      entries.set(key, { html, size }); bytes += size;
      return html;
    },
    get size() { return entries.size; },
    get bytes() { return bytes; },
  };
}

