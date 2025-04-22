import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import { Box, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { NotionRenderer as ReactNotionX } from 'react-notion-x';

// react-notion-x 컴포넌트 스타일
import 'react-notion-x/src/styles.css';

const ALLOWED_COMPONENTS = ["ZoomableImageModal", "CodeAccordion"];
const COMPONENT_MAP = {
  ZoomableImageModal,
  CodeAccordion
};

// 커스텀 컴포넌트 처리 로직
const processCustomComponents = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return '';

  let processed = markdown;

  ALLOWED_COMPONENTS.forEach(componentName => {
    const openClose = new RegExp(`<(${componentName})([^>]*)>([\\s\\S]*?)<\\/${componentName}>`, 'g');
    const selfClose = new RegExp(`<(${componentName})([^>]*?)\\s*/>`, 'g');

    processed = processed.replace(openClose,
      (_, name, attrs, inner) =>
        `<custom data-component="${name}"${attrs}>${inner}</custom>`
    );

    processed = processed.replace(selfClose,
      (_, name, attrs) =>
        `<custom data-component="${name}"${attrs}></custom>`
    );
  });

  return processed;
};

// HTML 태그 보안 처리
const sanitizeUnknownTags = (markdown) => {
  const allowedTags = 'custom|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary';

  return markdown.replace(
    new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'),
    match => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

// 노션 페이지 ID 추출
const extractNotionPageId = (urlOrId) => {
  if (!urlOrId) return null;
  
  // 이미 ID 형태인 경우
  if (/^[a-zA-Z0-9-]+$/.test(urlOrId)) {
    return urlOrId.replace(/-/g, '');
  }
  
  // URL에서 ID 추출
  try {
    const url = new URL(urlOrId);
    const pathname = url.pathname;
    
    // notion.so URL 형식
    if (url.hostname.includes('notion.so')) {
      // 마지막 경로 세그먼트 추출
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      // ID 형식 확인 (UUID 형식 또는 대시 포함 ID)
      if (lastSegment && (lastSegment.length === 32 || lastSegment.includes('-'))) {
        return lastSegment.replace(/-/g, '');
      }
    }
  } catch (err) {
    console.error('노션 URL 파싱 오류:', err);
  }
  
  return null;
};

// Splitbee의 공개 Notion API를 사용하여 노션 페이지 가져오기
const fetchNotionPage = async (pageId) => {
  if (!pageId) return null;

  try {
    // Splitbee의 공개 Notion API 사용
    const response = await fetch(`https://notion-api.splitbee.io/v1/page/${pageId}`);
    
    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('노션 API 오류:', error);
    throw new Error('노션 페이지를 불러오는 중 오류가 발생했습니다.');
  }
};

// 마크다운 전처리 함수 추가
const preprocessMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  let processed = content;
  
  // 테이블이 올바르게 렌더링되도록 테이블 앞뒤에 줄바꿈 추가
  processed = processed.replace(
    /(\n?)(\|[^\n]*\|)(\n?)/g,
    (match, beforeNewline, tableLine, afterNewline) => {
      // 테이블 행 앞뒤에 충분한 개행 확보
      const before = beforeNewline ? beforeNewline : '\n';
      const after = afterNewline ? afterNewline : '\n';
      return `${before}${tableLine}${after}`;
    }
  );
  
  // 과도한 줄바꿈 정규화
  processed = processed.replace(/\n\n\n+/g, '\n\n');
  
  // 헤더 앞에 충분한 공백 추가
  processed = processed.replace(
    /(\n?)#{1,6}\s+/g,
    (match, newline) => {
      return newline ? `\n\n${match.substring(newline.length)}` : `\n\n${match}`;
    }
  );
  
  return processed;
};

export default function MarkdownRenderer({ content, isNotionPage = false }) {
  const [processedContent, setProcessedContent] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notionData, setNotionData] = useState(null);
  
  // 노션 페이지 데이터 가져오기
  useEffect(() => {
    const loadNotionPage = async () => {
      if (!isNotionPage || !content) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const pageId = extractNotionPageId(content);
        if (!pageId) {
          throw new Error('유효한 노션 페이지 ID를 찾을 수 없습니다.');
        }
        
        // Splitbee API를 통해 노션 데이터 가져오기
        const blockMap = await fetchNotionPage(pageId);
        setNotionData(blockMap);
        setError(null);
      } catch (err) {
        console.error('노션 페이지 로딩 오류:', err);
        setError('노션 페이지를 불러오는 중 오류가 발생했습니다: ' + err.message);
        setNotionData(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (isNotionPage) {
      loadNotionPage();
    } else {
      processMarkdownContent();
    }
  }, [content, isNotionPage]);
  
  // 일반 마크다운 처리
  const processMarkdownContent = () => {
    try {
      let processed = content || "";
      
      // 마크다운 전처리
      processed = preprocessMarkdown(processed);
      
      const withCustom = processCustomComponents(processed);
      const safeContent = sanitizeUnknownTags(withCustom);

      setProcessedContent(safeContent);
    } catch (err) {
      console.error("렌더링 처리 오류:", err);
      setError("렌더링 중 오류가 발생했습니다.");
      setProcessedContent(String(content || ''));
    }
  };

  // 테이블 렌더링 커스텀 컴포넌트
  const TableComponent = ({ children, ...props }) => {
    return (
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table size="small" sx={{ minWidth: 500 }}>
          {children}
        </Table>
      </TableContainer>
    );
  };

  // 테이블 헤더 렌더링 커스텀 컴포넌트
  const TableHeadComponent = ({ children }) => {
    return <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.05)' }}>{children}</TableHead>;
  };

  // 테이블 바디 렌더링 커스텀 컴포넌트
  const TableBodyComponent = ({ children }) => {
    return <TableBody>{children}</TableBody>;
  };

  // 테이블 행 렌더링 커스텀 컴포넌트
  const TableRowComponent = ({ children, isHeader }) => {
    return <TableRow sx={{ '&:nth-of-type(even)': { bgcolor: 'rgba(0,0,0,0.02)' } }}>{children}</TableRow>;
  };

  // 테이블 셀 렌더링 커스텀 컴포넌트
  const TableCellComponent = ({ children, isHeader }) => {
    return isHeader ? (
      <TableCell sx={{ fontWeight: 'bold' }}>{children}</TableCell>
    ) : (
      <TableCell>{children}</TableCell>
    );
  };

  const components = {
    // 커스텀 컴포넌트 처리
    custom: ({ "data-component": name, children, ...props }) => {
      const Component = COMPONENT_MAP[name];
      if (!Component) return <code>&lt;{name} /&gt;</code>;

      const parsedProps = {};
      Object.entries(props).forEach(([k, v]) => {
        const key = k.startsWith("data-") ? k.replace("data-", "") : k;
        parsedProps[key] = v;
      });

      if (name === "CodeAccordion") {
        const code = Array.isArray(children) ? children.join("") : (children || "");
        return <Component codeString={code} {...parsedProps} />;
      }
      
      if (name === "ZoomableImageModal" && props.src) {
        return <Component imageSrc={props.src} altText={props.alt || ""} caption={props.caption || ""} {...parsedProps} />;
      }

      return <Component {...parsedProps}>{children}</Component>;
    },
    
    // 테이블 관련 컴포넌트 확장
    table: TableComponent,
    thead: TableHeadComponent,
    tbody: TableBodyComponent,
    tr: TableRowComponent,
    th: (props) => <TableCellComponent isHeader={true} {...props} />,
    td: TableCellComponent,
    
    // 기본 요소 스타일링
    code: ({ children, ...props }) => (
      <code
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word'
        }}
        {...props}
      >
        {children}
      </code>
    ),
    
    // 이미지 스타일링 추가
    img: ({ src, alt, ...props }) => (
      <img 
        src={src} 
        alt={alt || ''} 
        style={{ maxWidth: '100%', height: 'auto' }}
        {...props}
      />
    ),
    
    // 줄바꿈 처리 개선
    p: ({ children }) => (
      <p style={{ marginBottom: '1rem' }}>{children}</p>
    ),
    
    // 헤더 스타일링 개선
    h1: ({ children }) => <h1 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ marginTop: '1.2rem', marginBottom: '0.8rem' }}>{children}</h3>,
    h4: ({ children }) => <h4 style={{ marginTop: '1rem', marginBottom: '0.6rem' }}>{children}</h4>,
    h5: ({ children }) => <h5 style={{ marginTop: '0.8rem', marginBottom: '0.5rem' }}>{children}</h5>,
    h6: ({ children }) => <h6 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{children}</h6>
  };
  
  // 로딩 중 표시
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  // 에러 표시
  if (error) {
    return <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>;
  }
  
  // 노션 페이지 렌더링
  if (isNotionPage && notionData) {
    return (
      <Box className="notion-renderer" sx={{ wordBreak: 'break-word' }}>
        <ReactNotionX
          blockMap={notionData}
          fullPage={false}
          darkMode={false}
        />
      </Box>
    );
  }

  // 일반 마크다운 렌더링
  return (
    <Box sx={{ 
      wordBreak: 'break-word', 
      whiteSpace: 'pre-wrap',
      '& .markdown-body': {
        fontFamily: 'inherit'
      }
    }} className="markdown-body">
      <ReactMarkdown 
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml={false}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
}