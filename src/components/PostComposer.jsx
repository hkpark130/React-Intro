import { Link } from 'react-router-dom';
import { Alert, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import MarkdownEditor from './markdown/MarkdownEditor';
import '../blog/blog-support.css';

export default function PostComposer({ mode, post, categories, error, loading, onChange, onContentChange, onSubmit, onCancel, returnTo, draftOffer, onRestoreDraft, onDiscardDraft }) {
  const editing = mode === 'edit';
  return <div className="support-page composer-page">
    <header className="composer-heading"><Link to={returnTo}><span aria-hidden="true">←</span>{editing ? '글로 돌아가기' : '블로그로 돌아가기'}</Link><h1>{editing ? '글 수정' : '새 글 작성'}</h1></header>
    <form onSubmit={onSubmit} className="composer-form">
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {draftOffer && <Alert severity="info" sx={{ mb: 3 }} action={<><Button color="inherit" size="small" onClick={onRestoreDraft}>복구</Button><Button color="inherit" size="small" onClick={onDiscardDraft}>버리기</Button></>}>저장하지 않고 작성 중이던 내용이 남아 있습니다{draftOffer.savedAt ? ` (${new Date(draftOffer.savedAt).toLocaleString('ko-KR')})` : ''}.</Alert>}
      <fieldset className="composer-fields" disabled={loading}>
        <div className="composer-metadata">
          <div className="composer-title-field"><label htmlFor="post-title">제목</label><input id="post-title" name="title" value={post.title} onChange={onChange} maxLength={255} required placeholder="제목을 입력하세요" /></div>
          <FormControl fullWidth required className="composer-category"><InputLabel id="post-category-label">카테고리</InputLabel><Select labelId="post-category-label" label="카테고리" name="categoryId" value={post.categoryId || ''} onChange={onChange} disabled={loading}><MenuItem value="" disabled>카테고리를 선택하세요</MenuItem>{categories.map(category => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}</Select></FormControl>
        </div>
        <div className="composer-editor" aria-label="게시글 본문 편집기"><MarkdownEditor value={post.content} onChange={onContentChange} disabled={loading} /></div>
      </fieldset>
      <div className="composer-actions"><Button type="button" variant="text" onClick={onCancel} disabled={loading}>취소</Button><span>게시 전 미리보기에서 서식과 링크를 확인해 주세요.</span><Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={17} color="inherit" /> : null}>{loading ? '저장 중…' : editing ? '수정 완료' : '게시하기'}</Button></div>
    </form>
  </div>;
}
