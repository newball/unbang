import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isValidBang, getCachedBangs, allBangs } from '../src/bang.js';

describe('isValidBang edge cases', () => {
	it('rejects null or undefined', () => {
		expect(isValidBang(null)).toBe(false);
		expect(isValidBang(undefined)).toBe(false);
	});

	it('rejects when missing required fields', () => {
		expect(isValidBang({})).toBe(false);
		expect(isValidBang({ bang: 'x' })).toBe(false);
		expect(isValidBang({ domain: 'example.com', url: 'https://example.com?q=%s' })).toBe(false);
	});

	it('rejects when bang is too long', () => {
		const longBang = 'a'.repeat(31);
		const b = { bang: longBang, domain: 'example.com', url: 'https://example.com/search?q=%s' };
		expect(isValidBang(b)).toBe(false);
	});

	it('rejects when domain is too long', () => {
		const longDomain = 'd'.repeat(301);
		const b = { bang: 'x', domain: longDomain, url: 'https://example.com/search?q=%s' };
		expect(isValidBang(b)).toBe(false);
	});

	it('rejects when url is too long', () => {
		const longPath = 'p'.repeat(1537);
		const b = { bang: 'x', domain: 'example.com', url: `https://example.com/${longPath}?q=%s` };
		expect(isValidBang(b)).toBe(false);
	});

	it('rejects invalid URL syntax', () => {
		const b = { bang: 'x', domain: 'example.com', url: 'not-a-url%s' };
		expect(isValidBang(b)).toBe(false);
	});

	it('rejects when URL host does not match domain', () => {
		const b = {
			bang: 'x',
			domain: 'example.com',
			url: 'https://other.com/search?q=%s'
		};
		expect(isValidBang(b)).toBe(false);
	});

	it('accepts when domain is host-only and matches URL host', () => {
		const b = {
			bang: 'x',
			domain: 'example.com',
			url: 'https://example.com/search?q=%s'
		};
		expect(isValidBang(b)).toBe(true);
	});

	it('accepts when domain is a full URL and matches URL host', () => {
		const b = {
			bang: 'x',
			domain: 'https://example.com',
			url: 'https://example.com/search?q=%s'
		};
		expect(isValidBang(b)).toBe(true);
	});
});

describe('getCachedBangs additional scenarios', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('falls back to defaults when stored value is null', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null)
		});
		const { getCachedBangs } = await import('../src/bang.js');
		expect(getCachedBangs()).toEqual(allBangs);
	});

	it('returns empty array when stored JSON is an empty array', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue('[]')
		});
		const { getCachedBangs } = await import('../src/bang.js');
		expect(getCachedBangs()).toEqual([]);
	});

	it('falls back when stored array contains invalid items', async () => {
		const badArray = JSON.stringify([
			{ bang: 'x', domain: 'example.com', url: 'https://example.com/search?q=%s' },
			{ bang: 123 } // invalid entry
		]);
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(badArray)
		});
		const { getCachedBangs } = await import('../src/bang.js');
		expect(getCachedBangs()).toEqual(allBangs);
	});

	it('falls back on parse error', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue('not json')
		});
		const { getCachedBangs } = await import('../src/bang.js');
		expect(getCachedBangs()).toEqual(allBangs);
	});
});