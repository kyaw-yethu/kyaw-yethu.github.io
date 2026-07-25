export function sortNewestFirst<T>(items: T[], key: (t: T) => string): T[] {
  return [...items].sort(
    (a, b) => new Date(key(b)).getTime() - new Date(key(a)).getTime()
  );
}

export function assignTimelineSides<T>(items: T[]): Array<T & { side: 'left' | 'right' }> {
  return items.map((item, i) => ({ ...item, side: i % 2 === 0 ? 'right' : 'left' }));
}
