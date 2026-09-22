import { Popover } from '@mui/material';
import Check from '@mui/icons-material/Check';
import {
  markdownBackgroundColors, markdownColorOptions, markdownTextColors,
} from '../../../../server/notion-service/src/markdown/colorPolicy.js';

const sections = [
  { kind: 'textColor', label: '글자색', attribute: 'textColor', palette: markdownTextColors },
  { kind: 'backgroundColor', label: '배경색', attribute: 'backgroundColor', palette: markdownBackgroundColors },
];

export default function EditorColorMenu({ menu, onClose, onSelect, onExited }) {
  return <Popover
    open={Boolean(menu)}
    anchorReference="anchorPosition"
    anchorPosition={menu?.position || { top: 0, left: 0 }}
    onClose={onClose}
    disableRestoreFocus
    transitionDuration={120}
    className="editor-color-popover"
    slotProps={{ paper: { role: 'dialog', 'aria-label': '색상 선택', className: 'editor-color-menu' }, transition: { onExited } }}
  >
    {sections.map(section => <section className="editor-color-section" aria-labelledby={`editor-${section.kind}-title`} key={section.kind}>
      <h3 id={`editor-${section.kind}-title`}>{section.label}</h3>
      <div className="editor-color-options">
        {markdownColorOptions.map(option => {
          const selected = (menu?.colors?.[section.attribute] || 'default') === option.token;
          const color = option.token === 'default' ? '' : section.palette[option.token];
          return <button
            type="button"
            className="editor-color-option"
            aria-pressed={selected}
            onClick={() => onSelect(section.kind, option.token)}
            key={option.token}
          >
            <span className={`editor-color-swatch${option.token === 'default' ? ' is-default' : ''}`} style={color ? { backgroundColor: color } : undefined} aria-hidden="true" />
            <span>{section.label} {option.label}</span>
            {selected && <Check className="editor-color-check" aria-hidden="true" />}
          </button>;
        })}
      </div>
    </section>)}
  </Popover>;
}
