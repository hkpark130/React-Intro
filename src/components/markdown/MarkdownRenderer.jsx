/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^[A-Z_]", "argsIgnorePattern": "^_" }] */
import React, { useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkToc from 'remark-toc';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeMarkdownPolicy from './rehypeMarkdownPolicy';
import { sanitizeMarkdownUrl } from './urlPolicy';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import Bookmark from './Bookmark';
import AlertBlock from './AlertBlock';
import { Box, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { prepareMarkdown, parseAttributes } from './prepareMarkdown';
import { markdownColorStyle } from '../../../server/notion-service/src/markdown/colorPolicy.js';

import './markdown-styles.css';

// ===== 유틸리티 함수 =====

const BLOCK_TAGS = new Set(['p', 'div', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const REMARK_PLUGINS = [remarkBreaks, remarkToc, remarkGfm];
// Only trusted highlighters and heading helpers run after author HTML is clean.
const REHYPE_PLUGINS = [rehypeRaw, rehypeMarkdownPolicy, rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings];
const transformUrl = (url, name) => sanitizeMarkdownUrl(url, { kind: name === 'href' ? 'link' : 'media' }) || undefined;

/** React 노드에서 순수 텍스트만 추출 */
const toPlainText = (nodes) => {
  const walk = (n) => {
    if (n == null || n === false) return '';
    if (typeof n === 'string' || typeof n === 'number') return String(n);
    if (Array.isArray(n)) return n.map(walk).join('');
    const { type, props } = n;
    const inner = walk(props?.children);
    if (type === 'br') return '\n';
    if (typeof type === 'string' && BLOCK_TAGS.has(type)) {
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

// ===== 공통 스타일 상수 =====
const LIST_STYLE = { paddingLeft: '1.6em', margin: '0.8em 0', lineHeight: 'inherit', listStylePosition: 'outside' };
const LIST_ITEM_STYLE = { margin: '0.25em 0', lineHeight: 'inherit' };
const CODE_BLOCK_STYLE = { margin: '1.25em 0', backgroundColor: '#f5f6f8', padding: '16px', borderRadius: '6px', overflowX: 'auto' };


// ===== 메인 컴포넌트 =====
export default function MarkdownRenderer({ content }) {
  const { text: processedContent, components: extractedComponents, error } = useMemo(() => {
    try {
      return prepareMarkdown(content);
    } catch (err) {
      console.error('렌더링 처리 오류:', err);
      return { text: '', components: [], error: '렌더링 중 오류가 발생했습니다.' };
    }
  }, [content]);
  const componentLookup = useMemo(() => new Map(extractedComponents.map(component => [
    component.id, { ...component, attrs: parseAttributes(component.attributes) },
  ])), [extractedComponents]);

  // 추출된 컴포넌트를 실제 React 컴포넌트로 렌더링
  const renderExtractedComponent = useCallback((componentData) => {
    if (!componentData) return null;
    
    const { tagName, attrs, content: innerContent } = componentData;
    switch (tagName.toLowerCase()) {
      case 'inlinecode': return <code>{innerContent}</code>;
      case 'literalcode': return <pre className="markdown-code-block" style={CODE_BLOCK_STYLE}><code>{innerContent}</code></pre>;
      case 'codeaccordion': return (
        <CodeAccordion
          codeString={innerContent.replace(/^\n+|\n+$/g, '')}
          title={attrs.title}
          language={attrs.language || 'java'}
          showLineNumbers={toBoolean(attrs.showlinenumbers ?? attrs.showLineNumbers, true)}
          wrapLines={toBoolean(attrs.wraplines ?? attrs.wrapLines, true)}
          defaultExpanded={toBoolean(attrs.defaultexpanded ?? attrs.defaultExpanded, false)}
        />
      );
      case 'zoomableimagemodal': {
        const src = sanitizeMarkdownUrl(attrs.src, { kind: 'media' });
        if (!src) return <figure><span>{attrs.alt || ''}</span>{attrs.caption && <figcaption>{attrs.caption}</figcaption>}</figure>;
        return (
          <ZoomableImageModal
            imageSrc={src}
            altText={attrs.alt || ''}
            caption={attrs.caption || ''}
          />
        );
      }
      case 'bookmark': return (
        <Bookmark
          url={sanitizeMarkdownUrl(attrs.url)}
          title={attrs.title || ''}
          description={attrs.description || ''}
          imageUrl={sanitizeMarkdownUrl(attrs.imageurl, { kind: 'media' })}
        />
      );
      case 'alert':
      case 'alertblock': return <AlertBlock severity={attrs.severity || 'info'}><MarkdownRenderer content={innerContent} /></AlertBlock>;
      default: return null;
    }
  }, []);

  // ReactMarkdown components 객체 - useMemo로 최적화
  const components = useMemo(() => ({
    // Summary - MUI disclosure icon 삽입
    summary: ({ children, node: _node, ...props }) => (
      <summary {...props}>
        <PlayArrowIcon className="mui-disclosure-icon" fontSize="medium" />
        {children}
      </summary>
    ),
    
    // 링크 - [bookmark](url) 패턴 지원
    a: ({ href, children, node: _node, ...props }) => {
      const safeHref = sanitizeMarkdownUrl(href);
      try {
        const text = (toPlainText(children) || '').trim().toLowerCase();
        if (text === 'bookmark' && safeHref) {
          return <Bookmark url={safeHref} />;
        }
      } catch { /* 파싱 실패 무시 */ }
      const external = /^https?:\/\//i.test(safeHref);
      return <a {...props} href={safeHref || undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="markdown-link">{children}</a>;
    },

    // 커스텀 컴포넌트 플레이스홀더 처리
    div: ({ children, node: _node, 'data-custom-placeholder': placeholderId, ...props }) => {
      const componentData = componentLookup.get(placeholderId);
      return componentData ? renderExtractedComponent(componentData) : <div {...props}>{children}</div>;
    },
    span: ({ children, node: _node, 'data-custom-placeholder': placeholderId, 'data-text-color': textColor, 'data-background-color': backgroundColor, ...props }) => {
      const componentData = componentLookup.get(placeholderId);
      if (componentData) return renderExtractedComponent(componentData);
      const style = markdownColorStyle(textColor, backgroundColor);
      return <span {...props} data-text-color={textColor} data-background-color={backgroundColor} style={style}>{children}</span>;
    },

    // 테이블 컴포넌트
    table: ({ children, node: _node, ...props }) => (
      <TableContainer className="markdown-table-container" tabIndex={0}>
        <Table className="markdown-table" sx={{ minWidth: 500, width: 'auto' }} {...props}>{children}</Table>
      </TableContainer>
    ),
    thead: ({ children, node: _node, ...props }) => <TableHead {...props} className="markdown-table-head">{children}</TableHead>,
    tbody: ({ children, node: _node, ...props }) => <TableBody {...props}>{children}</TableBody>,
    tr: ({ children, node: _node, ...props }) => <TableRow {...props} className="markdown-table-row">{children}</TableRow>,
    th: ({ children, node: _node, align, style, ...props }) => <TableCell {...props} className="markdown-table-header" sx={{ fontWeight: 'bold' }} style={{ textAlign: style?.textAlign || align }}>{children}</TableCell>,
    td: ({ children, node: _node, align, style, ...props }) => <TableCell {...props} className="markdown-table-cell" style={{ textAlign: style?.textAlign || align }}>{children}</TableCell>,
    
    // 코드 블록
    pre: ({ children, node: _node, ...props }) => (
      <pre className="markdown-code-block" style={CODE_BLOCK_STYLE} {...props}>{children}</pre>
    ),
    
    // 리스트 - 공통 스타일 사용
    ul: ({ children, node: _node, ...props }) => <ul {...props} style={LIST_STYLE}>{children}</ul>,
    ol: ({ children, node: _node, ...props }) => <ol {...props} style={LIST_STYLE}>{children}</ol>,
    li: ({ children, node: _node, ...props }) => <li {...props} style={LIST_ITEM_STYLE}>{children}</li>,
    
    // 인라인 스타일 요소
    u: ({ children, node: _node, ...props }) => <span {...props} style={{ textDecoration: 'underline' }}>{children}</span>,
    b: ({ children, node: _node, ...props }) => <span {...props} style={{ fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{children}</span>,
    mark: ({ children, node: _node, ...props }) => <span {...props} style={{ backgroundColor: '#ffff00', padding: '0.1em 0.2em', borderRadius: '0.2em' }}>{children}</span>,
    small: ({ children, node: _node, ...props }) => <span {...props} style={{ fontSize: '0.8em' }}>{children}</span>,

    // 비디오 요소
    video: ({ children, node: _node, ...props }) => (
      <Box component="span" sx={{ display: 'block', mb: 1 }}>
        <video style={{ height: 'auto', borderRadius: '4px' }} {...props}>{children}</video>
      </Box>
    ),
    source: ({ node: _node, ...props }) => <source {...props} />,
  }), [componentLookup, renderExtractedComponent]);

  // 에러 표시
  if (error) {
    return <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>;
  }

  return (
    <Box className="markdown-body">
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={components}
        urlTransform={transformUrl}
        skipHtml={false}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
}
