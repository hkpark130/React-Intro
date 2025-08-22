import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkToc from 'remark-toc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import Bookmark from './Bookmark';
import AlertBlock from './AlertBlock';
import { Box, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// react-notion-x 컴포넌트 스타일
import './markdown-styles.css';

// 커스텀 태그로 치환해서 처리할 컴포넌트 목록
const ALLOWED_COMPONENTS = ["ZoomableImageModal", "CodeAccordion", "Bookmark", "Alert", "AlertBlock"];
const COMPONENT_MAP = {
  ZoomableImageModal,
  CodeAccordion,
  Bookmark,
  Alert: AlertBlock,
  AlertBlock
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
  const allowedTags = 'custom|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary|video|source|u|small|mark|b';

  return markdown.replace(
    new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'),
    match => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

const preprocessMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  let processed = content;

  // 줄바꿈 정규화 (CRLF/CR -> LF)
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 과도한 줄바꿈 정규화
  processed = processed.replace(/\n\n\n+/g, '\n\n');

  // 헤딩 뒤 과도한 빈 줄 -> 하나로 축소 (헤딩 다음 표/리스트 앞 공백 폭 제거)
  processed = processed.replace(/^(#{1,6} .+?)\n{2,}/gm, '$1\n');

  // 블록 요소(표/리스트/코드) 앞의 3줄 이상 공백을 1~2줄로 축소
  processed = processed
    // 표 앞
    .replace(/\n{3,}(\|[^\n]*\|)/g, '\n\n$1')
    // 리스트 앞
    .replace(/\n{3,}(- |\d+\. )/g, '\n\n$1')
    // 코드펜스 앞
    .replace(/\n{3,}(```|~~~)/g, '\n\n$1');
  
  // 공백 처리 개선 - <b> 태그 내의 공백이 사라지지 않도록 처리
  processed = processed.replace(/(<b>)([^<]*?)(\s+)([^<]*?)(<\/b>)/g, '$1$2&nbsp;$4$5');
  
  // <b> 태그 앞뒤 공백 유지
  processed = processed.replace(/(\s+)(<b>)/g, '$1$2');
  processed = processed.replace(/(<\/b>)(\s+)/g, '$1$2');
  
  return processed;
};

// 매우 단순한 sx 문자열 파서: "{ key: 'val', num: 1 }" 형태를 JS 객체로 변환
// 따옴표/숫자/px 등 기본값만 처리 (중첩 객체/배열은 미지원)
const parseSx = (sxStr) => {
  if (!sxStr || typeof sxStr !== 'string') return undefined;
  let s = sxStr.trim();
  // 앞뒤 중괄호(한두 겹) 제거
  s = s.replace(/^\{+\s*/, '').replace(/\s*\}+$/, '');
  const out = {};
  const regex = /([a-zA-Z0-9_-]+)\s*:\s*([^,]+)\s*(?:,|$)/g;
  let m;
  while ((m = regex.exec(s)) !== null) {
    const key = m[1].trim();
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1);
    } else if (/^-?\d+(?:\.\d+)?$/.test(val)) {
      val = Number(val);
    }
    if (key) out[key] = val;
  }
  return Object.keys(out).length ? out : undefined;
};

export default function MarkdownRenderer({ content }) {
  const [processedContent, setProcessedContent] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
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
    // Inject MUI disclosure icon into summary
    summary: ({ children, ...props }) => (
      <summary {...props}>
        <PlayArrowIcon className="mui-disclosure-icon" fontSize="medium" />
        {children}
      </summary>
    ),
    // a 링크 커스텀: [bookmark](url) 패턴을 Bookmark 카드로 변환
    a: ({ href, children, ...props }) => {
      try {
        const text = (components._toPlainText(children) || '').trim().toLowerCase();
        if (text === 'bookmark' && href) {
          return <Bookmark url={href} />;
        }
      } catch (_) {}
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },

    // children -> plain text로 변환 (줄바꿈 유지)
    // React 요소 구조를 순회하며 텍스트/개행을 복원
    _toPlainText: (nodes) => {
      const walk = (n) => {
        if (n == null || n === false) return '';
        if (typeof n === 'string' || typeof n === 'number') return String(n);
        if (Array.isArray(n)) return n.map(walk).join('');
        // React element
        const type = n.type;
        const children = n.props?.children;
        const inner = walk(children);
        // 블록 요소는 개행을 넣어 가독성 유지
        const blockTags = new Set(['p','div','pre','code','ul','ol','li','table','thead','tbody','tr','th','td','h1','h2','h3','h4','h5','h6']);
        if (type === 'br') return '\n';
        if (typeof type === 'string' && blockTags.has(type)) {
          return (type === 'li') ? `- ${inner}\n` : `${inner}\n`;
        }
        return inner;
      };
      // 후처리: 연속 개행 정리
      return walk(nodes).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n');
    },
    // 커스텀 컴포넌트 처리
    custom: ({ "data-component": name, children, ...props }) => {
      const Component = COMPONENT_MAP[name];
      if (!Component) return <code>&lt;{name} /&gt;</code>;

      // props 파싱 개선
      const parsedProps = {};
      
      // 모든 data-* 속성 처리
      Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith("data-") && key !== "data-component") {
          // data- 접두사 제거
          const propKey = key.replace("data-", "");
          parsedProps[propKey] = value;
        } else if (!key.startsWith("data-")) {
          // 일반 속성은 그대로 전달
          parsedProps[key] = value;
        }
      });
      
      if (name === "Bookmark") {
        return (
          <Component 
            url={props.url || ""} 
            title={props.title || ""} 
            description={props.description || ""}
            imageUrl={props.imageurl || ""}
            {...parsedProps}
          >
            {children}
          </Component>
        );
      }
      
      if (name === "CodeAccordion") {
        const code = components._toPlainText(children).replace(/^\n+|\n+$/g, '');
        // HTML 속성은 소문자로 들어올 수 있으므로 보정
        const { defaultexpanded, ...restProps } = parsedProps;
        const compProps = {
          ...restProps,
          defaultExpanded: restProps.defaultExpanded ?? defaultexpanded
        };
        return <Component codeString={code} {...compProps} />;
      }
      
      if (name === "ZoomableImageModal") {
        return <Component 
          imageSrc={props.src || ""} 
          altText={props.alt || ""} 
          caption={props.caption || ""} 
          {...parsedProps} 
        />;
      }

  if (name === "AlertBlock") {
        const severity = (props.severity || parsedProps.severity || 'info');
        return (
          <AlertBlock severity={severity} {...parsedProps}>
            {children}
          </AlertBlock>
        );
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
    // 코드 블록: 기존의 <pre><code>를 다시 감싸지 않음 (중복 감싸기 제거)
    pre: ({ children, ...props }) => (
      <pre
        style={{
          marginTop: '0',
          marginBottom: '0',
          backgroundColor: 'rgb(224, 224, 224)',
          padding: '10px',
          borderRadius: '4px',
          overflowX: 'auto'
        }}
        {...props}
      >
        {children}
      </pre>
    ),
    h3: ({ children }) => <h3 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h3>,
    h4: ({ children }) => <h4 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h4>,
    h5: ({ children }) => <h5 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h5>,
    h6: ({ children }) => <h6 style={{ marginTop: '0', marginBottom: '0' }}>{children}</h6>,

  // 중복 pre 제거됨

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

    // b 태그 처리 추가 (공백 유지를 위한 처리)
    b: ({ children }) => (
      <span style={{ 
        fontWeight: 'bold',
        whiteSpace: 'pre-wrap' // 공백 유지를 위해 추가
      }}>
        {children}
      </span>
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
      // 전역 pre-wrap 제거: 필요 시 개별 요소에서만 적용
      '& .markdown-body': {
        fontFamily: 'inherit'
      }
    }} className="markdown-body">
  <ReactMarkdown 
    remarkPlugins={[remarkToc, remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          rehypeSlug,
          rehypeAutolinkHeadings,
        ]}
        // rehypePlugins={[rehypeRaw]}
        components={components}
        skipHtml={false}
      >
    {processedContent}
      </ReactMarkdown>
    </Box>
  );
}