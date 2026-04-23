import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/theme/ThemeProvider';

export default function CodeAccordion({
  codeString,
  title = '코드 살펴보기',
  language = 'java',
  showLineNumbers = true,
  wrapLines = true,
  defaultExpanded = false,
}) {
  const { mode } = useTheme();
  const initial = String(defaultExpanded) === 'true' || defaultExpanded === true;
  const [expanded, setExpanded] = useState(initial);
  const prismStyle = mode === 'dark' ? vscDarkPlus : solarizedlight;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        m: 0,
        my: 2,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md) !important',
        bgcolor: 'var(--bg-canvas)',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { margin: '16px 0 !important' },
      }}
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
    >
      <AccordionSummary
        sx={{
          backgroundColor: 'var(--bg-subtle)',
          flexDirection: 'row-reverse',
          minHeight: 44,
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          '&.Mui-expanded': { minHeight: 44 },
          '& .MuiAccordionSummary-content': { margin: '10px 0' },
          '& .MuiAccordionSummary-content.Mui-expanded': { margin: '10px 0' },
          '& .MuiAccordionSummary-expandIconWrapper': {
            marginRight: 1,
            color: 'var(--ink-muted)',
            transform: 'none',
            transition: 'none',
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'none' },
        }}
        expandIcon={expanded ? <ArrowDropDownIcon sx={{ fontSize: 28 }} /> : <ArrowRightIcon sx={{ fontSize: 28 }} />}
      >
        <Typography variant="subtitle2" sx={{ color: 'var(--ink)', fontWeight: 600 }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <SyntaxHighlighter
          language={language}
          style={prismStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          customStyle={{
            background: mode === 'dark' ? '#0d1117' : undefined,
            margin: 0,
            padding: '16px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          }}
          lineNumberStyle={{
            color: mode === 'dark' ? 'var(--term-muted)' : '#94a3b8',
            marginRight: '1em',
          }}
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
  wrapLines: PropTypes.bool,
  defaultExpanded: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
