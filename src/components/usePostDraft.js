import { useCallback, useEffect, useRef, useState } from 'react';
import { clearDraft, draftKey, hasDraftContent, readDraft, sameDraft, writeDraft } from './postDraft';

/**
 * 편집기의 현재 내용을 저장소에 따라 쓰고, 이전에 남은 초안이 있으면 복구를 제안한다.
 * 제안 내용은 state에 복사해 두므로, 제안이 떠 있는 동안 계속 써도 복구본을 잃지 않는다.
 */
export function usePostDraft({ mode, id, post, baseline, ready }) {
  const key = draftKey(mode, id);
  const [offer, setOffer] = useState(null);
  const inspected = useRef(false);
  const unsaved = useRef(false);
  // 저장에 성공하면 이 화면에서는 더 이상 초안을 남기지 않는다.
  const released = useRef(false);

  useEffect(() => {
    if (!ready || inspected.current) return;
    inspected.current = true;
    const stored = readDraft(key);
    if (hasDraftContent(stored) && !sameDraft(stored, baseline)) setOffer(stored);
    else if (stored) clearDraft(key);
  }, [ready, key, baseline]);

  useEffect(() => {
    if (!ready || !inspected.current || released.current) return;
    if (sameDraft(post, baseline)) {
      unsaved.current = false;
      return;
    }
    unsaved.current = true;
    writeDraft(key, post);
  }, [ready, key, post, baseline]);

  // 저장하지 않은 내용이 있을 때만 이탈을 확인한다.
  useEffect(() => {
    const warn = event => {
      if (!unsaved.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const discard = useCallback(() => {
    setOffer(null);
    clearDraft(key);
  }, [key]);

  const release = useCallback(() => {
    released.current = true;
    unsaved.current = false;
    setOffer(null);
    clearDraft(key);
  }, [key]);

  return { offer, acceptOffer: () => setOffer(null), discardOffer: discard, releaseDraft: release };
}
