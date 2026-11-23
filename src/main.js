import "@fontsource-variable/inter";

// Bangs importing
import { getCachedBangs, allBangs as fullBangs } from "./bang.js";

export { getBangredirectUrl };

// pull our already-cached JSON bundle
const cachedBangs = getCachedBangs();
const bangs = cachedBangs.length ? cachedBangs : fullBangs;

let defaultBangCode = 'g';
try {
	defaultBangCode = localStorage.getItem('default-bang') ?? defaultBangCode;
} catch {
	// Use the built-in default when browser storage is blocked.
}
const defaultBang = bangs.find(b => b.bang === defaultBangCode) || bangs[0];

// Refactored bang redirection functions
const getBangredirectUrl = (queryFromInput) => {
	const currentUrl = new URL(location.href);
	const raw = typeof queryFromInput === 'string'
		? queryFromInput.trim()
		: (currentUrl.searchParams.get('q') || '').trim();
	if (!raw) return null;

	const [, bangCandidate] = /!(\S+)/i.exec(raw) || [];
	const selected = bangs.find(b => b.bang === bangCandidate?.toLowerCase()) || defaultBang;
	const clean = raw.replace(/!\S+\s*/i, '').trim();

	if (!clean) {
		return selected?.url ? new URL(selected.url).origin : null;
	}
	const encoded = encodeURIComponent(clean).replace(/%2F/g, '/');
	return selected.url.replace('%s', encoded);
};

const doRedirect = (query) => {
	const target = getBangredirectUrl(query);
	if (target) location.replace(target);
}

const renderPills = (container, bangs) => {
	const fragment = document.createDocumentFragment();
	for (const { description = '', bang, category = '', domain } of bangs) {
		const pill = document.createElement('div');
		pill.className = 'bang-pill';
		pill.dataset.bang = bang;
		for (const [className, value] of Object.entries({ description, bang: `!${bang}`, category, domain })) {
			const field = document.createElement('div');
			field.className = className;
			field.textContent = value;
			pill.append(field);
		}
		fragment.append(pill);
	}
	container.replaceChildren(fragment);
};

// Wire up the copy button on initial load
document.addEventListener('DOMContentLoaded', () => {
	const inputButton = document.getElementById('button-input');
	const urlInput = document.getElementById('input-search-url');
	const icons = {
		unclicked: document.querySelector('.icon-unclicked'),
		clicked: document.querySelector('.icon-clicked'),
		search: document.querySelector('.icon-search')
	};
	const customUrl = `${location.origin}?q=%s`;

	// Copy/search button logic
	if (inputButton && urlInput) {
		const updateButton = () => {
			const searching = urlInput.value.trim().length > 0;
			inputButton.dataset.mode = searching ? 'search' : 'copy';

			icons.unclicked.classList.toggle('display-inline', !searching);
			icons.unclicked.classList.toggle('hidden', searching);
			icons.search.classList.toggle('display-inline', searching);
			icons.search.classList.toggle('hidden', !searching);
			icons.clicked.classList.replace('display-inline', 'hidden');

			// ← Add this line to toggle aria-label
			inputButton.setAttribute('aria-label', searching ? 'Search' : 'Copy shareable URL');
		};

		urlInput.placeholder = `Search here or click to copy ${customUrl}`;
		urlInput.addEventListener('input', updateButton);
		urlInput.addEventListener('keydown', e => {
			if (e.key === 'Enter' && urlInput.value.trim()) doRedirect(urlInput.value);
		});

		// initialize button state on load
		updateButton();

		inputButton.addEventListener('click', async () => {
			if (inputButton.dataset.mode === 'copy') {
				await navigator.clipboard.writeText(customUrl);
				icons.clicked.classList.replace('hidden', 'display-inline');
				icons.unclicked.classList.replace('display-inline', 'hidden');
				setTimeout(updateButton, 2000);
			} else {
				doRedirect(urlInput.value);
			}
		});

		// perform bang‐redirect if there's a query in the URL
		doRedirect();
	}

	// Filterable pills list (only on bangs page)
	const filterInput = document.getElementById("bang-filter-input");
	if (filterInput) {
		const bangList = document.getElementById("bang-list");
		const renderList = (filter = "") => {
			const f = filter.trim().toLowerCase();
			const items = fullBangs
				.filter(b => b.bang.toLowerCase().includes(f) || b.domain.toLowerCase().includes(f) || (b.description && b.description.toLowerCase().includes(f)));
			renderPills(bangList, items);
		};
		filterInput.addEventListener("input", () => renderList(filterInput.value));
		renderList();
	}

	// Suggestion modal for bangs (only on home page)
	const suggestionBox = document.getElementById("bang-suggestions");
	if (urlInput && suggestionBox) {
		const suggestionList = document.getElementById("suggestion-list");
		function updateSuggestions() {
			const val = urlInput.value;
			const m = val.match(/!(\S+)$/);
			if (!m) {
				suggestionBox.classList.add('hidden');
				return;
			}
			const filter = m[1].toLowerCase();
			const rank = bang => bang === filter ? 0 : bang.startsWith(filter) ? 1 : 2;
			const matches = fullBangs
				.filter(b => b.bang.startsWith(filter) || b.domain.toLowerCase().includes(filter) || (b.description && b.description.toLowerCase().includes(filter)))
				.sort((a, b) => rank(a.bang) - rank(b.bang))
				.slice(0, 10);
			renderPills(suggestionList, matches);
			if (matches.length) suggestionBox.classList.remove('hidden');
			else suggestionBox.classList.add('hidden');
		}
		urlInput.addEventListener('input', updateSuggestions);
		suggestionList.addEventListener('click', e => {
			const pill = e.target.closest('.bang-pill');
			if (pill && pill.dataset.bang) {
				urlInput.value = `!${pill.dataset.bang} `;
				suggestionBox.classList.add('hidden');
				urlInput.focus();
			}
		});
		document.addEventListener('click', e => {
			if (!suggestionBox.contains(e.target) && e.target !== urlInput) {
				suggestionBox.classList.add('hidden');
			}
		});
	}
});
