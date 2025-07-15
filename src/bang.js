/**
 * Constants
 */
const APP_NSPACE = 'unbang';
const STORE_KEY = `${APP_NSPACE}:bangs`;
const VERSION_KEY = `${APP_NSPACE}:bangsVersion`;
const MAX_BANG_LEN = 30;
const MAX_DOMAIN_LEN = 300;
const MAX_URL_LEN = 1536;
const MAX_RAW_LEN = 5 * 1024 * 1024; // 5 MB

/**
 * Replace this block:
 *
 * const modules = import.meta.glob('./bangs/*.json', {
 *   eager: true,
 *   import: 'default'
 * });
 * export const allBangs = Object.values(modules);
 *
 * with a direct import of your generated bundle:
 */
import allBangs from './bangs.json';
export { allBangs, isValidBang, getCachedBangs };

/**
 * @description Check if the item is a valid bang object
 * 
 * @param {object} item 
 * @returns {boolean}
 */
function isValidBang(item) {
	if (!item || typeof item !== 'object') return false;
	const { bang, domain, url } = /** @type {any} */(item);
	if (typeof bang !== 'string' || typeof domain !== 'string' || typeof url !== 'string') {
		console.error('Invalid bang:', item);
		return false;
	}
	if (bang.length > MAX_BANG_LEN) {
		console.error('Bang too long:', bang);
		return false;
	}
	if (domain.length > MAX_DOMAIN_LEN) {
		console.error('Domain too long:', domain);
		return false;
	}
	if (url.length > MAX_URL_LEN) {
		console.error('URL too long:', url);
		return false;
	}
	if (!url.includes('%s')) {
		console.error('URL must contain %s placeholder:', url);
		return false;
	}

	try {
		const u = new URL(url);
		// if (!ALLOWED_PROTOCOLS.includes(u.protocol)) return false;

		// allow domain to be either a full URL or just a host
		const domainHost = domain.includes('://')
			? new URL(domain).host
			: domain;
		if (u.host !== domainHost) {
			console.error('URL host does not match domain:', { url: u.host, domain: domainHost });
			return false;
		}
	} catch {
		console.error('Invalid URL:', url);
		return false;
	}

	return true;
}

/**
 * Check if the data is a valid array of bang objects
 * 
 * @param {object} data 
 * @returns {boolean}
 */

function isBangArray(data) {
	return Array.isArray(data) && data.every(isValidBang);
}

/**
 * Caches the bangs in localStorage
 * 
 */
; (function cacheBangs() {
	// 1) bail if there's no localStorage (SSR / private mode)
	if (typeof localStorage === 'undefined') {
		console.warn('⚠️ localStorage is not available, skipping cacheBangs.');
		return;
	}

	const prev = localStorage.getItem(VERSION_KEY);
	if (prev === __APP_VERSION__) return;

	try {
		// slim ▸ only bang, url, domain
		const slimmed = allBangs.map(({ bang, url, domain }) => ({ bang, url, domain }));
		const serialized = JSON.stringify(slimmed);

		if (serialized.length <= MAX_RAW_LEN) {
			localStorage.setItem(STORE_KEY, serialized);
			localStorage.setItem(VERSION_KEY, __APP_VERSION__);
		} else {
			console.warn(`⚠️ Bangs too large to cache (${serialized.length} bytes), skipping.`);
		}
	} catch (err) {
		console.error('⚠️ Failed to cache bangs:', err);
	}
})();


/**
 * Type definitions
 * 
 * @typedef {Object} Bang
 * @property {string} bang
 * @property {string} domain
 * @property {string} url
 * @property {string} description
 * @property {string} category
 * @property {string} subcategory
 */

/**
 * Get cached bangs from localStorage
 * 
 * @returns {Bang[]}
 */
export function getCachedBangs() {
	// 2) bail if there's no localStorage
	if (typeof localStorage === 'undefined') {
		console.warn('⚠️ localStorage is not available, using uncached bangs.');
		return allBangs;
	}

	try {
		const localBangs = localStorage.getItem(STORE_KEY);
		if (!localBangs || localBangs.length > MAX_RAW_LEN) throw new Error('Invalid cache');

		const parsedLocalBangs = JSON.parse(localBangs);
		if (!isBangArray(parsedLocalBangs)) throw new Error('Bad format');
		return parsedLocalBangs.map(item => ({
			bang: item.bang,
			domain: item.domain,
			url: item.url,
		}));
	} catch (err) {
		console.error('⚠️ Could not load cached bangs, using defaults:', err);
		return allBangs;
	}
}