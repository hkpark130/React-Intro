import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
// import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import { Box, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// react-notion-x 컴포넌트 스타일
import './markdown-styles.css';

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
  const allowedTags = 'custom|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary|video|source|u|small|mark';

  return markdown.replace(
    new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'),
    match => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

const preprocessMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  let processed = content;  
  return processed;
};

export default function MarkdownRenderer({ content }) {
  const [processedContent, setProcessedContent] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
    // marked 옵션 설정
    marked.setOptions({
      gfm: true,
      breaks: true,
      smartLists: false,
      xhtml: false
    });
    
    processMarkdownContent();
  }, [content]);

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
      <TableContainer >
        <Table sx={{ minWidth: 500, width: 'auto' }} {...props}>
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
  const TableRowComponent = ({ children }) => {
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
    
    // 밑줄 태그 처리 추가
    u: ({ children }) => (
      <span style={{ textDecoration: 'underline' }}>{children}</span>
    ),
    
    // 줄바꿈 처리 개선
    p: ({ children }) => (
      <p style={{ marginTop: '0', marginBottom: '0' }}>{children}</p>
    ),
    
    // 헤더 스타일링 개선
    h1: ({ children }) => <h1 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h1>,
    h2: ({ children }) => <h2 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h3>,
    h4: ({ children }) => <h4 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h4>,
    h5: ({ children }) => <h5 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h5>,
    h6: ({ children }) => <h6 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h6>,

    pre: ({ children }) => (
      <pre style={{ marginTop: '0', marginBottom: '0', backgroundColor: 'rgb(224, 224, 224)', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
        <code style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
          {children}
        </code>
      </pre>
    ),

    mark: ({ children }) => (
      <span style={{ 
        backgroundColor: '#ffff00', 
        padding: '0.1em 0.2em',
        borderRadius: '0.2em'
      }}>
        {children}
      </span>
    ),

    // 비디오 요소 처리 추가
    video: ({ children, ...props }) => {
      return (
        <Box sx={{ mb: 1 }}>
          <video 
            style={{ height: 'auto', borderRadius: '4px' }}
            {...props}
          >
            {children}
          </video>
        </Box>
      );
    },
    
    source: (props) => <source {...props} />,

    small: ({ children }) => (
      <span style={{ fontSize: '0.8em' }}>{children}</span>
    ),

    // ul 목록 스타일링 추가
    ul: ({ children }) => (
      <ul style={{ 
        marginTop: '0', 
        marginBottom: '0',
        paddingLeft: '20px', 
        paddingTop: '0',
        paddingBottom: '0',
        lineHeight: '0.3',
        listStylePosition: 'outside' 
      }}>
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol style={{ 
        marginTop: '0', 
        marginBottom: '0',
        paddingLeft: '20px', 
        paddingTop: '0',
        paddingBottom: '0',
        lineHeight: '0.3',
        listStylePosition: 'outside' 
      }}>
        {children}
      </ol>
    ),

    // li 항목 스타일링 추가
    li: ({ children }) => (
      <li style={{ 
        marginTop: '0', 
        marginBottom: '0',
        paddingTop: '0',
        paddingBottom: '0',
        lineHeight: '1.3'
      }}>
        {children}
      </li>
    ),
  };

  // 에러 표시
  if (error) {
    return <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>;
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
        // remarkPlugins={[remarkGfm]} // 이거 rehypeRaw와 충돌함
        components={components}
        skipHtml={false}
      >
        {marked(processedContent)}
      </ReactMarkdown>
    </Box>
  );
}