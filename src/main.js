import { getCachedBangs, allBangs as fullBangs } from "./bang.js";
// pull our already-cached JSON bundle
const bangs = getCachedBangs();

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find(b => b.bang === LS_DEFAULT_BANG) || bangs[0];

function getBangredirectUrl(queryFromInput) {
        const url = new URL(window.location.href);
        const query = typeof queryFromInput === "string"
                ? queryFromInput.trim()
                : (url.searchParams.get("q") || "").trim();
        if (!query) return null;

	const match = query.match(/!(\S+)/i);
	const bangCandidate = match?.[1]?.toLowerCase();
	const selectedBang = bangs.find(b => b.bang === bangCandidate) || defaultBang;
	const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

	// if only bang (e.g. "!gh")
	if (!cleanQuery) {
        return selectedBang ? new URL(selectedBang.url).origin : null;
	}

	// build search URL
	const encoded = encodeURIComponent(cleanQuery).replace(/%2F/g, "/");
	return selectedBang.url.replace("%s", encoded);
}

function doRedirect(query) {
	const searchUrl = getBangredirectUrl(query);
	if (searchUrl) {
			window.location.replace(searchUrl);
	}
}

// Wire up the copy button on initial load
document.addEventListener("DOMContentLoaded", () => {
	const inputButton = document.getElementById("button-input");
	const buttonIcon = document.getElementById("button-icon");
	const urlInput = document.getElementById("input-search-url");

	const customUrl = `${window.location.origin}?q=%s`;

	function updateButton() {
			const searching = urlInput.value.trim().length > 0;
			inputButton.dataset.mode = searching ? "search" : "copy";
			buttonIcon.src = searching ? "/img/search.svg" : "/img/clipboard.svg";
	}

	if ( urlInput ) {
		urlInput.placeholder = `Search here or click to copy ${customUrl}`;
		urlInput.addEventListener("input", updateButton);
	}

	if (inputButton) {
		inputButton.addEventListener("click", async () => {
				if (inputButton.dataset.mode === "copy") {
						await navigator.clipboard.writeText(customUrl);
						buttonIcon.src = "/img/clipboard-check.svg";
						setTimeout(updateButton, 2000);
				} else {
						doRedirect(urlInput.value);
				}
		});
	}

	if ( urlInput ) {
		urlInput.addEventListener("keydown", e => {
				if (e.key === "Enter" && urlInput.value.trim()) {
						doRedirect(urlInput.value);
				}
		});
	}

	// perform bang‐redirect if there's a query in the URL
	doRedirect();

	const filterInput = document.getElementById("bang-filter-input");
	if (filterInput) {
		const filterButton = document.getElementById("button-bang-filter");
		const tableBody = document.querySelector("#bang-table tbody");
		function renderTable(filter = "") {
			const f = filter.trim().toLowerCase();
			const rows = fullBangs
				.filter(b => b.bang.toLowerCase().includes(f) || b.domain.toLowerCase().includes(f) || (b.description && b.description.toLowerCase().includes(f)))
				.map(b => `<tr><td>!${b.bang}</td><td>${b.domain}</td><td>${b.description||''}</td></tr>`)
				.join('');
			tableBody.innerHTML = rows;
		}
		filterInput.addEventListener("input", () => renderTable(filterInput.value));	
		renderTable();
	}

	// Suggestion modal for bangs (on index.html)
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