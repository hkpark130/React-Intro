import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SyntaxHighlighter, { codeLanguage } from '../markdown/codeHighlight';
import solarizedlight from 'react-syntax-highlighter/dist/esm/styles/prism/solarizedlight';
import './project-sections.css';

const codeTheme = {
  ...solarizedlight,
  'code[class*="language-"]': { ...solarizedlight['code[class*="language-"]'], color: '#253b3b', textShadow: 'none' },
  'pre[class*="language-"]': { ...solarizedlight['pre[class*="language-"]'], color: '#253b3b', textShadow: 'none' },
  comment: { ...solarizedlight.comment, color: '#556c68' },
};

export default function CodeAccordion({ codeString, title = '코드 살펴보기', language = 'java', showLineNumbers = true, wrapLines = true, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(String(defaultExpanded) === 'true');
  const id = useId();
  return <Accordion className="project-code" disableGutters elevation={0} expanded={expanded} onChange={(_, next) => setExpanded(next)}>
    <AccordionSummary className="project-code-summary" id={id + '-summary'} aria-controls={id + '-content'}
      expandIcon={expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}>
      <Typography component="span" variant="inherit" className="project-code-title">{title}</Typography>
    </AccordionSummary>
    <AccordionDetails className="project-code-content">
      <SyntaxHighlighter language={codeLanguage(language)} style={codeTheme} showLineNumbers={showLineNumbers} wrapLines={wrapLines}
        tabIndex={0} aria-label={title}
        customStyle={{ background: 'transparent', margin: 0, padding: '20px', fontSize: '0.875rem', lineHeight: 1.8, borderRadius: 0 }}
        lineNumberStyle={{ color: '#5e716e', marginRight: '1em' }}>
        {codeString}
      </SyntaxHighlighter>
    </AccordionDetails>
  </Accordion>;
}
CodeAccordion.propTypes = {
  codeString: PropTypes.string.isRequired, title: PropTypes.string, language: PropTypes.string,
  showLineNumbers: PropTypes.bool, wrapLines: PropTypes.bool, defaultExpanded: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
