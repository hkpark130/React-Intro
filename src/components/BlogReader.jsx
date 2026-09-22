import React, { useEffect, useRef, useState } from 'react';
import MarkdownRenderer from './markdown/MarkdownRenderer';

export default function BlogReader({ content }) {
  const articleRef = useRef(null);
  const [headings, setHeadings] = useState([]);
  const [tocExpanded, setTocExpanded] = useState(false);

  useEffect(() => {
    // 렌더된 heading을 사용해 파서의 실제 slug와 접힌 내용의 링크를 보존한다.
    const elements = [...articleRef.current.querySelectorAll('h1, h2, h3')];
    const used = new Set();
    setHeadings(elements.map((element, index) => {
      if (!element.id || used.has(element.id)) element.id = `article-section-${index + 1}`;
      used.add(element.id);
      return { id: element.id, text: element.textContent, level: element.tagName, element };
    }));
  }, [content]);

  const revealHeading = heading => {
    let parent = heading.element.parentElement;
    while (parent && parent !== articleRef.current) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
  };
  return (
    <div className="blog-reader-layout">
      {headings.length > 1 && (
        <aside className="blog-reader-aside">
          <div className="blog-toc" data-expanded={tocExpanded}>
            <p>이 글의 목차</p>
            <button type="button" className="blog-toc-toggle" aria-expanded={tocExpanded} aria-controls="article-toc-links" onClick={() => setTocExpanded(value => !value)}>
              이 글의 목차 <span aria-hidden="true">{tocExpanded ? '−' : '+'}</span>
            </button>
            <nav id="article-toc-links" aria-label="이 글의 목차">
              <ol>{headings.map(heading => (
                <li key={heading.id} className={heading.level === 'H3' ? 'blog-toc-child' : undefined}>
                  <a href={`#${encodeURIComponent(heading.id)}`} onClick={() => revealHeading(heading)}>{heading.text}</a>
                </li>
              ))}</ol>
              <a className="blog-toc-top" href="#article-top">맨 위로</a>
            </nav>
          </div>
        </aside>
      )}
      <div className="blog-reader-content" ref={articleRef}><MarkdownRenderer content={content} /></div>
    </div>
  );
}
