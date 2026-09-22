import { Tooltip } from '@mui/material';
import EditorToolIcon from './EditorToolIcon';
import { editorTools } from './editorTools';

export function EditorToolButton({ icon, children, description, shortcut, onClick, disabled, className = '' }) {
  return <Tooltip title={disabled ? '' : [description, shortcut].filter(Boolean).join(' · ')} arrow enterDelay={450}>
    <button type="button" className={`editor-tool ${className}`} aria-label={typeof children === 'string' ? children : undefined} onMouseDown={event => event.preventDefault()} onClick={onClick} disabled={disabled}>
      {icon && <EditorToolIcon name={icon} />}<span className="editor-tool-label">{children}</span>
    </button>
  </Tooltip>;
}

export default function EditorToolbar({ onAction, onSearch, disabled }) {
  return <div className="editor-toolbar" aria-label="본문 편집 도구">
    <div className="editor-ribbon">
      {['서식', '문단', '삽입'].map(group => <div className={`editor-ribbon-group editor-ribbon-group--${group === '삽입' ? 'insert' : 'format'}`} role="group" aria-label={group} key={group}>
        <span className="editor-group-label">{group}</span>
        <div className="editor-tool-items">
          {editorTools.filter(tool => tool.group === group && !['paragraph', 'heading2', 'heading3', 'heading4'].includes(tool.id)).map(tool => <EditorToolButton key={tool.id} icon={tool.icon} description={tool.description} shortcut={tool.shortcut} onClick={event => onAction(tool.id, event)} disabled={disabled} className={tool.id === 'color' ? 'editor-color-trigger' : ''}>{tool.label}</EditorToolButton>)}
        </div>
        {group === '서식' && <div className="editor-heading-tools" role="group" aria-label="제목 단계">
          {editorTools.filter(tool => ['paragraph', 'heading2', 'heading3', 'heading4'].includes(tool.id)).map(tool => <EditorToolButton key={tool.id} icon={tool.icon} description={tool.description} onClick={event => onAction(tool.id, event)} disabled={disabled}>{tool.label}</EditorToolButton>)}
        </div>}
      </div>)}
    </div>
    <div className="editor-toolbar-bottom">
      <EditorToolButton icon="search" description="이름으로 도구 찾기 · 빈 줄에서 /" onClick={onSearch} disabled={disabled} className="editor-search-trigger">도구 검색</EditorToolButton>
      <span className="editor-slash-hint">빈 줄에서 <kbd>/</kbd> 를 눌러도 됩니다</span>
      <div className="editor-tool-utilities">
        {editorTools.filter(tool => tool.group === '관리').map(tool => <EditorToolButton key={tool.id} icon={tool.icon} description={tool.description} onClick={event => onAction(tool.id, event)} disabled={disabled}>{tool.label}</EditorToolButton>)}
      </div>
    </div>
  </div>;
}
