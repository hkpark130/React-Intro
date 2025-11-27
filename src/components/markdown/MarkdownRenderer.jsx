import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkToc from 'remark-toc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import Bookmark from './Bookmark';
import AlertBlock from './AlertBlock';
import { Box, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import './markdown-styles.css';

// ===== 상수 =====
const CUSTOM_TAGS = ['CodeAccordion', 'ZoomableImageModal', 'Bookmark', 'Alert', 'AlertBlock'];

// ===== 유틸리티 함수 =====

/** React 노드에서 순수 텍스트만 추출 */
const toPlainText = (nodes) => {
  const walk = (n) => {
    if (n == null || n === false) return '';
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(walk).join('');
    const { type, props } = n;
    const inner = walk(props?.children);
    const blockTags = new Set(['p', 'div', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
    if (type === 'br') return '\n';
    if (typeof type === 'string' && blockTags.has(type)) {
      return type === 'li' ? `- ${inner}\n` : `${inner}\n`;
    }
    return inner;
  };
  return walk(nodes).replace(/\r/g, '').replace(/\n{3,}/g, '\n\n');
};

/** 다양한 문자열 값을 boolean으로 변환 */
const toBoolean = (value, defaultValue = false) => {
  if (value == null) return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'on', 'open'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off', 'hidden'].includes(normalized)) return false;
  return defaultValue;
};

/** HTML 속성 문자열을 파싱하여 객체로 변환 */
const parseAttributes = (attrString) => {
  const attrs = {};
  if (!attrString) return attrs;
  const regex = /(\w+)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? true;
  }
  return attrs;
};

/** 커스텀 컴포넌트 태그를 추출하고 플레이스홀더로 교체 */
const extractCustomComponents = (markdown) => {
  if (!markdown || typeof markdown !== 'string') return { text: '', components: [] };
  
  const components = [];
  let text = markdown;
  
  CUSTOM_TAGS.forEach(tagName => {
    // 열림/닫힘 태그 처리
    text = text.replace(
      new RegExp(`<(${tagName})([^>]*)>([\\s\\S]*?)<\\/${tagName}>`, 'gi'),
      (_, tag, attrs, inner) => {
        const id = `__CUSTOM_COMPONENT_${components.length}__`;
        components.push({ id, tagName: tag, attributes: attrs.trim(), content: inner });
        return `\n\n<div data-custom-placeholder="${id}"></div>\n\n`;
      }
    );
    // Self-closing 태그 처리
    text = text.replace(
      new RegExp(`<(${tagName})([^>]*?)\\s*/>`, 'gi'),
      (_, tag, attrs) => {
        const id = `__CUSTOM_COMPONENT_${components.length}__`;
        components.push({ id, tagName: tag, attributes: attrs.trim(), content: '' });
        return `\n\n<div data-custom-placeholder="${id}"></div>\n\n`;
      }
    );
  });
  
  return { text, components };
};

/** 허용되지 않은 HTML 태그를 이스케이프 */
const sanitizeUnknownTags = (markdown) => {
  const allowedTags = `custom|section|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary|video|source|u|small|mark|b`;
  return markdown.replace(
    new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'),
    match => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

/** 마크다운 전처리 - <b> 태그 공백 처리 */
const preprocessMarkdown = (content) => {
  if (!content || typeof content !== 'string') return '';
  return content
    .replace(/(<b>)([^<]*?)(\s+)([^<]*?)(<\/b>)/g, '$1$2&nbsp;$4$5')
    .replace(/(\s+)(<b>)/g, '$1$2')
    .replace(/(<\/b>)(\s+)/g, '$1$2');
};

// ===== 공통 스타일 상수 =====
const LIST_STYLE = { paddingLeft: '20px', paddingTop: 0, paddingBottom: 0, lineHeight: '0.3', listStylePosition: 'outside' };
const LIST_ITEM_STYLE = { marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, lineHeight: '1.3' };
const CODE_BLOCK_STYLE = { marginTop: 0, marginBottom: 0, backgroundColor: 'rgb(224, 224, 224)', padding: '10px', borderRadius: '4px', overflowX: 'auto' };


// ===== 메인 컴포넌트 =====
export default function MarkdownRenderer({ content }) {
  const [processedContent, setProcessedContent] = useState('');
  const [extractedComponents, setExtractedComponents] = useState([]);
  const [error, setError] = useState(null);
  
  // 컨텐츠 처리
  useEffect(() => {
    try {
      const processed = preprocessMarkdown(content || '');
      const { text, components } = extractCustomComponents(processed);
      const safeContent = sanitizeUnknownTags(text);
      
      setProcessedContent(safeContent);
      setExtractedComponents(components);
      setError(null);
    } catch (err) {
      console.error('렌더링 처리 오류:', err);
      setError('렌더링 중 오류가 발생했습니다.');
      setProcessedContent(String(content || ''));
      setExtractedComponents([]);
    }
  }, [content]);

  // 추출된 컴포넌트를 실제 React 컴포넌트로 렌더링
  const renderExtractedComponent = useCallback((componentData) => {
    if (!componentData) return null;
    
    const { tagName, attributes, content: innerContent } = componentData;
    const attrs = parseAttributes(attributes);
    const normalizedTag = tagName.toLowerCase();
    
    const componentMap = {
      codeaccordion: () => (
        <CodeAccordion
          codeString={innerContent.replace(/^\n+|\n+$/g, '')}
          title={attrs.title}
          language={attrs.language || 'java'}
          showLineNumbers={toBoolean(attrs.showlinenumbers ?? attrs.showLineNumbers, true)}
          wrapLines={toBoolean(attrs.wraplines ?? attrs.wrapLines, true)}
          defaultExpanded={toBoolean(attrs.defaultexpanded ?? attrs.defaultExpanded, false)}
        />
      ),
      zoomableimagemodal: () => (
        <ZoomableImageModal
          imageSrc={attrs.src || ''}
          altText={attrs.alt || ''}
          caption={attrs.caption || ''}
        />
      ),
      bookmark: () => (
        <Bookmark
          url={attrs.url || ''}
          title={attrs.title || ''}
          description={attrs.description || ''}
          imageUrl={attrs.imageurl || attrs.imageUrl || ''}
        />
      ),
      alert: () => <AlertBlock severity={attrs.severity || 'info'}>{innerContent}</AlertBlock>,
      alertblock: () => <AlertBlock severity={attrs.severity || 'info'}>{innerContent}</AlertBlock>
    };
    
    return componentMap[normalizedTag]?.() ?? null;
  }, []);

  // ReactMarkdown components 객체 - useMemo로 최적화
  const components = useMemo(() => ({
    // Summary - MUI disclosure icon 삽입
    summary: ({ children, ...props }) => (
      <summary {...props}>
        <PlayArrowIcon className="mui-disclosure-icon" fontSize="medium" />
        {children}
      </summary>
    ),
    
    // 링크 - [bookmark](url) 패턴 지원
    a: ({ href, children, ...props }) => {
      try {
        const text = (toPlainText(children) || '').trim().toLowerCase();
        if (text === 'bookmark' && href) {
          return <Bookmark url={href} />;
        }
      } catch { /* 파싱 실패 무시 */ }
      return <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link" {...props}>{children}</a>;
    },

    // 커스텀 컴포넌트 플레이스홀더 처리
    div: ({ children, ...props }) => {
      const placeholderId = props['data-custom-placeholder'];
      if (placeholderId) {
        const componentData = extractedComponents.find(c => c.id === placeholderId);
        if (componentData) return renderExtractedComponent(componentData);
      }
      return <div {...props}>{children}</div>;
    },

    // 테이블 컴포넌트
    table: ({ children, ...props }) => (
      <TableContainer>
        <Table className="markdown-table" sx={{ minWidth: 500, width: 'auto' }} {...props}>{children}</Table>
      </TableContainer>
    ),
    thead: ({ children }) => <TableHead className="markdown-table-head">{children}</TableHead>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow className="markdown-table-row">{children}</TableRow>,
    th: ({ children }) => <TableCell className="markdown-table-header" sx={{ fontWeight: 'bold' }}>{children}</TableCell>,
    td: ({ children }) => <TableCell className="markdown-table-cell">{children}</TableCell>,
    
    // 코드 블록
    pre: ({ children, ...props }) => (
      <pre className="markdown-code-block" style={CODE_BLOCK_STYLE} {...props}>{children}</pre>
    ),
    
    // 리스트 - 공통 스타일 사용
    ul: ({ children }) => <ul style={LIST_STYLE}>{children}</ul>,
    ol: ({ children }) => <ol style={LIST_STYLE}>{children}</ol>,
    li: ({ children }) => <li style={LIST_ITEM_STYLE}>{children}</li>,
    
    // 인라인 스타일 요소
    u: ({ children }) => <span style={{ textDecoration: 'underline' }}>{children}</span>,
    b: ({ children }) => <span style={{ fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{children}</span>,
    mark: ({ children }) => <span style={{ backgroundColor: '#ffff00', padding: '0.1em 0.2em', borderRadius: '0.2em' }}>{children}</span>,
    small: ({ children }) => <span style={{ fontSize: '0.8em' }}>{children}</span>,

    // 비디오 요소
    video: ({ children, ...props }) => (
      <Box sx={{ mb: 1 }}>
        <video style={{ height: 'auto', borderRadius: '4px' }} {...props}>{children}</video>
      </Box>
    ),
    source: (props) => <source {...props} />,
  }), [extractedComponents, renderExtractedComponent]);

  // 에러 표시
  if (error) {
    return <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={{ wordBreak: 'break-word', '& .markdown-body': { fontFamily: 'inherit' } }} className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkBreaks, remarkToc, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings]}
        components={components}
        skipHtml={false}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
}