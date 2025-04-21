import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { NotionToMarkdown } from 'notion-to-md';
import { Client } from '@notionhq/client';
import ZoomableImageModal from '../section/ZoomableImageModal';
import CodeAccordion from '../section/CodeAccordion';
import { Box, Typography, Alert } from '@mui/material';

// Notion API 클라이언트 설정
const notion = new Client({
  auth: import.meta.env.VITE_NOTION_API_TOKEN,
});

// Notion-to-MD 변환기 초기화
const n2m = new NotionToMarkdown({ notionClient: notion });

// 등록된 컴포넌트 목록
const ALLOWED_COMPONENTS = ["ZoomableImageModal", "CodeAccordion"];

// 컴포넌트 매핑
const COMPONENT_MAP = {
  ZoomableImageModal,
  CodeAccordion
};

/**
 * Notion URL로부터 콘텐츠 가져오기
 */
const fetchNotionContent = async (notionUrl) => {
  try {
    // Notion URL에서 페이지 ID 추출
    const pageId = notionUrl.split('?')[0].split('/').pop().replace(/-/g, '');
    
    // CORS 오류를 피하기 위해 프록시 사용 시도
    try {
      // 직접 API 호출 시도
      const mdBlocks = await n2m.pageToMarkdown(pageId);
      return n2m.toMarkdownString(mdBlocks);
    } catch (apiError) {
      // API 직접 호출 중 CORS 오류가 발생한 경우
      if (apiError.message && (
          apiError.message.includes('CORS') || 
          apiError.message.includes('Failed to fetch') || 
          apiError.toString().includes('TypeError')
        )) {
        throw new Error(`CORS 정책으로 인해 Notion 내용을 불러올 수 없습니다. 
        Notion 페이지를 직접 마크다운으로 복사하여 붙여넣기 해주세요.`);
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Notion URL로부터 콘텐츠를 가져오는 중 오류 발생:", error);
    throw error;
  }
};

/**
 * 직접 복사한 Notion 콘텐츠 처리
 */
const processNotionPaste = (content) => {
  if (!content) return '';
  
  let processed = content;
  
  // 1. 코드 블록 처리 (```code```)
  processed = processed.replace(
    /```(\w*)\n([\s\S]*?)\n```/g,
    (_, language, code) => {
      return `<CodeAccordion>\n${code}\n</CodeAccordion>`;
    }
  );
  
  // 2. 체크박스 처리
  processed = processed.replace(
    /^- \[([ x])\] (.*?)$/gm,
    (_, checked, text) => {
      return checked === 'x' ? `✅ ${text}` : `☐ ${text}`;
    }
  );
  
  // 3. 토글 목록 처리
  processed = processed.replace(
    /^(.*?) *\(toggle\)$/gm,
    (_, text) => `<details><summary>${text}</summary>\n\n</details>`
  );
  
  // 4. 이미지 링크를 ZoomableImageModal로 변환
  processed = processed.replace(
    /!\[(.*?)\]\((.*?)\)/g, 
    (_, alt, src) => {
      return `<ZoomableImageModal src="${src}" alt="${alt}" />`;
    }
  );
  
  // 5. 테이블 형식 유지
  processed = processed.replace(/\|\s*\n\s*\|/g, '|\n|');
  
  return processed;
};

/**
 * 커스텀 컴포넌트를 data-component 속성을 가진 custom 태그로 변환
 */
const processCustomComponents = (markdown) => {
  if (!markdown) return '';
  let processed = markdown;
  
  // 각 컴포넌트를 처리 (열고 닫는 태그와 자체 닫는 태그 모두 처리)
  ALLOWED_COMPONENTS.forEach(componentName => {
    // 열고 닫는 태그 패턴 - <ZoomableImageModal>...</ZoomableImageModal>
    const openClosePattern = new RegExp(
      `<(${componentName})([^>]*)>(([\\s\\S]*?))<\\/${componentName}>`, 
      'g'
    );
    
    // 자체 닫는 태그 패턴 - <ZoomableImageModal />
    const selfClosingPattern = new RegExp(
      `<(${componentName})([^>]*?)\\s*/>`,
      'g'
    );
    
    // 열고 닫는 태그 처리
    processed = processed.replace(openClosePattern, 
      (_, name, attrs, __, content) => `<custom data-component="${name}"${attrs}>${content}</custom>`
    );
    
    // 자체 닫는 태그 처리
    processed = processed.replace(selfClosingPattern,
      (_, name, attrs) => `<custom data-component="${name}"${attrs}></custom>`
    );
  });
  
  return processed;
};

/**
 * 안전하지 않은 HTML 태그를 이스케이프하는 함수
 */
const sanitizeUnknownTags = (markdown) => {
  // 일반적인 마크다운 태그 + custom 태그만 허용
  const allowedTags = 'custom|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary';
  
  return markdown.replace(new RegExp(`<(?!\\/?(?:${allowedTags})\\b)([a-zA-Z][\\w\\d-]*)([^>]*)>`, 'g'), 
    (match) => match.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  );
};

export default function MarkdownRenderer({ content, isNotionUrl = false, isPaste = false }) {
  const [processedContent, setProcessedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 콘텐츠 처리
  useEffect(() => {
    async function handleContent() {
      if (!content) {
        setProcessedContent("");
        setError(null);
        return;
      }
      
      // URL 또는 복사한 Notion 콘텐츠인 경우 로딩 상태 표시
      if (isNotionUrl) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        let processed = content;
        
        // 1. Notion URL인 경우 API로 콘텐츠 가져오기
        if (isNotionUrl) {
          try {
            processed = await fetchNotionContent(content);
          } catch (notionError) {
            // Notion API 호출 실패 시 오류 메시지 설정
            setError(notionError.message);
            // URL을 일반 텍스트로 표시
            processed = `Notion 콘텐츠를 불러올 수 없습니다. [원본 링크](${content})`;
          }
        } 
        // 2. 붙여넣기한 Notion 콘텐츠인 경우 처리
        else if (isPaste) {
          processed = processNotionPaste(content);
        }
        
        // 3. 커스텀 컴포넌트 처리
        const withCustomComponents = processCustomComponents(processed);
        
        // 4. 안전하지 않은 태그 이스케이프
        const safeContent = sanitizeUnknownTags(withCustomComponents);
        
        setProcessedContent(safeContent);
      } catch (error) {
        console.error("콘텐츠 처리 중 오류:", error);
        // 오류 시 일반 마크다운으로 처리
        setError("콘텐츠 처리 중 오류가 발생했습니다.");
        const regularContent = processCustomComponents(content);
        setProcessedContent(sanitizeUnknownTags(regularContent));
      } finally {
        setIsLoading(false);
      }
    }

    handleContent();
  }, [content, isNotionUrl, isPaste]);

  // 커스텀 컴포넌트 매핑
  const components = {
    // 커스텀 태그 처리
    custom: ({ "data-component": componentName, children, ...props }) => {
      const Component = COMPONENT_MAP[componentName];
      
      if (!Component) {
        return <code>&lt;{componentName} /&gt;</code>;
      }
      
      // prop 속성들을 파싱해서 정확한 타입으로 변환
      const parsedProps = {};
      Object.entries(props).forEach(([key, value]) => {
        // imageSrc, altText, caption 같은 문자열 속성 처리
        if (typeof value === 'string') {
          if (key.startsWith('data-')) {
            // data-* 속성 제거
            const actualKey = key.replace('data-', '');
            parsedProps[actualKey] = value;
          } else {
            parsedProps[key] = value;
          }
        } else {
          parsedProps[key] = value;
        }
      });
      
      // CodeAccordion는 내용을 codeString prop으로 전달
      if (componentName === "CodeAccordion") {
        const code = Array.isArray(children) ? children.join("") : (children || "");
        return <Component codeString={code} {...parsedProps} />;
      }
      
      // ZoomableImageModal에는 imageSrc가 매우 중요
      if (componentName === "ZoomableImageModal" && props.src) {
        return <Component imageSrc={props.src} altText={props.alt || ""} caption={props.caption || ""} {...parsedProps} />;
      }
      
      // 기타 컴포넌트는 props를 그대로 전달
      return <Component {...parsedProps}>{children}</Component>;
    },
    
    // code 태그에 줄바꿈 스타일 적용
    code: ({node, inline, className, children, ...props}) => {
      return (
        <code
          style={{
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word'
          }}
          {...props}
        >
          {children}
        </code>
      )
    }
  };

  const containerStyle = {
    width: '100%',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all'
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Notion 콘텐츠 변환 중...</Typography>
      </Box>
    );
  }

  return (
    <div style={containerStyle}>
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}