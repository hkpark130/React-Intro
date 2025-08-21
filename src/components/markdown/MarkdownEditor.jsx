import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { notionApi, notionConvert } from "@/api/api";
import { 
  Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, 
  OutlinedInput, FormHelperText, CircularProgress, LinearProgress, Alert
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
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
  
  // 마크다운 테이블 템플릿 삽입
  const insertTable = () => {
    insertAtCursor(`
| 항목 1 | 항목 2 | 항목 3 |
| ------ | ------ | ------ |
| 내용 1 | 내용 2 | 내용 3 |
| 내용 4 | 내용 5 | 내용 6 |
`);
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
    } catch (e) {
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
    } catch (e) {
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
    } catch (e) {
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
      
    } catch (error) {
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

      {tabValue === 0 && (
        <Box>
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
              onClick={() => insertAtCursor(`<ZoomableImageModal src="/images/example.jpg" alt="이미지 설명" />`)}
            >
              Zoomable 이미지 삽입
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<TableChartIcon />}
              onClick={insertTable}
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
      )}

      {tabValue === 1 && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            minHeight: '400px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            '& code': { display: 'block', whiteSpace: 'pre-wrap' }
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            미리보기
          </Typography>
          <MarkdownRenderer content={value} />
        </Paper>
      )}

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
    </Box>
  );
}