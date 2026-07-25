import { describe, it, expect } from 'vitest';
import { sortNewestFirst, assignTimelineSides } from './ordering';

describe('sortNewestFirst', () => {
  it('orders ISO-ish dates newest first', () => {
    const out = sortNewestFirst(
      [{ d: '2024-08-01' }, { d: '2026-01-01' }, { d: '2025-06-01' }],
      x => x.d
    );
    expect(out.map(x => x.d)).toEqual(['2026-01-01', '2025-06-01', '2024-08-01']);
  });
});

describe('assignTimelineSides', () => {
  it('starts right and alternates', () => {
    const out = assignTimelineSides([{ n: 1 }, { n: 2 }, { n: 3 }]);
    expect(out.map(x => x.side)).toEqual(['right', 'left', 'right']);
  });
});
