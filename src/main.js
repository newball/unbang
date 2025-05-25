import { bangs } from "./bang.js";
const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find(b => b.bang === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = (url.searchParams.get("q") || "").trim();
  if (!query) return null;

  const match = query.match(/!(\S+)/i);
  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find(b => b.bang === bangCandidate) || defaultBang;
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // if only bang (e.g. "!gh")
  if (!cleanQuery) {
    return selectedBang ? `https://${selectedBang.domain}` : null;
  }

  // build search URL
  const encoded = encodeURIComponent(cleanQuery).replace(/%2F/g, "/");
  return selectedBang.url.replace("%s", encoded);
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (searchUrl) {
    window.location.replace(searchUrl);
  }
}

// Wire up the copy button on initial load
document.addEventListener("DOMContentLoaded", () => {
  const copyButton = document.querySelector(".copy-button");
  const copyIcon = copyButton.querySelector("img");
  const urlInput = document.getElementById("search-url-input");

  urlInput.value = `${window.location.origin}?q=%s`;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "/clipboard-check.svg";
    setTimeout(() => (copyIcon.src = "/clipboard.svg"), 2000);
  });

  // perform bang‐redirect if there's a query in the URL
  doRedirect();
});