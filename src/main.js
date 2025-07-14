// Font importing 
import "@fontsource/inter/400.css"; // Regular
import "@fontsource/inter/600.css"; // Semi-Bold
import "@fontsource/inter/700.css"; // Bold

// Bangs importing
import { getCachedBangs, allBangs as fullBangs } from "./bang.js";

// pull our already-cached JSON bundle
const bangs = getCachedBangs();

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find(b => b.bang === LS_DEFAULT_BANG) || bangs[0];

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

const pillRender = ({ description = '', bang, category = '', domain }) => `
<div class="bang-pill">
  <div class="description">${description}</div>
  <div class="bang">!${bang}</div>
  <div class="category">${category}</div>
  <div class="domain">${domain}</div>
</div>
`.trim();

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

  // Copy/search button logic (only on home page)
  if (inputButton && urlInput) {
    const updateButton = () => {
      const searching = urlInput.value.trim().length > 0;
      inputButton.dataset.mode = searching ? 'search' : 'copy';
      icons.unclicked.classList.toggle('display-inline', !searching);
      icons.unclicked.classList.toggle('hidden', searching);
      icons.search.classList.toggle('display-inline', searching);
      icons.search.classList.toggle('hidden', !searching);
      icons.clicked.classList.replace('display-inline', 'hidden');
    };

    urlInput.placeholder = `Search here or click to copy ${customUrl}`;
    urlInput.addEventListener('input', updateButton);
    urlInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && urlInput.value.trim()) doRedirect(urlInput.value);
    });

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
        .filter(b => b.bang.toLowerCase().includes(f) || b.domain.toLowerCase().includes(f) || (b.description && b.description.toLowerCase().includes(f)))
        .map(pillRender)
        .join('');
      bangList.innerHTML = items;
    };
    filterInput.addEventListener("input", () => renderList(filterInput.value));
    renderList();
  }

  // Suggestion modal for bangs (only on home page)
  const suggestionBox = document.getElementById("bang-suggestions");
  if (urlInput && suggestionBox) {
    const suggestionBody = document.querySelector("#suggestion-table tbody");
    function updateSuggestions() {
      const val = urlInput.value;
      const m = val.match(/!(\w*)$/);
      if (!m) {
        suggestionBox.classList.add('hidden');
        return;
      }
      const filter = m[1].toLowerCase();
      const matches = fullBangs
        .filter(b => b.bang.startsWith(filter) || b.domain.toLowerCase().includes(filter) || (b.description && b.description.toLowerCase().includes(filter)))
        .slice(0, 10);
      suggestionBody.innerHTML = matches
        .map(b => `<tr data-bang="${b.bang}"><td>!${b.bang}</td><td>${b.domain}</td><td>${b.description||''}</td></tr>`)
        .join('');
      if (matches.length) suggestionBox.classList.remove('hidden');
      else suggestionBox.classList.add('hidden');
    }
    urlInput.addEventListener('input', updateSuggestions);
    suggestionBody.addEventListener('click', e => {
      const tr = e.target.closest('tr');
      if (tr && tr.dataset.bang) {
        urlInput.value = `!${tr.dataset.bang} `;
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