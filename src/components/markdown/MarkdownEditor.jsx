import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider, Alert, CircularProgress } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import DescriptionIcon from '@mui/icons-material/Description';

export default function MarkdownEditor({ value, onChange }) {
  const [tabValue, setTabValue] = useState(0);
  const [notionUrl, setNotionUrl] = useState('');
  const [showNotionInput, setShowNotionInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNotionPreview, setIsNotionPreview] = useState(false);
  const textareaRef = useRef(null);

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
    if (isNotionPreview) {
      setIsNotionPreview(false);
    }
  };

  const handleNotionUrlChange = (e) => {
    setNotionUrl(e.target.value);
    setError('');
  };

  const handleNotionPreviewToggle = () => {
    if (!notionUrl.trim()) {
      setError('노션 페이지 URL을 입력해주세요.');
      return;
    }

    // URL 형식 체크
    try {
      new URL(notionUrl);
    } catch (err) {
      setError('유효한 URL 형식이 아닙니다.');
      return;
    }

    if (tabValue !== 1) {
      setTabValue(1); // 미리보기 탭으로 전환
    }
    
    setIsNotionPreview(true);
    onChange(notionUrl); // 노션 URL을 컨텐츠로 설정
  };

  const handlePaste = (e) => {
    // URL 패턴 체크 (노션 URL 자동 감지)
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.match(/https:\/\/(www\.)?notion\.so\//i)) {
      if (window.confirm('노션 URL을 감지했습니다. 노션 페이지로 미리보기하시겠습니까?')) {
        e.preventDefault(); // 붙여넣기 기본 동작 방지
        setNotionUrl(pastedText);
        setShowNotionInput(true);
        handleNotionPreviewToggle();
      }
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {tabValue === 0 && (
        <Box>
          <TextField
            inputRef={textareaRef}
            value={value}
            onChange={handleContentChange}
            onPaste={handlePaste}
            multiline
            fullWidth
            rows={15}
            variant="outlined"
            placeholder="마크다운을 입력하세요..."
            disabled={isLoading}
          />

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={() => insertAtCursor(`<CodeAccordion>\n// 코드를 여기에 작성하세요\n</CodeAccordion>`)}
              disabled={isLoading}
            >
              코드 블록 삽입
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ImageIcon />}
              onClick={() => insertAtCursor(`<ZoomableImageModal src="/images/example.jpg" alt="이미지 설명" />`)}
              disabled={isLoading}
            >
              이미지 삽입
            </Button>
            <Button
              size="small"
              variant="outlined"
              color={showNotionInput ? "primary" : "info"}
              startIcon={<DescriptionIcon />}
              onClick={() => setShowNotionInput(prev => !prev)}
              disabled={isLoading}
            >
              Notion 페이지 삽입
            </Button>
          </Box>

          {showNotionInput && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Notion 페이지 URL"
                size="small"
                sx={{ mb: 1 }}
                value={notionUrl}
                onChange={handleNotionUrlChange}
                placeholder="https://www.notion.so/페이지ID"
                helperText="예: https://www.notion.so/username/067dd719a912471ea9a3ac10710e7fdf"
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleNotionPreviewToggle}
                disabled={isLoading || !notionUrl.trim()}
                startIcon={isLoading && <CircularProgress size={16} />}
              >
                {isLoading ? '로딩 중...' : '노션 페이지 미리보기'}
              </Button>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary">
            마크다운 문법 가이드:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            # 제목, **굵게**, *기울임*, `코드`, [링크](url), - 목록
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
            {isNotionPreview && " (노션 페이지)"}
          </Typography>
          <MarkdownRenderer 
            content={value} 
            isNotionPage={isNotionPreview} 
          />
        </Paper>
      )}
    </Box>
  );
}