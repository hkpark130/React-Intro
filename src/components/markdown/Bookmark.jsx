import { sanitizeMarkdownUrl } from './urlPolicy';
import './bookmark.css';

// Reading a saved article never triggers server-side crawling or favicon requests.
export default function Bookmark({ url, title, description, imageUrl }) {
  const href = sanitizeMarkdownUrl(url);
  const external = /^https?:\/\//i.test(href);
  const source = external ? new URL(href).hostname : href.startsWith('mailto:') ? href.slice(7) : href;
  const media = href ? sanitizeMarkdownUrl(imageUrl, { kind: 'media' }) : '';
  const thumbnail = import.meta.env.MODE === 'editorial' && /^https?:\/\//i.test(media) ? '' : media;
  const Card = href ? 'a' : 'div';
  return <Card className={'markdown-bookmark' + (href ? '' : ' markdown-bookmark-invalid')}
    href={href || undefined} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
    <div className="markdown-bookmark-content">
      <span className="markdown-bookmark-source">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m10 13 4-4m-6 7-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 10a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-1 1" transform="translate(1 -1) scale(.9)" /></svg>
        {source || '링크 주소 확인'}
      </span>
      <strong>{title || source || '링크 주소를 확인해 주세요.'}</strong>
      {description && <p>{description}</p>}
    </div>
    {thumbnail && <img src={thumbnail} alt="" loading="lazy" decoding="async" />}
    {href && <span className="markdown-bookmark-arrow" aria-hidden="true">↗</span>}
  </Card>;
}
