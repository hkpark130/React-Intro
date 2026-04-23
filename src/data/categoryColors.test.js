import { describe, it, expect } from 'vitest';
import { getCategoryColor, DEFAULT_CATEGORY_COLOR } from './categoryColors';

describe('categoryColors', () => {
  it('returns mapped color for known category', () => {
    const work = getCategoryColor('Work Experience');
    expect(work.bg).toBeDefined();
    expect(work.fg).toBeDefined();
  });

  it('returns default for unknown category', () => {
    const unknown = getCategoryColor('NoSuchCategory');
    expect(unknown).toEqual(DEFAULT_CATEGORY_COLOR);
  });

  it('is deterministic — same category always same color', () => {
    expect(getCategoryColor('Kubernetes')).toBe(getCategoryColor('Kubernetes'));
  });
});
