import React from 'react';
import PropTypes from 'prop-types';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * CodeAccordion
 * - 재사용 가능한 코드 보기용 아코디언 컴포넌트입니다.
 *
 * Props:
 *  - codeString: 렌더링할 코드 문자열 (필수)
 *  - title: 아코디언 헤더에 표시될 제목 (기본: "핵심 코드 살펴보기")
 *  - language: 하이라이팅 언어 (기본: "java")
 *  - showLineNumbers: 라인 번호 표시 여부 (기본: true)
 *  - wrapLines: 라인 래핑 여부 (기본: true)
 */
export default function CodeAccordion({
  codeString,
  title = "코드 살펴보기",
  language = "java",
  showLineNumbers = true,
  wrapLines = true,
}) {
  return (
    <Accordion sx={{ mt: 3 }}>
      <AccordionSummary sx={{backgroundColor: "rgba(153,153,153,0.3)"}} expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SyntaxHighlighter
          language={language}
          style={solarizedlight}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          customStyle={{
            background: 'transparent',
            padding: '1rem',
            fontSize: '0.9rem',
            borderRadius: '4px'
          }}
          lineNumberStyle={{ color: '#ccc', marginRight: '1em' }}
        >
          {codeString}
        </SyntaxHighlighter>
      </AccordionDetails>
    </Accordion>
  );
}

CodeAccordion.propTypes = {
  codeString: PropTypes.string.isRequired,
  title: PropTypes.string,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  wrapLines: PropTypes.bool
};
