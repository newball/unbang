import { describe, it, expect, beforeEach } from 'vitest';
import { getBangredirectUrl } from '../src/main.js';

describe('getBangredirectUrl', () => {
  it('returns null on empty query', () => {
    expect(getBangredirectUrl('')).toBeNull();
  });

  it('replaces %s correctly for a known bang', () => {
    const url = getBangredirectUrl('!g hello world');
    expect(url).toContain(encodeURIComponent('hello world'));
    // default "g" bang should point at Google
    expect(url).toMatch(/google\.com/);
  });

  it('falls back to default bang on unknown bang', () => {
    const url = getBangredirectUrl('!nope something');
    expect(url).toContain(encodeURIComponent('something'));
    // should still use default
    expect(url).toMatch(/google\.com/);
  });
});