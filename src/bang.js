// load all of the bangs from the bangs directory
const modules = import.meta.glob('./bangs/*.json', { eager: true });
export const bangs = Object.values(modules)
  .map(m => m.default)
  .flat();

// add a version check to prevent reloading the bangs
const APP_NSPACE      = 'unbang';
const STORE_KEY       = `${APP_NSPACE}:bangs`;
const VERSION_KEY     = `${APP_NSPACE}:bangsVersion`;
const previousVersion = localStorage.getItem(VERSION_KEY);

// if the version has changed, update the bangs in localStorage
if (previousVersion !== __APP_VERSION__) {
  try {
    const serialized = JSON.stringify(bangs);
    localStorage.setItem(STORE_KEY, serialized);
    localStorage.setItem(VERSION_KEY, __APP_VERSION__);
  } catch (err) {
    console.error('⚠️ Failed to cache bangs:', err);
    // optionally fall back or notify user
  }
}

// @ts-check

/** 
 * @typedef {Object} Bang
 * @property {string} bang           // e.g. "@bsky"
 * @property {string} domain         // e.g. "https://bsky.app"
 * @property {string} url            // e.g. "https://bsky.app/profile/%s"
 * @property {string} description    // e.g. "BlueSky profile"
 * @property {string} category       // e.g. "Socal Media"
 * @property {string} subcategory    // e.g. "Profiles"
 */

// vulnerability guard constants
const MAX_BANG_LEN     = 30;
const MAX_DOMAIN_LEN   = 100;
const MAX_URL_LEN      = 300;
const MAX_DESC_LEN     = 300;
const MAX_CAT_LEN      = 50;
const MAX_SUBCAT_LEN   = 50;
const MAX_RAW_LEN      = 200 * 1024;  // 200 KB max cached JSON
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Checks if the data is an array of Bang objects.
 * @param {unknown} data
 * @returns {data is Bang[]}
 */
function isBangArray(data) {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every(item => {
    if (!item || typeof item !== 'object') return false;
    const {
      bang,
      domain,
      url,
      description,
      category,
      subcategory
    } = /** @type {any} */(item);

    // type checks
    if (
      typeof bang        !== 'string' ||
      typeof domain      !== 'string' ||
      typeof url         !== 'string' ||
      typeof description !== 'string' ||
      typeof category    !== 'string' ||
      typeof subcategory !== 'string'
    ) {
      return false;
    }

    // length limits
    if (
      bang.length        > MAX_BANG_LEN   ||
      domain.length      > MAX_DOMAIN_LEN ||
      url.length         > MAX_URL_LEN    ||
      description.length > MAX_DESC_LEN   ||
      category.length    > MAX_CAT_LEN    ||
      subcategory.length > MAX_SUBCAT_LEN
    ) {
      return false;
    }

    // must contain placeholder
    if (!url.includes('%s')) {
      return false;
    }

    // protocol, domain & host consistency
    try {
      const d = new URL(domain);
      const u = new URL(url);
      if (
        !ALLOWED_PROTOCOLS.includes(d.protocol) ||
        !ALLOWED_PROTOCOLS.includes(u.protocol) ||
        d.host !== u.host
      ) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  });
}

// read from cache
export const getCachedBangs = () => {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];                              // nothing cached
    if (raw.length > MAX_RAW_LEN) {
      throw new Error('Cached payload too large');
    }

    const parsed = JSON.parse(raw);
    if (!isBangArray(parsed)) {
      throw new Error('Bad format for cached bangs');
    }

    // sanitize to avoid proto-pollution / extra fields
    return parsed.map(item => ({
      bang:        item.bang,
      domain:      item.domain,
      url:         item.url,
      description: item.description,
      category:    item.category,
      subcategory: item.subcategory,
    }));
  } catch (err) {
    console.error('⚠️ Could not load cached bangs, using defaults:', err);
    return bangs;
  }
};