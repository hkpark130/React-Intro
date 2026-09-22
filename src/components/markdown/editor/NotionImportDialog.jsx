import { useEffect, useRef, useState } from 'react';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { notionApi, notionConvert } from '../../../api/api';
import { normalizeNotionId } from './editorCommands';

function requestMessage(error) {
  const message = error.response?.data?.message || error.response?.data?.error;
  return typeof message === 'string' ? message : error.message || '가져오지 못했습니다. 주소와 Notion 연결 권한을 확인한 뒤 다시 시도하세요.';
}

export default function NotionImportDialog({ open, onClose, onExited, onInsert }) {
  const [mode, setMode] = useState('page');
  const [identifier, setIdentifier] = useState('');
  const [results, setResults] = useState([]);
  const [sources, setSources] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const activeRequest = useRef(null);
  const editorial = import.meta.env.MODE === 'editorial';

  useEffect(() => {
    requestId.current += 1;
    if (open) {
      setMode('page'); setIdentifier(''); setResults([]); setSources([]); setSourceId('');
      setNextCursor(null); setHasMore(false); setLoaded(false); setLoading(false); setError('');
    }
    return () => { requestId.current += 1; activeRequest.current?.abort(); };
  }, [open]);

  const close = () => { requestId.current += 1; activeRequest.current?.abort(); onClose(); };
  const request = async work => {
    if (editorial) { setError('로컬 편집 모드에서는 Notion 외부 조회를 사용하지 않습니다.'); return; }
    const token = ++requestId.current;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true); setError('');
    try { await work(() => token === requestId.current, controller.signal); }
    catch (failure) { if (token === requestId.current) setError(requestMessage(failure)); }
    finally { if (token === requestId.current) setLoading(false); }
  };

  const insertPage = pageId => request(async (current, signal) => {
    const { data } = await notionConvert({ pageId }, { signal });
    if (!current()) return;
    if (typeof data.markdown !== 'string' || !data.markdown.trim()) throw new Error('가져올 본문이 없습니다. 내용이 있는 페이지를 선택하세요.');
    onInsert(data.markdown);
    close();
  });

  const loadDatabase = (append = false) => {
    const id = normalizeNotionId(identifier);
    if (!id) { setError('Notion 데이터베이스 주소 또는 ID를 확인하세요.'); return; }
    return request(async (current, signal) => {
      const parameters = new URLSearchParams({ pageSize: '10' });
      if (sourceId) parameters.set('dataSourceId', sourceId);
      if (append && nextCursor) parameters.set('startCursor', nextCursor);
      const { data } = await notionApi.get(`/notion/render-db/${encodeURIComponent(id)}?${parameters}`, { signal });
      if (!current()) return;
      if (data.requiresDataSource) {
        setSources(Array.isArray(data.dataSources) ? data.dataSources : []);
        setResults([]); setLoaded(false); setHasMore(false); setNextCursor(null);
        return;
      }
      const pages = Array.isArray(data.results) ? data.results.filter(item => typeof item.id === 'string') : [];
      setResults(previous => append ? [...previous, ...pages.filter(item => !previous.some(existing => existing.id === item.id))] : pages);
      setNextCursor(data.nextCursor || null); setHasMore(Boolean(data.hasMore && data.nextCursor)); setLoaded(true);
    });
  };

  const importPage = () => {
    const id = normalizeNotionId(identifier);
    if (!id) { setError('Notion 페이지 주소 또는 ID를 확인하세요.'); return; }
    return insertPage(id);
  };
  const changeIdentifier = value => {
    setIdentifier(value); setResults([]); setSources([]); setSourceId(''); setNextCursor(null); setHasMore(false); setLoaded(false); setError('');
  };
  return <Dialog open={open} onClose={close} fullWidth maxWidth="sm" className="markdown-editor-dialog" disableRestoreFocus slotProps={{ transition: { onExited } }} aria-labelledby="notion-import-dialog-title">
    <DialogTitle id="notion-import-dialog-title">Notion에서 가져오기</DialogTitle>
    <DialogContent>
      <div className="editor-dialog-fields" aria-busy={loading}>
        <p className="editor-dialog-description">사이트에 연결된 Notion 페이지를 본문에 넣습니다. 가져올 페이지를 Notion 연결에 공유해 주세요.</p>
        {editorial && <Alert severity="info">로컬 편집 모드에서는 Notion 외부 조회를 사용하지 않습니다. Markdown은 본문에 직접 붙여넣을 수 있습니다.</Alert>}
        <div className="editor-mode-buttons" role="group" aria-label="Notion 가져오기 종류">
          <button type="button" aria-pressed={mode === 'page'} disabled={loading} onClick={() => { setMode('page'); changeIdentifier(''); }}>페이지</button>
          <button type="button" aria-pressed={mode === 'db'} disabled={loading} onClick={() => { setMode('db'); changeIdentifier(''); }}>데이터베이스</button>
        </div>
        <TextField id="notion-import-identifier" autoFocus fullWidth size="small" label={mode === 'page' ? '페이지 주소 또는 ID' : '데이터베이스 주소 또는 ID'} value={identifier} onChange={event => changeIdentifier(event.target.value)} disabled={loading} placeholder="https://www.notion.so/…" />
        {mode === 'db' && sources.length > 0 && <TextField id="notion-data-source" fullWidth size="small" select label="데이터 원본" value={sourceId} disabled={loading} onChange={event => { setSourceId(event.target.value); setResults([]); setLoaded(false); setHasMore(false); setNextCursor(null); }} helperText="이 데이터베이스에서 가져올 데이터 원본을 선택하세요.">
          {sources.map(source => <MenuItem key={source.id} value={source.id}>{source.name || '이름 없는 데이터 원본'}</MenuItem>)}
        </TextField>}
        <div className="editor-import-actions"><Button type="button" variant="contained" disabled={loading || editorial || !identifier.trim() || (mode === 'db' && sources.length > 0 && !sourceId)} onClick={mode === 'page' ? importPage : () => loadDatabase()} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}>{loading ? '불러오는 중…' : mode === 'page' ? '본문에 가져오기' : '목록 불러오기'}</Button></div>
        {mode === 'db' && results.length > 0 && <ul className="editor-import-results" aria-label="가져올 Notion 페이지">
          {results.map(page => <li key={page.id}><span>{page.title || '제목 없는 페이지'}</span><Button type="button" size="small" variant="outlined" disabled={loading || editorial} onClick={() => insertPage(page.id)} aria-label={`${page.title || '제목 없는 페이지'} 가져오기`}>가져오기</Button></li>)}
        </ul>}
        {mode === 'db' && loaded && results.length === 0 && <p className="editor-dialog-description" role="status">표시할 페이지가 없습니다. 선택한 데이터 원본과 연결 권한을 확인하세요.</p>}
        {mode === 'db' && hasMore && <Button type="button" disabled={loading || editorial} onClick={() => loadDatabase(true)}>더 보기</Button>}
        {error && <Alert severity="error">{error}</Alert>}
      </div>
    </DialogContent>
    <DialogActions><Button type="button" onClick={close}>닫기</Button></DialogActions>
  </Dialog>;
}
