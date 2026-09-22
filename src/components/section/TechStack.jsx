import PropTypes from 'prop-types';
import CodeIcon from '@mui/icons-material/Code';
import './project-sections.css';

export default function TechStack({ techStacks }) {
  return <section className="project-tech-stack">
    <h2 className="project-section-heading"><CodeIcon aria-hidden="true" /> 기술 스택</h2>
    <dl className="project-tech-list">
      {techStacks.map((tech, index) => <div className="project-tech-row" key={index}>
        <dt>{tech.category}</dt>
        <dd><ul>{tech.labels.map((item, itemIndex) => <li key={itemIndex}>{item.label}</li>)}</ul></dd>
      </div>)}
    </dl>
  </section>;
}
TechStack.propTypes = {
  techStacks: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    labels: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, color: PropTypes.string })).isRequired,
  })).isRequired,
};
