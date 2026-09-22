import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import { normalizeSelection } from './editorCommands';

const MAX_STEPS = 100;
const GROUP_DELAY = 900;
const snapshot = element => ({ value: element.value, start: element.selectionStart, end: element.selectionEnd, direction: element.selectionDirection || 'none', scrollTop: element.scrollTop });

/** One history for native input, composition, toolbar edits and imports. */
export default function useEditorHistory(value, onChange) {
  const textareaRef = useRef(null);
  const history = useRef({ current: { value, start: 0, end: 0, direction: 'none', scrollTop: 0 }, past: [], future: [] });
  const lastInput = useRef(null);
  const beforeInput = useRef(null);
  const composition = useRef(null);
  const pendingRestore = useRef(null);
  const changeCallback = useRef(onChange);
  const [isComposing, setIsComposing] = useState(false);
  const [revision, redraw] = useReducer(number => number + 1, 0);

  useLayoutEffect(() => { changeCallback.current = onChange; }, [onChange]);

  const restoreSelection = useCallback((selection = history.current.current, focus = true) => {
    const element = textareaRef.current;
    if (!element) return;
    if (element.value !== selection.value) {
      pendingRestore.current = selection;
      return;
    }
    const range = normalizeSelection(element.value, selection);
    if (focus) element.focus({ preventScroll: true });
    element.setSelectionRange(range.start, range.end, range.direction);
    element.scrollTop = selection.scrollTop ?? element.scrollTop;
  }, []);

  useLayoutEffect(() => {
    if (value !== history.current.current.value) {
      history.current = { current: { value, start: 0, end: 0, direction: 'none', scrollTop: 0 }, past: [], future: [] };
      lastInput.current = null;
      beforeInput.current = null;
      composition.current = null;
      pendingRestore.current = null;
      setIsComposing(false);
      redraw();
    }
    if (pendingRestore.current && textareaRef.current?.value === pendingRestore.current.value) {
      restoreSelection(pendingRestore.current);
      pendingRestore.current = null;
    }
  }, [value, revision, restoreSelection]);

  const captureSelection = useCallback(() => {
    const element = textareaRef.current;
    if (!element) return history.current.current;
    const next = snapshot(element);
    const current = history.current.current;
    if (next.value === current.value) {
      if (next.start !== current.start || next.end !== current.end) lastInput.current = null;
      history.current.current = next;
    }
    return next;
  }, []);

  const record = useCallback((before, after, inputType = 'command', restore = false) => {
    const state = history.current;
    if (before.value === after.value) { state.current = after; return; }
    const now = Date.now();
    const groupedInput = ['insertText', 'deleteContentBackward', 'deleteContentForward'].includes(inputType);
    const previous = lastInput.current;
    const merge = groupedInput && previous?.type === inputType && now - previous.time < GROUP_DELAY && before.start === before.end && previous.after.start === before.start && previous.after.end === before.end && previous.after.value === before.value;
    if (!merge) state.past = [...state.past.slice(-(MAX_STEPS - 1)), before];
    state.future = [];
    state.current = after;
    lastInput.current = groupedInput ? { type: inputType, time: now, after } : null;
    beforeInput.current = null;
    if (restore) pendingRestore.current = after;
    changeCallback.current(after.value);
    redraw();
  }, []);

  const commit = useCallback(result => {
    if (composition.current) return;
    const before = captureSelection();
    record(before, { ...before, ...result }, 'command', true);
  }, [captureSelection, record]);

  const moveHistory = useCallback(direction => {
    if (composition.current) return;
    const state = history.current;
    const from = direction === 'undo' ? state.past : state.future;
    if (!from.length) return;
    const observed = captureSelection();
    const before = observed.value === state.current.value ? observed : state.current;
    const next = from.pop();
    if (direction === 'undo') state.future.push(before);
    else state.past.push(before);
    state.current = next;
    lastInput.current = null;
    beforeInput.current = null;
    pendingRestore.current = next;
    changeCallback.current(next.value);
    redraw();
  }, [captureSelection]);

  // Native beforeinput also covers Edit-menu undo and mobile input methods.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    const handle = event => {
      if (composition.current || event.isComposing) return;
      if (['historyUndo', 'historyRedo'].includes(event.inputType)) {
        if (event.cancelable) { event.preventDefault(); moveHistory(event.inputType === 'historyUndo' ? 'undo' : 'redo'); }
      } else beforeInput.current = snapshot(element);
    };
    element.addEventListener('beforeinput', handle);
    return () => element.removeEventListener('beforeinput', handle);
  }, [moveHistory]);

  const handleChange = useCallback(event => {
    const after = snapshot(event.currentTarget);
    const inputType = event.nativeEvent.inputType || 'insertText';
    if (['historyUndo', 'historyRedo'].includes(inputType) && !composition.current) {
      moveHistory(inputType === 'historyUndo' ? 'undo' : 'redo');
      return;
    }
    if (composition.current || event.nativeEvent.isComposing) {
      composition.current ||= { ...history.current.current };
      history.current.current = after;
      changeCallback.current(after.value);
      return;
    }
    const before = beforeInput.current?.value === history.current.current.value ? beforeInput.current : history.current.current;
    record(before, after, inputType);
  }, [moveHistory, record]);

  const handleCompositionStart = useCallback(() => {
    composition.current = captureSelection();
    beforeInput.current = null;
    lastInput.current = null;
    setIsComposing(true);
  }, [captureSelection]);

  const handleCompositionEnd = useCallback(event => {
    const before = composition.current;
    composition.current = null;
    setIsComposing(false);
    if (before) record(before, snapshot(event.currentTarget), 'composition');
  }, [record]);

  const handleHistoryKey = useCallback(event => {
    if (composition.current || event.nativeEvent.isComposing || event.keyCode === 229) return false;
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return false;
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return false;
    event.preventDefault();
    moveHistory(key === 'y' || event.shiftKey ? 'redo' : 'undo');
    return true;
  }, [moveHistory]);

  return {
    textareaRef, captureSelection, restoreSelection, commit, handleChange,
    handleCompositionStart, handleCompositionEnd, handleHistoryKey,
    undo: () => moveHistory('undo'), redo: () => moveHistory('redo'),
    canUndo: history.current.past.length > 0, canRedo: history.current.future.length > 0, isComposing,
  };
}
