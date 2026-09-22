// 작성 중인 글은 저장 전까지 React state에만 있다. 세션 만료·새로고침·탭 닫기로
// 원고가 사라지지 않도록 같은 내용을 브라우저에 한 벌 더 둔다.
const PREFIX = 'blog-draft';

export const draftKey = (mode, id) => (mode === 'edit' ? `${PREFIX}:edit:${id}` : `${PREFIX}:create`);

const normalize = value => (typeof value === 'string' ? value : '');

/** 제목·본문·카테고리만 비교한다. 저장 시각은 비교 대상이 아니다. */
export const sameDraft = (left, right) =>
  normalize(left?.title) === normalize(right?.title) &&
  normalize(left?.content) === normalize(right?.content) &&
  String(left?.categoryId ?? '') === String(right?.categoryId ?? '');

export const hasDraftContent = draft => Boolean(normalize(draft?.title).trim() || normalize(draft?.content).trim());

// 사생활 보호 모드나 용량 초과에서는 저장소 접근 자체가 예외를 던진다.
// 그때도 작성은 계속할 수 있어야 하므로 실패를 삼키고 초안만 포기한다.
export function readDraft(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (typeof draft?.title !== 'string' || typeof draft?.content !== 'string') return null;
    return draft;
  } catch {
    return null;
  }
}

export function writeDraft(key, draft) {
  try {
    window.localStorage.setItem(key, JSON.stringify({
      title: normalize(draft?.title),
      content: normalize(draft?.content),
      categoryId: draft?.categoryId ?? null,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // 초안을 남기지 못해도 편집은 막지 않는다.
  }
}

export function clearDraft(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 위와 같다.
  }
}
