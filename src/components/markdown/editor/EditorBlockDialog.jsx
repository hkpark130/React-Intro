import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField } from '@mui/material';

const names = { code: '접는 코드', image: '확대 이미지', table: '표', bookmark: '링크 카드', alert: '안내 상자', link: '링크' };
const languages = ['text', 'bash', 'json', 'yaml', 'java', 'kotlin', 'go', 'python', 'javascript', 'typescript', 'jsx', 'tsx', 'sql', 'xml', 'html', 'css', 'dockerfile', 'ini', 'toml'];

export default function EditorBlockDialog({ dialog, onChange, onSubmit, onClose, onExited }) {
  const form = dialog?.form || {};
  const update = (name, value) => onChange({ ...form, [name]: value });
  const field = (name, label, options = {}) => <TextField key={name} id={`editor-block-${name}`} label={label} value={form[name] ?? ''} onChange={event => update(name, event.target.value)} fullWidth size="small" {...options} />;
  const type = dialog?.type;
  const editing = Boolean(dialog?.block);
  return <Dialog open={Boolean(dialog)} onClose={onClose} fullWidth maxWidth={type === 'code' ? 'md' : 'sm'} className="markdown-editor-dialog" disableRestoreFocus slotProps={{ transition: { onExited } }} aria-labelledby="editor-block-dialog-title">
    <DialogTitle id="editor-block-dialog-title">{dialog?.plain ? '코드 블록' : names[type]} {editing ? '수정' : '삽입'}</DialogTitle>
    <DialogContent>
      <div className="editor-dialog-fields">
        {type === 'code' && <>
          {!dialog?.plain && field('title', '제목', { autoFocus: true, placeholder: '코드의 역할을 설명하는 제목' })}
          <div className="editor-dialog-columns">
            {field('language', '언어', { autoFocus: Boolean(dialog?.plain), select: true, children: [...new Set([...languages, form.language].filter(Boolean))].map(language => <MenuItem key={language} value={language}>{language}</MenuItem>) })}
            {!dialog?.plain && <FormControlLabel control={<Checkbox checked={Boolean(form.defaultExpanded)} onChange={event => update('defaultExpanded', event.target.checked)} />} label="처음부터 펼치기" />}
          </div>
          {field('codeString', '코드 내용', { multiline: true, minRows: 10, maxRows: 24, required: true, className: 'editor-code-field', slotProps: { htmlInput: { spellCheck: false } } })}
          {!dialog?.plain && <div className="editor-dialog-columns editor-dialog-checks">
            <FormControlLabel control={<Checkbox checked={form.showLineNumbers !== false} onChange={event => update('showLineNumbers', event.target.checked)} />} label="줄 번호" />
            <FormControlLabel control={<Checkbox checked={form.wrapLines !== false} onChange={event => update('wrapLines', event.target.checked)} />} label="긴 줄 바꿈" />
          </div>}
        </>}
        {type === 'image' && <>
          {field('src', '이미지 주소', { autoFocus: true, required: true, placeholder: 'https://… 또는 /images/…', helperText: '게시한 이미지의 주소를 입력하세요. 파일은 업로드하지 않습니다.' })}
          {field('alt', '대체 텍스트', { placeholder: '그림이 전달하는 내용을 간단히 설명하세요.' })}
          {field('caption', '캡션', { multiline: true, minRows: 2 })}
        </>}
        {type === 'bookmark' && <>
          {field('url', '링크 주소', { autoFocus: true, required: true, placeholder: 'https://example.com' })}
          {field('title', '카드 제목')}
          {field('description', '설명', { multiline: true, minRows: 2 })}
          {field('imageUrl', '미리보기 이미지 주소', { placeholder: '선택 사항' })}
        </>}
        {type === 'alert' && <>
          {field('severity', '종류', { select: true, autoFocus: true, children: [['info', '안내'], ['success', '완료'], ['warning', '주의'], ['error', '오류']].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>) })}
          {field('message', '안내 내용', { required: true, multiline: true, minRows: 5, helperText: '강조, 목록, 링크 등의 Markdown 서식을 사용할 수 있습니다.' })}
        </>}
        {type === 'table' && <>
          <p className="editor-dialog-description">제목 행 아래에 들어갈 데이터 행과 열을 정하세요. 셀 내용은 본문에서 수정합니다.</p>
          <div className="editor-dialog-columns">
            {field('rows', '데이터 행 수', { autoFocus: true, type: 'number', slotProps: { htmlInput: { min: 1, max: 20, step: 1 } } })}
            {field('columns', '열 수', { type: 'number', slotProps: { htmlInput: { min: 1, max: 20, step: 1 } } })}
          </div>
        </>}
        {type === 'link' && <>
          {field('url', '링크 주소', { autoFocus: true, required: true, placeholder: 'https://… 또는 /blog/…' })}
          {field('text', '표시할 문구')}
        </>}
        {dialog?.error && <p className="editor-dialog-error" role="alert">{dialog.error}</p>}
        <p className="editor-dialog-description">{editing ? '현재 블록을 바꿉니다. 실행 취소로 원래 내용으로 되돌릴 수 있습니다.' : dialog?.anchor.start !== dialog?.anchor.end ? '선택한 본문을 이 내용으로 바꿉니다.' : '본문의 커서 위치에 넣습니다.'}</p>
      </div>
    </DialogContent>
    <DialogActions>
      {type === 'code' && !dialog?.plain && <Button type="button" className="editor-plain-code-action" onClick={() => onSubmit({ asFence: true })}>일반 코드로 {editing ? '바꾸기' : '삽입'}</Button>}
      <Button type="button" onClick={onClose}>취소</Button>
      <Button type="button" variant="contained" onClick={() => onSubmit()}>{editing ? '변경 적용' : '본문에 삽입'}</Button>
    </DialogActions>
  </Dialog>;
}
