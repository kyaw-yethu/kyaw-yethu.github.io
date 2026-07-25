import { describe, it, expect } from 'vitest';
import { renderInline } from './inline';

describe('renderInline', () => {
  it('renders bold, italic, links', () => {
    expect(renderInline('a **b** c')).toBe('a <strong>b</strong> c');
    expect(renderInline('*x*')).toBe('<em>x</em>');
    expect(renderInline('[K](https://k)')).toBe('<a href="https://k">K</a>');
  });
  it('escapes stray angle brackets', () => {
    expect(renderInline('1 < 2')).toBe('1 &lt; 2');
  });
  it('escapes stray ampersands', () => {
    expect(renderInline('AT&T')).toBe('AT&amp;T');
  });
  it('preserves asterisks inside link URLs', () => {
    expect(renderInline('[w](http://x/*a*)')).toBe('<a href="http://x/*a*">w</a>');
  });
});
