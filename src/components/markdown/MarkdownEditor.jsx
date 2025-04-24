import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Box, Typography, TextField, Button, Paper, Tab, Tabs, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import TableChartIcon from '@mui/icons-material/TableChart';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';

export default function MarkdownEditor({ value, onChange }) {
  const [tabValue, setTabValue] = useState(0);
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
  
  // 마크다운 테이블 템플릿 삽입
  const insertTable = () => {
    insertAtCursor(`
| 항목 1 | 항목 2 | 항목 3 |
| ------ | ------ | ------ |
| 내용 1 | 내용 2 | 내용 3 |
| 내용 4 | 내용 5 | 내용 6 |
`);
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
    </Box>
  );
}