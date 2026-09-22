import { Link } from 'react-router-dom';
import './project-review.css';

const priorityLabels = { high: '우선 개선', medium: '설계 보완', low: '추가 점검' };

function ReviewText({ text }) {
  return text.split(/(`[^`]+`)/g).map((part, index) => part.startsWith('`') && part.endsWith('`')
    ? <code key={index}>{part.slice(1, -1)}</code>
    : part);
}

export default function ProjectReview({ review }) {
  if (!review?.items?.length) return null;

  return (
    <section className="project-review" aria-labelledby="project-review-heading">
      <div className="project-review-heading">
        <h2 id="project-review-heading">개선할 점</h2>
      </div>
      <p className="project-review-summary"><ReviewText text={review.summary} /></p>

      <div className="project-review-items">
        {review.items.map((item, index) => (
          <details className="project-review-item" id={`review-${item.id}`} key={item.id} open={index === 0}>
            <summary>
              <span className="project-review-priority" data-priority={item.priority}>{priorityLabels[item.priority]}</span>
              <h3>{item.title}</h3>
              <span className="project-review-toggle" aria-hidden="true" />
            </summary>
            <div className="project-review-body">
              <dl>
                <div><dt>현재</dt><dd><ReviewText text={item.observation} /></dd></div>
                <div><dt>문제</dt><dd><ReviewText text={item.impact} /></dd></div>
                <div><dt>보완할 부분</dt><dd><ReviewText text={item.proposal} /></dd></div>
                <div><dt>확인 방법</dt><dd><ReviewText text={item.verification} /></dd></div>
              </dl>
              {item.references?.length > 0 && (
                <ul className="project-review-references" aria-label={`${item.title} 검토 근거`}>
                  {item.references.map(reference => <li key={reference.href}>{reference.href.startsWith('/')
                    ? <Link to={reference.href}>{reference.label}</Link>
                    : <a href={reference.href}>{reference.label}</a>}</li>)}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
