import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider, Alert, CircularProgress } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import { notionConvert } from '@/api/api.js';

export default function MarkdownEditor({ value, onChange }) {
  const [tabValue, setTabValue] = useState(0);
  const [notionUrlInput, setNotionUrlInput] = useState('');
  const [notionTokenInput, setNotionTokenInput] = useState('');
  const [showNotionInput, setShowNotionInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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
  };

  // 노션 관련 자동 감지 제거
  const handlePaste = () => {
    // 기본 붙여넣기 동작만 허용
  };

  const fetchNotionContent = async (url, token) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await notionConvert({ url, token });

      if (typeof response === 'string') return response;
      if (typeof response?.data === 'string') return response.data;
      return JSON.stringify(response);
    } catch (err) {
      console.error('노션 변환 오류:', err);
      setError(err.response?.data?.message || '노션 콘텐츠를 가져오는 중 오류가 발생했습니다.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotionUrlSubmit = async () => {
    if (!notionUrlInput.trim()) {
      return setError('노션 URL을 입력해주세요.');
    }

    if (!notionTokenInput.trim()) {
      return setError('노션 통합 토큰을 입력해주세요.');
    }

    const markdown = await fetchNotionContent(notionUrlInput, notionTokenInput);
    if (markdown) {
      insertAtCursor(markdown); // 기존 문자열에 삽입
      setNotionUrlInput('');
      setNotionTokenInput('');
      setShowNotionInput(false);
      setTabValue(1);
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

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
              color="info"
              startIcon={<LinkIcon />}
              onClick={() => setShowNotionInput(prev => !prev)}
              disabled={isLoading}
            >
              Notion URL
            </Button>
          </Box>

          {showNotionInput && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Notion 페이지 URL"
                size="small"
                sx={{ mb: 1 }}
                value={notionUrlInput}
                onChange={(e) => setNotionUrlInput(e.target.value)}
              />
              <TextField
                fullWidth
                label="Notion 통합 토큰"
                size="small"
                type="password"
                sx={{ mb: 1 }}
                value={notionTokenInput}
                onChange={(e) => setNotionTokenInput(e.target.value)}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleNotionUrlSubmit}
                disabled={isLoading || !notionUrlInput.trim() || !notionTokenInput.trim()}
                startIcon={isLoading && <CircularProgress size={16} />}
              >
                {isLoading ? '변환 중...' : 'Notion 콘텐츠 가져오기'}
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
          </Typography>
          <MarkdownRenderer content={value} />
        </Paper>
      )}
    </Box>
  );
}