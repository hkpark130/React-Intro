import { memo, useDeferredValue, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import EditorBlockDialog from './editor/EditorBlockDialog';
import NotionImportDialog from './editor/NotionImportDialog';
import useEditorHistory from './editor/useEditorHistory';
import { applyMarkdownCommand, canOpenSlashMenu, findCustomBlock, getActiveMarkdownColors, insertMarkdown, makeCodeFence, makeMarkdownLink, makeTable, serializeCustomBlock } from './editor/editorCommands';
import EditorToolbar, { EditorToolButton as ToolButton } from './editor/EditorToolbar';
import EditorCommandMenu from './editor/EditorCommandMenu';
import EditorColorMenu from './editor/EditorColorMenu';
import { editorMenuPosition } from './editor/editorMenuPosition';
import './editor/markdown-editor.css';

const EditorPreview = memo(function EditorPreview({ content }) {
  return content.trim() ? <MarkdownRenderer content={content} /> : <p className="editor-empty-preview">본문을 작성하면 서식이 여기에 나타납니다.</p>;
});

const initialForm = (type, selected) => ({
  code: { title: '', language: 'bash', codeString: selected, defaultExpanded: false, showLineNumbers: true, wrapLines: true },
  image: { src: '', alt: selected, caption: '' },
  bookmark: { url: /^https?:\/\//.test(selected) ? selected : '', title: /^https?:\/\//.test(selected) ? '' : selected, description: '', imageUrl: '' },
  alert: { severity: 'info', message: selected },
  table: { rows: 3, columns: 3 },
  link: { url: '', text: selected },
}[type]);

export default function MarkdownEditor({ value = '', onChange, disabled = false }) {
  const content = value ?? '';
  const editorId = useId();
  const shellRef = useRef(null);
  const history = useEditorHistory(content, onChange);
  const { restoreSelection } = history;
  const [view, setView] = useState('split');
  const [canSplit, setCanSplit] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [notionOpen, setNotionOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [commandMenu, setCommandMenu] = useState(null);
  const [colorMenu, setColorMenu] = useState(null);
  const menuRestore = useRef(null);
  const colorRestore = useRef(null);
  const dialogSelection = useRef(null);
  const notionAnchor = useRef(null);
  const focusAfterView = useRef(false);
  const previewContent = useDeferredValue(content);
  const displayMode = view === 'split' && !canSplit ? 'write' : view;
  const toolsDisabled = disabled || history.isComposing;

  useEffect(() => {
    const element = shellRef.current;
    const measure = () => setCanSplit((element?.getBoundingClientRect().width || window.innerWidth - 160) >= 860);
    measure();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (element) observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  useLayoutEffect(() => {
    if (focusAfterView.current && displayMode !== 'preview') {
      restoreSelection();
      focusAfterView.current = false;
    }
  }, [displayMode, restoreSelection]);

  const showWriting = () => {
    if (displayMode === 'preview') setView(canSplit ? 'split' : 'write');
  };
  const changeView = next => {
    history.captureSelection();
    if (next !== 'preview') focusAfterView.current = true;
    setView(next);
    if (next === displayMode && next !== 'preview') history.restoreSelection();
  };
  const command = action => {
    if (toolsDisabled) return;
    const range = history.captureSelection();
    history.commit(applyMarkdownCommand(content, range, action));
    showWriting();
    setNotice('서식을 적용했습니다. 실행 취소로 되돌릴 수 있습니다.');
  };
  const openColor = (event, savedAnchor, savedPosition) => {
    if (toolsDisabled) return;
    const anchor = savedAnchor || history.captureSelection();
    const bounds = event?.currentTarget?.getBoundingClientRect();
    const position = savedPosition || { top: Math.round(bounds.bottom + 6), left: Math.round(bounds.left) };
    colorRestore.current = anchor;
    setColorMenu({ anchor, position, colors: getActiveMarkdownColors(content, anchor) });
  };
  const closeColor = () => setColorMenu(null);
  const applyColor = (kind, color) => {
    if (!colorMenu || disabled) return;
    if (colorMenu.anchor.value !== content) {
      colorRestore.current = null;
      setColorMenu(null);
      setNotice('본문이 바뀌었습니다. 색상을 적용할 문구를 다시 선택하세요.');
      return;
    }
    try {
      const result = applyMarkdownCommand(content, colorMenu.anchor, `${kind}:${color}`);
      history.commit(result);
      history.restoreSelection(result);
      setTimeout(() => history.restoreSelection(result), 0);
      colorRestore.current = result;
      setColorMenu(null);
      showWriting();
      setNotice(color === 'default' ? '선택한 색상을 해제했습니다.' : '선택한 문구에 색상을 적용했습니다.');
    } catch (error) {
      setColorMenu(null);
      setNotice(error.message);
    }
  };
  const restoreAfterColor = () => {
    if (colorRestore.current?.value === content) history.restoreSelection(colorRestore.current, displayMode !== 'preview');
    else if (displayMode !== 'preview') history.restoreSelection();
    else shellRef.current?.querySelector('.editor-color-trigger')?.focus();
    colorRestore.current = null;
  };
  const openBlock = type => {
    if (toolsDisabled) return;
    const anchor = history.captureSelection();
    dialogSelection.current = anchor;
    const plain = type === 'fence';
    const blockType = plain ? 'code' : type;
    setDialog({ type: blockType, plain, form: initialForm(blockType, content.slice(anchor.start, anchor.end)), anchor, error: '' });
  };
  const editBlock = () => {
    if (toolsDisabled) return;
    const anchor = history.captureSelection();
    const block = findCustomBlock(content, anchor);
    if (!block) { setNotice('수정할 접는 코드, 확대 이미지, 링크 카드 또는 안내 상자 안에 커서를 놓고 블록 수정을 선택하세요.'); return; }
    dialogSelection.current = anchor;
    setDialog({ type: block.type, form: block.form, anchor, block, error: '' });
  };
  const closeBlock = () => { if (dialog) dialogSelection.current = dialog.anchor; setDialog(null); };
  const restoreAfterDialog = () => {
    if (dialogSelection.current) history.restoreSelection(dialogSelection.current, displayMode !== 'preview');
    if (displayMode === 'preview') shellRef.current?.querySelector('.editor-mode-buttons button[aria-pressed="true"]')?.focus();
  };
  const submitBlock = ({ asFence = false } = {}) => {
    if (!dialog || disabled) return;
    try {
      if (dialog.anchor.value !== content) throw new Error('대화 상자를 연 뒤 본문이 바뀌었습니다. 닫고 삽입할 위치를 다시 선택하세요.');
      const { type, form, block, anchor } = dialog;
      let source;
      if (type === 'table') source = makeTable(Number(form.rows), Number(form.columns));
      else if (type === 'link') source = makeMarkdownLink(form.text, form.url);
      else if (asFence || dialog.plain) {
        if (!form.codeString.trim()) throw new Error('코드 내용을 입력하세요.');
        source = makeCodeFence(form.codeString, form.language);
        if (block?.continuationPrefix) source = source.split('\n').map((line, index) => (index ? block.continuationPrefix : '') + line).join('\n');
      } else source = serializeCustomBlock(type, form, block);
      const result = insertMarkdown(content, block || anchor, source, { block: !block && type !== 'link' });
      history.commit(result);
      dialogSelection.current = result;
      setDialog(null);
      showWriting();
      setNotice(block ? '블록을 수정했습니다.' : '커서 위치에 내용을 넣었습니다.');
    } catch (error) { setDialog(previous => ({ ...previous, error: error.message })); }
  };
  const openNotion = () => {
    if (toolsDisabled) return;
    const anchor = history.captureSelection();
    notionAnchor.current = anchor;
    dialogSelection.current = anchor;
    setNotionOpen(true);
  };
  const insertNotion = markdown => {
    const latest = history.captureSelection();
    if (disabled || notionAnchor.current?.value !== latest.value) throw new Error('가져오는 동안 본문이 바뀌었습니다. 닫고 삽입할 위치를 다시 선택하세요.');
    const result = insertMarkdown(latest.value, notionAnchor.current, markdown, { block: true });
    history.commit(result);
    dialogSelection.current = result;
    showWriting();
    setNotice('Notion 내용을 넣었습니다. 게시 전에 미리보기에서 확인하세요.');
  };
  const performAction = (action, event) => {
    if (toolsDisabled) return;
    if (action === 'color') openColor(event);
    else if (['code', 'fence', 'image', 'table', 'bookmark', 'alert', 'link'].includes(action)) openBlock(action);
    else if (action === 'edit') editBlock();
    else if (action === 'notion') openNotion();
    else command(action);
  };
  const openCommandMenu = (event, fromCaret = false) => {
    if (toolsDisabled) return;
    const anchor = history.captureSelection();
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = fromCaret ? editorMenuPosition(history.textareaRef.current) : { top: Math.round(bounds.bottom + 6), left: Math.round(bounds.left) };
    menuRestore.current = anchor;
    setCommandMenu({ anchor, position });
  };
  const chooseCommand = action => {
    if (disabled || commandMenu?.anchor.value !== content) {
      menuRestore.current = null;
      setCommandMenu(null);
      setNotice('본문이 바뀌었습니다. 삽입할 위치에서 도구를 다시 선택하세요.');
      return;
    }
    // The textarea keeps its selection while the palette has focus.
    const selectedMenu = commandMenu;
    menuRestore.current = null;
    setCommandMenu(null);
    if (action === 'color') openColor(null, selectedMenu.anchor, selectedMenu.position);
    else performAction(action);
  };
  const restoreAfterMenu = () => {
    if (dialog || notionOpen || colorMenu) return;
    if (menuRestore.current?.value === content) history.restoreSelection(menuRestore.current, displayMode !== 'preview');
    else if (displayMode !== 'preview') history.restoreSelection();
    else shellRef.current?.querySelector('.editor-search-trigger')?.focus();
  };
  const handleKeyDown = event => {
    if (history.handleHistoryKey(event)) return;
    if (toolsDisabled || event.nativeEvent.isComposing || event.keyCode === 229) return;
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && canOpenSlashMenu(content, history.captureSelection())) {
      event.preventDefault(); openCommandMenu(event, true); return;
    }
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const key = event.key.toLowerCase();
    if (key === 'b' || key === 'i') { event.preventDefault(); command(key === 'b' ? 'bold' : 'italic'); }
    else if (key === 'k') { event.preventDefault(); openBlock('link'); }
  };
  const undo = () => { history.undo(); showWriting(); setNotice('이전 편집으로 되돌렸습니다.'); };
  const redo = () => { history.redo(); showWriting(); setNotice('편집을 다시 적용했습니다.'); };

  return <div className="markdown-editor" ref={shellRef} data-view={displayMode}>
    <div className="editor-topline">
      <div className="editor-mode-buttons" role="group" aria-label="본문 보기 방식">
        <button type="button" aria-pressed={displayMode === 'write'} onClick={() => changeView('write')}>작성</button>
        {canSplit && <button type="button" aria-pressed={displayMode === 'split'} onClick={() => changeView('split')}>나란히</button>}
        <button type="button" aria-pressed={displayMode === 'preview'} onClick={() => changeView('preview')}>미리보기</button>
      </div>
      <div className="editor-history" role="group" aria-label="편집 이력">
        <ToolButton icon="undo" onClick={undo} disabled={toolsDisabled || !history.canUndo} shortcut="Ctrl/⌘ + Z">실행 취소</ToolButton>
        <ToolButton icon="redo" onClick={redo} disabled={toolsDisabled || !history.canRedo} shortcut="Ctrl/⌘ + Shift + Z">다시 실행</ToolButton>
      </div>
    </div>
    <EditorToolbar onAction={performAction} onSearch={openCommandMenu} disabled={toolsDisabled} />
    <div className="editor-workspace">
      <section className="editor-writing-pane" hidden={displayMode === 'preview'} aria-label="Markdown 작성">
        <div className="editor-pane-heading"><label htmlFor={`${editorId}-source`}>Markdown</label><span>문구 선택 후 서식 적용 · 빈 줄에서 /</span></div>
        <textarea id={`${editorId}-source`} ref={history.textareaRef} value={content} onChange={history.handleChange} onKeyDown={handleKeyDown} onSelect={history.captureSelection} onBlur={history.captureSelection} onCompositionStart={history.handleCompositionStart} onCompositionEnd={history.handleCompositionEnd} aria-label="게시글 Markdown 본문" aria-describedby={`${editorId}-help`} disabled={disabled} spellCheck={false} rows={22} placeholder="첫 문단부터 작성해 보세요. Markdown을 붙여넣어도 됩니다." />
      </section>
      {displayMode !== 'write' && <section className="editor-preview-pane" aria-label="본문 미리보기" aria-busy={content !== previewContent} tabIndex={0}>
        <div className="editor-pane-heading"><span>미리보기</span><span>게시글과 같은 서식</span></div>
        <div className="editor-preview-content" tabIndex={0} aria-label="미리보기 스크롤 영역"><EditorPreview content={previewContent} /></div>
      </section>}
    </div>
    <div className="editor-footline"><p id={`${editorId}-help`}>블록 안에 커서를 놓으면 <b>블록 수정</b>으로 내용을 바꿀 수 있습니다.</p><span>{Array.from(content).length.toLocaleString('ko-KR')}자</span></div>
    <p className="editor-status" role="status">{history.isComposing ? '한글 조합 중…' : notice || '입력한 내용은 게시하기 전까지 저장되지 않습니다.'}</p>
    <EditorCommandMenu menu={commandMenu} onClose={() => setCommandMenu(null)} onAction={chooseCommand} onExited={restoreAfterMenu} />
    <EditorColorMenu menu={colorMenu} onClose={closeColor} onSelect={applyColor} onExited={restoreAfterColor} />
    <EditorBlockDialog dialog={dialog} onChange={form => setDialog(previous => ({ ...previous, form, error: '' }))} onSubmit={submitBlock} onClose={closeBlock} onExited={restoreAfterDialog} />
    <NotionImportDialog open={notionOpen} onClose={() => setNotionOpen(false)} onExited={restoreAfterDialog} onInsert={insertNotion} />
  </div>;
}
