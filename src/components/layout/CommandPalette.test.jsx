import { describe, it, expect } from 'vitest';
import { filterItems } from './CommandPalette';

const items = [
  { label: 'Home', group: 'Navigate' },
  { label: 'Projects', group: 'Navigate' },
  { label: 'Kredis', group: 'Projects' },
  { label: 'Spring Blog', group: 'Projects' },
];

describe('CommandPalette filterItems', () => {
  it('returns all when query empty', () => {
    expect(filterItems(items, '')).toEqual(items);
  });

  it('filters case-insensitive substring match', () => {
    const result = filterItems(items, 'spring');
    expect(result.map((x) => x.label)).toEqual(['Spring Blog']);
  });

  it('returns empty when no match', () => {
    expect(filterItems(items, 'xyz')).toEqual([]);
  });
});
