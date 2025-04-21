import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { Box, Typography, TextField, Button, Grid, Paper, Tab, Tabs, Divider, Alert } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';

export default function MarkdownEditor({ value, onChange }) {
  const [tabValue, setTabValue] = useState(0);
  const [isNotionUrl, setIsNotionUrl] = useState(false);
  const [isNotionPaste, setIsNotionPaste] = useState(false);
  const [notionUrlInput, setNotionUrlInput] = useState('');
  const [showNotionInput, setShowNotionInput] = useState(false);
  const textareaRef = useRef(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const insertAtCursor = (insertText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd } = textarea;
    const newValue =
      value.substring(0, selectionStart) +
      insertText +
      value.substring(selectionEnd);

    onChange(newValue);

    // 커서 위치 이동 + 포커스 유지
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd =
        selectionStart + insertText.length;
    }, 0);
  };

  // 콘텐츠 변경 감지
  const handleContentChange = (e) => {
    const newValue = e.target.value;
    
    // Notion URL 형식인지 확인
    const isNotionUrlPattern = /^https:\/\/(www\.)?notion\.so\/.+/i.test(newValue.trim());
    setIsNotionUrl(isNotionUrlPattern);
    
    // Notion URL이 아니면 일반 마크다운으로 처리
    if (!isNotionUrlPattern) {
      setIsNotionPaste(false);
    }
    
    onChange(newValue);
  };
  
  // 붙여넣기 처리
  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Notion에서 복사한 내용인지 감지하는 휴리스틱
    // 이 부분은 필요에 따라 더 정교하게 개선할 수 있습니다.
    const notionPatterns = [
      /- \[ \] .+/,  // Notion 체크박스
      /\d+\. .+/,    // Notion 번호 목록
      /^>.+/m,       // Notion 인용구
      /\(toggle\)/,  // Notion 토글 블록
      /```[\s\S]+?```/, // 코드 블록
    ];
    
    const isLikelyNotion = notionPatterns.some(pattern => pattern.test(pastedText));
    
    setIsNotionPaste(isLikelyNotion);
  };
  
  // Notion URL 입력 처리
  const handleNotionUrlSubmit = () => {
    if (notionUrlInput.trim()) {
      onChange(notionUrlInput);
      setIsNotionUrl(true);
      setIsNotionPaste(false);
      setShowNotionInput(false);
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="작성" />
          <Tab label="미리보기" />
        </Tabs>
      </Box>

      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        {isNotionUrl && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Notion URL을 감지했습니다! 미리보기 탭에서 변환된 콘텐츠를 확인해보세요.
          </Alert>
        )}
        
        {isNotionPaste && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Notion에서 복사한 내용을 감지했습니다! 미리보기 탭에서 확인해보세요.
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
          placeholder="마크다운 문법을 사용하거나 Notion에서 복사한 내용을 붙여넣으세요..."
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
            확대 가능한 이미지 삽입
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<LinkIcon />}
            onClick={() => setShowNotionInput(prev => !prev)}
          >
            Notion URL 추가
          </Button>
        </Box>
        
        {showNotionInput && (
          <Box sx={{ mt: 2 }}>
            <TextField 
              fullWidth
              size="small"
              label="Notion 페이지 URL"
              placeholder="https://www.notion.so/your-page-id"
              value={notionUrlInput}
              onChange={(e) => setNotionUrlInput(e.target.value)}
              sx={{ mb: 1 }}
            />
            <Button 
              variant="contained" 
              size="small"
              onClick={handleNotionUrlSubmit}
              disabled={!notionUrlInput.trim()}
            >
              Notion 콘텐츠 가져오기
            </Button>
          </Box>
        )}
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          마크다운 문법 가이드:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          # 제목 (H1), ## 제목 (H2), ### 제목 (H3)<br />
          **굵게**, *기울임체*, `코드`<br />
          [링크 텍스트](URL)<br />
          ![이미지 설명](이미지 URL)<br />
          &gt; 인용문<br />
          - 목록 항목
        </Typography>
      </Box>

      <Box sx={{ display: tabValue === 1 ? 'block' : 'none' }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            minHeight: '400px',
            wordBreak: 'break-all', 
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            '& *': { // 미리보기 내부의 모든 요소에 적용
              maxWidth: '100%', 
              wordBreak: 'break-all',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              boxSizing: 'border-box'
            },
            '& code': { // 코드 태그 특별 스타일
              display: 'block',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflowWrap: 'break-word'
            }
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            미리보기
          </Typography>
          <Box sx={{ mt: 2 }}>
            <MarkdownRenderer 
              content={value} 
              isNotionUrl={isNotionUrl}
              isPaste={isNotionPaste} 
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}