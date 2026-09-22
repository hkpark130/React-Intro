import { useId, useState } from 'react';
import './rag-vector-demo.css';

const DOCUMENTS = [
  { id: 'A', angle: 30, color: '#46658b' },
  { id: 'B', angle: 90, color: '#8a592f' },
  { id: 'C', angle: 150, color: '#795b88' },
];
const CENTER = 160;
const RADIUS = 120;
const EPSILON = 1e-12;
const DEMO_THRESHOLD = 0.8;

function unitVector(angle) {
  const radians = angle * Math.PI / 180;
  return { x: Math.cos(radians), y: Math.sin(radians) };
}

function point(angle, radius = RADIUS) {
  const vector = unitVector(angle);
  return { x: CENTER + vector.x * radius, y: CENTER - vector.y * radius };
}

function scoreText(value) {
  return (Math.abs(value) < 0.0005 ? 0 : value).toFixed(3);
}

function factorText(value) {
  const text = scoreText(value);
  return value < -0.0005 ? `(${text})` : text;
}

export default function RagVectorDemo() {
  const [angle, setAngle] = useState(45);
  const unique = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const sliderId = `rag-vector-angle-${unique}`;
  const captionId = `rag-vector-caption-${unique}`;
  const svgTitleId = `rag-vector-title-${unique}`;
  const svgDescriptionId = `rag-vector-description-${unique}`;
  const query = unitVector(angle);
  const queryPoint = point(angle);
  const scores = DOCUMENTS.map(document => {
    const vector = unitVector(document.angle);
    const dot = query.x * vector.x + query.y * vector.y;
    return { ...document, difference: Math.abs(angle - document.angle), score: Math.max(-1, Math.min(1, dot)) };
  }).sort((left, right) => Math.abs(left.score - right.score) < EPSILON
    ? left.id.localeCompare(right.id) : right.score - left.score);
  const best = scores[0];
  const bestVector = unitVector(best.angle);
  const arcStart = point(Math.min(angle, best.angle), 33);
  const arcEnd = point(Math.max(angle, best.angle), 33);
  const arcLabel = point((angle + best.angle) / 2, 48);
  const queryLabel = {
    x: CENTER + query.x * 88 + query.y * 15,
    y: CENTER - query.y * 88 + query.x * 15,
  };

  return <figure className="rag-vector-demo" aria-labelledby={captionId}>
    <figcaption id={captionId}>
      2차원 원리 예시이며 실제 768차원 임베딩을 그린 것은 아닙니다.
      이 예시에서는 유사도 {DEMO_THRESHOLD.toFixed(2)} 이상을 추천합니다. 실제 검색은 키워드 등도 함께 확인합니다.
    </figcaption>
    <div className="rag-vector-demo-body">
      <svg className="rag-vector-plot" viewBox="0 0 320 320" role="img" aria-labelledby={`${svgTitleId} ${svgDescriptionId}`}>
        <title id={svgTitleId}>질문과 문서 벡터의 방향</title>
        <desc id={svgDescriptionId}>
          모든 벡터는 원점에서 시작하며 길이가 1입니다. 질문은 {angle}도, 문서 A는 30도, 문서 B는 90도, 문서 C는 150도입니다.
          현재 가장 높은 코사인 값은 문서 {best.id}의 {scoreText(best.score)}입니다.
        </desc>
        <defs>
          {DOCUMENTS.map(document => <marker key={document.id} id={`rag-arrow-${unique}-${document.id}`}
            markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L8 4 L0 8 Z" fill={document.color} />
          </marker>)}
          <marker id={`rag-arrow-${unique}-query`} markerWidth="11" markerHeight="10" refX="11" refY="5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L11 5 L0 10 Z" fill="#17685e" />
          </marker>
        </defs>
        <circle className="rag-vector-unit-circle" cx={CENTER} cy={CENTER} r={RADIUS} />
        <path className="rag-vector-axes" d="M20 160 H300 M160 20 V300" />
        {best.difference > 0 && <g>
          <path className="rag-vector-angle-area"
            d={`M${CENTER} ${CENTER} L${arcStart.x} ${arcStart.y} A33 33 0 0 0 ${arcEnd.x} ${arcEnd.y} Z`} />
          <text className="rag-vector-angle-symbol" x={arcLabel.x} y={arcLabel.y + 4} textAnchor="middle">각도</text>
        </g>}
        {DOCUMENTS.map(document => {
          const end = point(document.angle);
          const label = point(document.angle, 143);
          return <g key={document.id}>
            <line x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke={document.color}
              strokeWidth="2" strokeDasharray="5 4" markerEnd={`url(#rag-arrow-${unique}-${document.id})`} />
            <text className="rag-vector-document-label" x={label.x} y={label.y + 5} textAnchor="middle" fill={document.color}>{document.id}</text>
          </g>;
        })}
        <line className="rag-vector-query" x1={CENTER} y1={CENTER} x2={queryPoint.x} y2={queryPoint.y}
          markerEnd={`url(#rag-arrow-${unique}-query)`} />
        <circle cx={CENTER} cy={CENTER} r="3" fill="#192d2e" />
        <text className="rag-vector-origin" x={CENTER - 12} y={CENTER + 18}>0</text>
        <text className="rag-vector-query-label" x={queryLabel.x} y={queryLabel.y}
          textAnchor={query.x < -0.35 ? 'end' : 'start'}>질문</text>
        <text className="rag-vector-unit-label" x={CENTER} y="245" textAnchor="middle">모든 벡터 길이 = 1</text>
      </svg>
      <div className="rag-vector-controls">
        <div className="rag-vector-slider-heading">
          <label htmlFor={sliderId}>가정한 질문 방향</label>
          <span aria-hidden="true">{angle}°</span>
        </div>
        <input id={sliderId} className="rag-vector-slider" type="range" min="0" max="180" step="1"
          value={angle} onChange={event => setAngle(Number(event.target.value))} aria-valuetext={`${angle}도`}
          aria-describedby={captionId} />
        <div className="rag-vector-slider-ticks" aria-hidden="true"><span>0°</span><span>90°</span><span>180°</span></div>
        <p className="rag-vector-explanation">방향이 가까울수록 유사도가 높아집니다. 슬라이더로 방향을 바꿔 볼 수 있습니다.</p>
        <div className="rag-vector-score-heading" aria-hidden="true"><span>순위</span><span>문서</span><span>각도 차이</span><span>유사도</span><span>결과</span></div>
        <ol className="rag-vector-scores" aria-label="코사인 유사도 순위와 예시 추천 결과">
          {scores.map(document => {
            const rank = scores.findIndex(candidate => Math.abs(candidate.score - document.score) < EPSILON) + 1;
            const recommended = document.score >= DEMO_THRESHOLD;
            return <li key={document.id} data-document={document.id}>
              <span className="rag-vector-rank">{rank}위</span>
              <span className="rag-vector-document"><i aria-hidden="true" style={{ backgroundColor: document.color }} />문서 {document.id}</span>
              <span className="rag-vector-difference">{document.difference}°</span>
              <strong className="rag-vector-score">{scoreText(document.score)}</strong>
              <span className="rag-vector-result" data-recommended={recommended}>{recommended ? '추천' : '제외'}</span>
            </li>;
          })}
        </ol>
        <output className="rag-vector-formula" htmlFor={sliderId} aria-live="polite" aria-atomic="true">
          <span>문서 {best.id}와의 계산</span>
          <code className="rag-vector-coordinates">q = ({scoreText(query.x)}, {scoreText(query.y)})</code>
          <code className="rag-vector-coordinates">d<sub>{best.id}</sub> = ({scoreText(bestVector.x)}, {scoreText(bestVector.y)})</code>
          <code className="rag-vector-dot-calculation">
            <span>{factorText(query.x)} × {factorText(bestVector.x)}</span>
            <span>+ {factorText(query.y)} × {factorText(bestVector.y)}</span>
            <span>≈ {scoreText(best.score)}</span>
          </code>
          <code>q · d<sub>{best.id}</sub> = cos({best.difference}°) ≈ {scoreText(best.score)}</code>
        </output>
      </div>
    </div>
  </figure>;
}
