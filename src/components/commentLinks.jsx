import React from 'react';
import { sanitizeMarkdownUrl } from './markdown/urlPolicy';

// 댓글은 익명 사용자도 쓸 수 있는 입력이다. 본문을 HTML로 해석하지 않고
// 주소로 보이는 조각만 잘라 React 요소로 바꾼다. 나머지는 문자열 그대로 두어
// React가 이스케이프하게 한다.
const ADDRESS = /https?:\/\/[^\s<>"']+/gi;

// 문장 끝에 붙은 문장부호는 주소에서 뺀다. 괄호는 짝이 맞을 때만 남긴다.
const TRAILING = /[.,;:!?…]+$/;

function trimAddress(candidate) {
  let address = candidate.replace(TRAILING, '');
  while (address.endsWith(')') || address.endsWith(']')) {
    const open = address.endsWith(')') ? '(' : '[';
    const close = address.slice(-1);
    const opened = address.split(open).length - 1;
    const closed = address.split(close).length - 1;
    if (opened >= closed) break;
    address = address.slice(0, -1).replace(TRAILING, '');
  }
  return address;
}

/**
 * 댓글 본문을 렌더링 가능한 조각 배열로 바꾼다.
 * @param {unknown} text 댓글 원문
 * @returns {Array<string|React.ReactElement>} 문자열과 링크 요소가 섞인 배열
 */
export function linkifyComment(text) {
  if (typeof text !== 'string' || !text) return [];

  const pieces = [];
  let cursor = 0;
  for (const match of text.matchAll(ADDRESS)) {
    const raw = match[0];
    const address = trimAddress(raw);
    const href = sanitizeMarkdownUrl(address, { kind: 'link', allowRelative: false });
    if (!href) continue;

    if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
    pieces.push(
      // 새 탭으로 열되 opener를 넘기지 않는다.
      <a key={`${match.index}-${href}`} href={href} target="_blank" rel="noopener noreferrer">{address}</a>,
    );
    cursor = match.index + address.length;
  }
  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}
