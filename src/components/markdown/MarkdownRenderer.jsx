import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';  // GitHub Flavored Markdown 지원을 위해 추가
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import { Box, Alert } from '@mui/material';

const ALLOWED_COMPONENTS = ["ZoomableImageModal", "CodeAccordion"];
const COMPONENT_MAP = {
  ZoomableImageModal,
  CodeAccordion
};

// 커스텀 컴포넌트만 처리 (노션 관련 처리 제거)
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

// HTML 태그 처리 로직 유지 (보안 관련 중요)
const sanitizeUnknownTags = (markdown) => {
  const allowedTags = 'custom|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary';

  return markdown.replace(
    new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'),
    match => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

export default function MarkdownRenderer({ content }) {
  const [processedContent, setProcessedContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let processed = content || "";
      
      // 노션 관련 처리 제거, 커스텀 컴포넌트와 HTML 안전성 처리만 유지
      const withCustom = processCustomComponents(processed);
      const safeContent = sanitizeUnknownTags(withCustom);

      setProcessedContent(safeContent);
    } catch (err) {
      console.error("렌더링 처리 오류:", err);
      setError("렌더링 중 오류가 발생했습니다.");
      setProcessedContent(String(content || ''));
    }
  }, [content]);

  const components = {
    // 커스텀 컴포넌트 처리 유지
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
    
    // 기본 요소 스타일링 강화
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
    
    // 테이블 스타일 강화 
    table: props => (
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1rem' }} {...props} />
    ),
    th: props => (
      <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }} {...props} />
    ),
    td: props => (
      <td style={{ border: '1px solid #ddd', padding: '8px' }} {...props} />
    )
  };

  return (
    <Box sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <ReactMarkdown 
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // GitHub Flavored Markdown 지원 추가
        components={components}
      >
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
}