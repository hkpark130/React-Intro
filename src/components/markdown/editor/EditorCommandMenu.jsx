import { useEffect, useId, useRef, useState } from 'react';
import { Popover } from '@mui/material';
import EditorToolIcon from './EditorToolIcon';
import { filterEditorTools } from './editorTools';

export default function EditorCommandMenu({ menu, onClose, onAction, onExited }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef(null);
  const id = useId();
  const results = filterEditorTools(query);
  useEffect(() => { if (menu) { setQuery(''); setActive(0); } }, [menu]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' }); }, [active]);
  const handleKey = event => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (results.length) setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length);
    } else if (event.key === 'Enter') { event.preventDefault(); if (results[active]) onAction(results[active].id); }
  };
  return <Popover open={Boolean(menu)} anchorReference="anchorPosition" anchorPosition={menu?.position || { top: 0, left: 0 }} onClose={onClose} disableRestoreFocus transitionDuration={120} className="editor-command-popover" slotProps={{ paper: { role: 'dialog', 'aria-label': '편집 도구 찾기', className: 'editor-command-menu' }, transition: { onExited } }}>
    <div className="editor-command-search"><EditorToolIcon name="search" /><input autoFocus aria-label="도구 검색" role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={results[active] ? `${id}-${results[active].id}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={handleKey} placeholder="어떤 도구를 찾으세요?" /></div>
    <div className="editor-command-results" id={`${id}-list`} role="listbox" aria-label="편집 도구" ref={listRef}>
      {results.map((tool, index) => <div key={tool.id}>
        {(index === 0 || results[index - 1].group !== tool.group) && <div className="editor-command-group">{tool.group}</div>}
        <div id={`${id}-${tool.id}`} role="option" aria-selected={active === index} className="editor-command-option" onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => onAction(tool.id)}>
          <span className="editor-command-icon"><EditorToolIcon name={tool.icon} /></span><span><strong>{tool.label}</strong><small>{tool.description}</small></span>
        </div>
      </div>)}
      {!results.length && <p className="editor-command-empty" role="status">검색 결과가 없습니다. 다른 이름으로 찾아보세요.</p>}
    </div>
    <div className="editor-command-footer"><span>↑↓ 이동 · Enter 선택</span><span>Esc 닫기</span></div>
  </Popover>;
}
