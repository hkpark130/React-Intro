import PropTypes from 'prop-types';
import { Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import './project-sections.css';

export default function Reference({ spaLinks = [], externalLinks = [] }) {
  return <section className="project-references">
    <h2 className="project-section-heading">🔗 Reference</h2>
    <ul className="project-reference-list">
      {spaLinks.map(({ prefix, to, label, highlighted }, index) => <li key={'internal-' + index}>
        <span className="project-reference-prefix">{prefix}{' '}</span>
        <MuiLink component={RouterLink} to={to} className={highlighted ? 'project-reference-featured' : undefined}>{label}</MuiLink>
      </li>)}
      {externalLinks.map(({ prefix, href, label, highlighted }, index) => <li key={'external-' + index}>
        <span className="project-reference-prefix">{prefix}{' '}</span>
        <MuiLink href={href} target="_blank" rel="noopener noreferrer" className={highlighted ? 'project-reference-featured' : undefined}>{label}</MuiLink>
      </li>)}
    </ul>
  </section>;
}
Reference.propTypes = {
  spaLinks: PropTypes.arrayOf(PropTypes.shape({ prefix: PropTypes.string, to: PropTypes.string.isRequired, label: PropTypes.string.isRequired, highlighted: PropTypes.bool })),
  externalLinks: PropTypes.arrayOf(PropTypes.shape({ prefix: PropTypes.string, href: PropTypes.string.isRequired, label: PropTypes.string.isRequired, highlighted: PropTypes.bool })),
};
