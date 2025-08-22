import React, { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { notionApi, notionConvert } from "@/api/api";
import { 
  Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, 
  OutlinedInput, FormHelperText, CircularProgress, LinearProgress, Alert
} from '@mui/material';
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Select
} from '@mui/material';

export default function MarkdownEditor({ value, onChange }) {
  const [tabValue, setTabValue] = useState(0);
  const textareaRef = useRef(null);
  const [bookmarkDialog, setBookmarkDialog] = useState(false);
  const [bookmarkForm, setBookmarkForm] = useState({
    url: '',
    title: '',
    description: '',
    imageUrl: ''
  });
  const [bookmarkError, setBookmarkError] = useState('');

  // CodeAccordion dialog state
  const [codeDialog, setCodeDialog] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeForm, setCodeForm] = useState({
    title: '',
    language: 'java',
    codeString: '',
    openState: 'hidden' // 'open' | 'hidden'
  });

  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState(false);
  const [alertForm, setAlertForm] = useState({
    severity: 'info', // 'info' | 'warning' | 'error'
    message: ''
  });

  // Zoomable dialog state
  const [zoomDialog, setZoomDialog] = useState(false);
  const [zoomForm, setZoomForm] = useState({
    src: '',
    alt: '',
    caption: ''
  });
  const [zoomError, setZoomError] = useState('');

  // Table dialog state
  const [tableDialog, setTableDialog] = useState(false);
  const [tableForm, setTableForm] = useState({
    rows: 3,
    cols: 3
  });
  const [tableError, setTableError] = useState('');


  // Notion dialog state
  const [notionDialog, setNotionDialog] = useState(false);
  const [notionMode, setNotionMode] = useState('page'); // 'page' | 'db'
  const [pageId, setPageId] = useState('');
  const [dbId, setDbId] = useState('');
  const [dbResults, setDbResults] = useState([]);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionError, setNotionError] = useState('');
  // Html 경로 제거: 마크다운만 지원

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  // 작성 탭 복귀 시 포커스 복원 (Undo 단축키가 바로 동작하도록)
  useEffect(() => {
    if (tabValue === 0 && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [tabValue]);

  const insertAtCursor = (insertText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const newValue =
      value.substring(0, selectionStart) +
      insertText +
      value.substring(selectionEnd);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = selectionStart + insertText.length;
    }, 0);
  };

  const handleContentChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
  };
  
  // Zoomable 다이얼로그 열기
  const openZoomDialog = () => {
    setZoomDialog(true);
    setZoomForm({ src: '', alt: '', caption: '' });
    setZoomError('');
  };

  const handleZoomFormChange = (e) => {
    const { name, value } = e.target;
    setZoomForm(prev => ({ ...prev, [name]: value }));
  };

  const insertZoomable = () => {
    if (!zoomForm.src.trim()) {
      setZoomError('이미지 경로(src)를 입력하세요.');
      return;
    }
    let tag = `<ZoomableImageModal src="${zoomForm.src.trim()}"`;
    if (zoomForm.alt.trim()) tag += ` alt="${zoomForm.alt.trim()}"`;
    if (zoomForm.caption.trim()) tag += ` caption="${zoomForm.caption.trim()}"`;
    tag += ' />';
    insertAtCursor(`\n${tag}\n`);
    setZoomDialog(false);
  };

  // 테이블 다이얼로그 열기
  const openTableDialog = () => {
    setTableDialog(true);
  setTableForm({ rows: 3, cols: 3 });
    setTableError('');
  };

  const handleTableFormChange = (e) => {
    const { name, value } = e.target;
    setTableForm(prev => ({ ...prev, [name]: value }));
  };

  const insertTableFromDialog = () => {
    let rows = parseInt(tableForm.rows, 10);
    let cols = parseInt(tableForm.cols, 10);
    if (!(rows > 0 && cols > 0)) {
      setTableError('행과 열은 1 이상이어야 합니다.');
      return;
    }
    rows = Math.min(rows, 20);
    cols = Math.min(cols, 20);

    const lines = [];
    const makeRow = (arr) => `| ${arr.join(' | ')} |`;

    // 항상 헤더 행 포함
    const header = Array.from({ length: cols }, (_, i) => `헤더 ${i + 1}`);
    const divider = Array.from({ length: cols }, () => '------');
    lines.push(makeRow(header));
    lines.push(makeRow(divider));
    for (let r = 0; r < Math.max(rows - 1, 0); r++) {
      const cells = Array.from({ length: cols }, (_, c) => `내용 ${r + 1}-${c + 1}`);
      lines.push(makeRow(cells));
    }

    insertAtCursor(`\n${lines.join('\n')}\n`);
    setTableDialog(false);
  };

  // 북마크 다이얼로그 열기
  const openBookmarkDialog = () => {
    setBookmarkDialog(true);
    setBookmarkForm({
      url: '',
      title: '',
      description: '',
      imageUrl: ''
    });
    setBookmarkError('');
  };

  // Open Notion Dialog
  const openNotionDialog = () => {
    setNotionDialog(true);
    setNotionMode('page');
    setPageId('');
    setDbId('');
    setDbResults([]);
    setNotionError('');
  };

  const handleNotionFetchPage = async () => {
    if (!pageId.trim()) {
      setNotionError('페이지 ID를 입력하세요.');
      return;
    }
    setNotionLoading(true);
    setNotionError('');
    try {
  const { data } = await notionConvert({ pageId: pageId.trim() });
  insertAtCursor(`\n${data.markdown}\n`);
      setNotionDialog(false);
  } catch {
      setNotionError('페이지 변환에 실패했습니다.');
    } finally {
      setNotionLoading(false);
    }
  };

  const handleNotionFetchDb = async () => {
    if (!dbId.trim()) {
      setNotionError('데이터베이스 ID를 입력하세요.');
      return;
    }
    setNotionLoading(true);
    setNotionError('');
    try {
      const { data } = await notionApi.get(`/notion/render-db/${dbId.trim()}?pageSize=10`);
      setDbResults(data.results || []);
  } catch {
      setNotionError('데이터베이스 로드에 실패했습니다.');
    } finally {
      setNotionLoading(false);
    }
  };

  const handleInsertDbPage = async (pId) => {
    setNotionLoading(true);
    setNotionError('');
    try {
  const { data } = await notionConvert({ pageId: pId });
  insertAtCursor(`\n${data.markdown}\n`);
      setNotionDialog(false);
  } catch {
      setNotionError('페이지 변환에 실패했습니다.');
    } finally {
      setNotionLoading(false);
    }
  };

  // 마크다운 붙여넣기 기능 제거

  // 북마크 폼 입력값 변경 처리
  const handleBookmarkFormChange = (e) => {
    const { name, value } = e.target;
    setBookmarkForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 코드 아코디언 다이얼로그 열기
  const openCodeDialog = () => {
    setCodeDialog(true);
    setCodeError('');
    setCodeForm({ title: '', language: 'java', codeString: '', openState: 'hidden' });
  };

  // Alert 다이얼로그 열기
  const openAlertDialog = () => {
    setAlertDialog(true);
    setAlertForm({ severity: 'info', message: '' });
  };

  const handleCodeFormChange = (e) => {
    const { name, value } = e.target;
    setCodeForm(prev => ({ ...prev, [name]: value }));
  };

  const insertCodeAccordion = () => {
    if (!codeForm.codeString.trim()) {
      setCodeError('코드 내용을 입력하세요.');
      return;
    }
    // 속성 문자열 구성
    const attrs = [];
    if (codeForm.title.trim()) {
      const safeTitle = codeForm.title.replace(/"/g, '\\"');
      attrs.push(` title="${safeTitle}"`);
    }
    if (codeForm.language.trim()) {
      attrs.push(` language="${codeForm.language.trim()}"`);
    }
    if (codeForm.openState === 'open') {
      attrs.push(` defaultExpanded="true"`);
    }

    const openTag = `<CodeAccordion${attrs.join('')}>`;
    const closeTag = `</CodeAccordion>`;
    const block = `\n${openTag}\n${codeForm.codeString}\n${closeTag}\n`;
    insertAtCursor(block);
    setCodeDialog(false);
  };

  const handleAlertFormChange = (e) => {
    const { name, value } = e.target;
    setAlertForm(prev => ({ ...prev, [name]: value }));
  };

  const insertAlert = () => {
    // severity만 출력, 스타일은 렌더러의 AlertBlock이 결정
    const sev = (alertForm.severity || 'info').toLowerCase();
  const defaultMessage = sev === 'error' ? '경고문' : sev === 'warning' ? '주의문' : '인포 문구';
  const msg = (alertForm.message || '').trim() || defaultMessage;
  // 태그 내부 개행 없이 삽입 (미리보기 pre-wrap 영향 방지)
  const block = `\n<AlertBlock severity=\"${sev}\">${msg}</AlertBlock>\n`;
    insertAtCursor(block);
    setAlertDialog(false);
  };

  // 북마크 삽입하기
  const insertBookmark = () => {
    try {
      // URL 형식 검증
      new URL(bookmarkForm.url);
      
      let bookmarkCode = `<Bookmark url="${bookmarkForm.url}"`;
      
      if (bookmarkForm.title) {
        bookmarkCode += ` title="${bookmarkForm.title}"`;
      }
      
      if (bookmarkForm.description) {
        bookmarkCode += ` description="${bookmarkForm.description}"`;
      }
      
      if (bookmarkForm.imageUrl) {
        bookmarkCode += ` imageUrl="${bookmarkForm.imageUrl}"`;
      }
      
      bookmarkCode += ' />';
      
      insertAtCursor(bookmarkCode);
      setBookmarkDialog(false);
      
  } catch {
      setBookmarkError('유효한 URL을 입력해주세요. (예: https://example.com)');
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, mb: 2, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="작성" />
          <Tab label="미리보기" />
        </Tabs>
      </Box>

      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        <TextField
          inputRef={textareaRef}
          value={value}
          onChange={handleContentChange}
          multiline
          fullWidth
          rows={15}
          variant="outlined"
          placeholder="마크다운을 입력하세요..."
        />

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={openCodeDialog}
          >
            코드 블록 삽입
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={openZoomDialog}
          >
            Zoomable 이미지 삽입
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<TableChartIcon />}
            onClick={openTableDialog}
          >
            테이블 삽입
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<InsertLinkIcon />}
            onClick={openBookmarkDialog}
          >
            프리뷰 삽입
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<WarningAmberIcon />}
            onClick={openAlertDialog}
          >
            Alert 삽입
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={openNotionDialog}
          >
            노션 가져오기
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary">
          마크다운 문법 가이드:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          # 제목, **굵게**, *기울임*, `코드`, [링크](url), - 목록, | 테이블 |
        </Typography>
      </Box>

    <Paper
        variant="outlined"
        sx={{
      display: tabValue === 1 ? 'block' : 'none',
      p: 3,
      minHeight: '400px',
      wordBreak: 'break-word'
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          미리보기
        </Typography>
        <MarkdownRenderer content={value} />
      </Paper>

      {/* 북마크 추가 다이얼로그 */}
      <Dialog
        open={bookmarkDialog}
        onClose={() => setBookmarkDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>북마크 추가</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={!!bookmarkError}>
            <InputLabel htmlFor="bookmark-url">URL (필수)</InputLabel>
            <OutlinedInput
              id="bookmark-url"
              name="url"
              value={bookmarkForm.url}
              onChange={handleBookmarkFormChange}
              label="URL (필수)"
              placeholder="https://example.com"
              fullWidth
            />
            {bookmarkError && (
              <FormHelperText error>{bookmarkError}</FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="bookmark-title">제목 (선택)</InputLabel>
            <OutlinedInput
              id="bookmark-title"
              name="title"
              value={bookmarkForm.title}
              onChange={handleBookmarkFormChange}
              label="제목 (선택)"
              placeholder="북마크 제목"
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="bookmark-desc">설명 (선택)</InputLabel>
            <OutlinedInput
              id="bookmark-desc"
              name="description"
              value={bookmarkForm.description}
              onChange={handleBookmarkFormChange}
              label="설명 (선택)"
              placeholder="북마크에 대한 간략한 설명"
              multiline
              rows={2}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="bookmark-image">이미지 URL (선택)</InputLabel>
            <OutlinedInput
              id="bookmark-image"
              name="imageUrl"
              value={bookmarkForm.imageUrl}
              onChange={handleBookmarkFormChange}
              label="이미지 URL (선택)"
              placeholder="https://example.com/image.jpg"
              fullWidth
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookmarkDialog(false)}>취소</Button>
          <Button onClick={insertBookmark} variant="contained" color="primary">
            북마크 삽입
          </Button>
        </DialogActions>
      </Dialog>

      {/* Zoomable 이미지 다이얼로그 */}
      <Dialog
        open={zoomDialog}
        onClose={() => setZoomDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Zoomable 이미지 삽입</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" error={!!zoomError}>
            <InputLabel htmlFor="zoom-src">이미지 src (필수)</InputLabel>
            <OutlinedInput
              id="zoom-src"
              name="src"
              value={zoomForm.src}
              onChange={handleZoomFormChange}
              label="이미지 src (필수)"
              placeholder="https://..."
              fullWidth
            />
            {zoomError && <FormHelperText error>{zoomError}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="zoom-alt">대체 텍스트 (선택)</InputLabel>
            <OutlinedInput
              id="zoom-alt"
              name="alt"
              value={zoomForm.alt}
              onChange={handleZoomFormChange}
              label="대체 텍스트 (선택)"
              placeholder="이미지 설명"
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="zoom-caption">캡션 (선택)</InputLabel>
            <OutlinedInput
              id="zoom-caption"
              name="caption"
              value={zoomForm.caption}
              onChange={handleZoomFormChange}
              label="캡션 (선택)"
              placeholder="이미지 아래 설명"
              fullWidth
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZoomDialog(false)}>취소</Button>
          <Button onClick={insertZoomable} variant="contained">삽입</Button>
        </DialogActions>
      </Dialog>

      {/* 테이블 삽입 다이얼로그 */}
      <Dialog
        open={tableDialog}
        onClose={() => setTableDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>테이블 삽입</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', pl: 0.5 }}>
                행 수
              </Typography>
              <NumberInput
                min={1}
                max={20}
                value={tableForm.rows}
                onChange={(_, val) => setTableForm(prev => ({ ...prev, rows: val }))}
                slotProps={{
                  incrementButton: { style: { display: 'none' } },
                  decrementButton: { style: { display: 'none' } },
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', pl: 0.5 }}>
                열 수
              </Typography>
              <NumberInput
                min={1}
                max={20}
                value={tableForm.cols}
                onChange={(_, val) => setTableForm(prev => ({ ...prev, cols: val }))}
                slotProps={{
                  incrementButton: { style: { display: 'none' } },
                  decrementButton: { style: { display: 'none' } },
                }}
              />
            </Box>
          </Box>
          {/* 헤더 행은 기본 포함 */}
          {tableError && <FormHelperText error sx={{ mt: 1 }}>{tableError}</FormHelperText>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTableDialog(false)}>취소</Button>
          <Button onClick={insertTableFromDialog} variant="contained">삽입</Button>
        </DialogActions>
      </Dialog>

      {/* Notion 가져오기 다이얼로그 */}
      <Dialog
        open={notionDialog}
        onClose={() => setNotionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>노션 가져오기</DialogTitle>
        <DialogContent>
          <Alert severity="warning" color="warning" sx={{ mb: 2, lineHeight: 1.6 }}>
            노션에서 가져온 이미지 링크(예: <code>https://prod-files-secure.s3...</code>)는 유효기간이 있어 일정 시간이 지나면 깨질 수 있습니다.
            반드시 이미지를 개인/영구 저장소(S3/CloudFront, GitHub 등)에 업로드한 뒤
            마크다운의 이미지 URL(<code>![](url)</code>)을 해당 저장소 주소로 교체하세요.
          </Alert>
          {/* HTML 삽입 형식 제거: 항상 마크다운만 */}

          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Button
              size="small"
              variant={notionMode === 'page' ? 'contained' : 'outlined'}
              onClick={() => { setNotionMode('page'); setNotionError(''); }}
            >페이지 ID</Button>
            <Button
              size="small"
              variant={notionMode === 'db' ? 'contained' : 'outlined'}
              onClick={() => { setNotionMode('db'); setNotionError(''); }}
            >데이터베이스 ID</Button>
          </Box>

          {/* 로딩 바 */}
          {notionLoading && <LinearProgress sx={{ mb: 2 }} />}

          {notionMode === 'page' && (
            <Box>
              <TextField
                label="페이지 ID"
                fullWidth
                size="small"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                disabled={notionLoading}
              />
              <Box sx={{ mt: 1 }}>
                <Button onClick={handleNotionFetchPage} variant="contained" disabled={notionLoading}>
                  {notionLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <span>변환중...</span>
                    </Box>
                  ) : (
                    '변환하여 삽입'
                  )}
                </Button>
              </Box>
            </Box>
          )}

          {notionMode === 'db' && (
            <Box>
              <TextField
                label="데이터베이스 ID"
                fullWidth
                size="small"
                value={dbId}
                onChange={(e) => setDbId(e.target.value)}
                disabled={notionLoading}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button onClick={handleNotionFetchDb} variant="contained" disabled={notionLoading}>
                  {notionLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <span>불러오는 중...</span>
                    </Box>
                  ) : (
                    '목록 불러오기'
                  )}
                </Button>
              </Box>
              <Box sx={{ mt: 2, maxHeight: 300, overflowY: 'auto' }}>
                {dbResults.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>{item.title || '(제목 없음)'}</Typography>
                    <Button size="small" variant="outlined" onClick={() => handleInsertDbPage(item.id)} disabled={notionLoading}>
                      {notionLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={14} />
                          <span>삽입중...</span>
                        </Box>
                      ) : (
                        '삽입'
                      )}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* 마크다운 붙여넣기 모드 제거 */}

          {notionError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>{notionError}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotionDialog(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 코드 블록 삽입 다이얼로그 */}
      <Dialog
        open={codeDialog}
        onClose={() => setCodeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>코드 블록 삽입</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <FormControl fullWidth margin="dense">
              <InputLabel htmlFor="code-title">제목 (선택)</InputLabel>
              <OutlinedInput
                id="code-title"
                name="title"
                value={codeForm.title}
                onChange={handleCodeFormChange}
                label="제목 (선택)"
                placeholder="코드 살펴보기"
              />
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel id="code-language-label">언어</InputLabel>
              <Select
                labelId="code-language-label"
                id="code-language"
                name="language"
                value={codeForm.language}
                label="언어"
                onChange={handleCodeFormChange}
              >
                {['bash','json','yaml','yml','java','kotlin','go','python','javascript','typescript','tsx','tsx','sql','xml','html','css','dockerfile','ini','toml'].map(lang => (
                  <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl component="fieldset" margin="dense">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>초기 상태</Typography>
              <RadioGroup
                row
                name="openState"
                value={codeForm.openState}
                onChange={handleCodeFormChange}
              >
                <FormControlLabel value="hidden" control={<Radio />} label="숨김" />
                <FormControlLabel value="open" control={<Radio />} label="오픈" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth margin="dense" error={!!codeError}>
              <TextField
                id="code-string"
                name="codeString"
                value={codeForm.codeString}
                onChange={handleCodeFormChange}
                label="코드 내용 (필수)"
                placeholder={`// 코드를 여기에 작성하세요`}
                multiline
                minRows={8}
                maxRows={24}
              />
              {codeError && (
                <FormHelperText error>{codeError}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialog(false)}>취소</Button>
          <Button onClick={insertCodeAccordion} variant="contained">삽입</Button>
        </DialogActions>
      </Dialog>

      {/* Alert 삽입 다이얼로그 */}
      <Dialog
        open={alertDialog}
        onClose={() => setAlertDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Alert 삽입</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl component="fieldset">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>타입</Typography>
              <RadioGroup
                row
                name="severity"
                value={alertForm.severity}
                onChange={handleAlertFormChange}
              >
                <FormControlLabel value="info" control={<Radio />} label="info" />
                <FormControlLabel value="warning" control={<Radio />} label="warning" />
                <FormControlLabel value="error" control={<Radio />} label="error" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth>
              <TextField
                id="alert-message"
                name="message"
                value={alertForm.message}
                onChange={handleAlertFormChange}
                label="메시지"
                placeholder="알림 내용을 입력하세요 (미입력 시 기본 문구가 들어갑니다)"
                multiline
                minRows={3}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertDialog(false)}>취소</Button>
          <Button onClick={insertAlert} variant="contained">삽입</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}