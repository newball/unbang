import { getCachedBangs } from "./bang.js";
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
	const copyButton = document.getElementById("button-input");
	const copyIcon = document.getElementById("button-icon");
	const urlInput = document.getElementById("search-url-input");

	const customUrl = `${window.location.origin}?q=%s`;
	urlInput.placeholder = `Search here or click to copy ${customUrl}`;

	function updateButton() {
			const searching = urlInput.value.trim().length > 0;
			copyButton.dataset.mode = searching ? "search" : "copy";
			copyIcon.src = searching ? "/img/search.svg" : "/img/clipboard.svg";
	}

	urlInput.addEventListener("input", updateButton);

	copyButton.addEventListener("click", async () => {
			if (copyButton.dataset.mode === "copy") {
					await navigator.clipboard.writeText(customUrl);
					copyIcon.src = "/img/clipboard-check.svg";
					setTimeout(updateButton, 2000);
			} else {
					doRedirect(urlInput.value);
			}
	});

	urlInput.addEventListener("keydown", e => {
			if (e.key === "Enter" && urlInput.value.trim()) {
					doRedirect(urlInput.value);
			}
	});

	// perform bang‐redirect if there's a query in the URL
	doRedirect();
});