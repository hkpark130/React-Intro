/** Measure wrapped textarea text without changing its focus or selection. */
export function editorMenuPosition(textarea) {
  const rectangle = textarea.getBoundingClientRect();
  const style = getComputedStyle(textarea);
  const mirror = document.createElement('div');
  for (const name of ['font', 'letterSpacing', 'lineHeight', 'padding', 'border', 'boxSizing', 'tabSize', 'wordBreak', 'overflowWrap']) mirror.style[name] = style[name];
  Object.assign(mirror.style, { position: 'fixed', visibility: 'hidden', pointerEvents: 'none', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', width: `${textarea.clientWidth}px`, left: '0', top: '0' });
  mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
  const marker = document.createElement('span');
  marker.textContent = '\u200b';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const caret = marker.getBoundingClientRect();
  const top = rectangle.top + caret.top - textarea.scrollTop + (Number.parseFloat(style.lineHeight) || 24);
  const left = rectangle.left + caret.left - textarea.scrollLeft;
  mirror.remove();
  return { top: Math.round(Math.max(16, Math.min(innerHeight - 80, top))), left: Math.round(Math.max(16, Math.min(innerWidth - 48, left))) };
}
