import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { 
  Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider,
  Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, 
  OutlinedInput, FormHelperText
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertLinkIcon from '@mui/icons-material/InsertLink';

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

  // 북마크 폼 입력값 변경 처리
  const handleBookmarkFormChange = (e) => {
    const { name, value } = e.target;
    setBookmarkForm(prev => ({
      ...prev,
      [name]: value
    }));
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
              onClick={() => insertAtCursor(`<CodeAccordion>\n// 코드를 여기에 작성하세요\n</CodeAccordion>`)}
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
    </Box>
  );
}