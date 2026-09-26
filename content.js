// Runs on every YouTube page. The actual hiding is done by hide-shorts.css;
// this script switches it on/off, hides things CSS can't match by itself,
// and sends /shorts/ pages to the regular video player.

const DEFAULTS = { enabled: true, redirect: true };
const ON_ATTR = 'data-shorts-blocker';
const HIDE_ATTR = 'data-shorts-blocker-hide';
// Elements that can only be recognised by their label text ("Shorts").
const TEXT_ONLY_CANDIDATES = 'yt-chip-cloud-chip-renderer, ytm-chip-cloud-chip-renderer, tp-yt-paper-tab';

const root = document.documentElement;
let settings = { ...DEFAULTS };

// Assume "on" until storage answers, so Shorts never flash on screen.
root.setAttribute(ON_ATTR, 'on');

chrome.storage.sync.get(DEFAULTS).then((stored) => {
  settings = stored;
  apply();
});

// Fires when the popup, options page or keyboard shortcut changes a setting.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync') return;
  for (const [key, { newValue }] of Object.entries(changes)) settings[key] = newValue;
  apply();
});

function apply() {
  if (!settings.enabled) {
    root.removeAttribute(ON_ATTR);
    return;
  }
  root.setAttribute(ON_ATTR, 'on');
  markTextOnlyItems();
  redirectShortsPage();
}

function markTextOnlyItems() {
  for (const el of document.querySelectorAll(TEXT_ONLY_CANDIDATES)) {
    const isShorts = el.textContent.trim() === 'Shorts';
    if (el.hasAttribute(HIDE_ATTR) !== isShorts) el.toggleAttribute(HIDE_ATTR, isShorts);
  }
}

// "/shorts/VIDEO_ID" -> "/watch?v=VIDEO_ID"
function watchPathFor(pathname) {
  const match = pathname.match(/^\/shorts\/([\w-]+)/);
  return match ? `/watch?v=${match[1]}` : null;
}

function redirectShortsPage() {
  if (!settings.redirect) return;
  const target = watchPathFor(location.pathname);
  if (target) location.replace(target);
}

// Any Shorts link that is still on screen (a comment, a description...)
// opens in the normal player instead of the Shorts player.
document.addEventListener('click', (event) => {
  if (!settings.enabled || !settings.redirect) return;
  // Let ctrl/cmd/shift-clicks open a new tab; that tab gets redirected on load.
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href*="/shorts/"]');
  if (!link) return;
  const url = new URL(link.href, location.href);
  const target = url.hostname.endsWith('youtube.com') && watchPathFor(url.pathname);
  if (!target) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  location.assign(target);
}, true);

// YouTube is a single-page app: it swaps content without reloading.
// Re-check after its own navigation events...
document.addEventListener('yt-navigate-finish', apply);
window.addEventListener('popstate', apply);

// ...and, as a catch-all (m.youtube.com, lazy-loaded rows), whenever the page
// adds new elements. Throttled so it runs at most every 250 ms.
let pending = false;
new MutationObserver(() => {
  if (pending || !settings.enabled) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    markTextOnlyItems();
    redirectShortsPage();
  }, 250);
}).observe(root, { childList: true, subtree: true });
