// Keeps the toolbar icon in sync with the on/off setting and handles the
// keyboard shortcut (Alt+Shift+S by default).

const DEFAULTS = { enabled: true, redirect: true };
const iconSet = (state) => Object.fromEntries(
  [16, 32, 48, 128].map((size) => [size, `icons/${state}-${size}.png`])
);

async function refreshIcon() {
  const { enabled } = await chrome.storage.sync.get(DEFAULTS);
  await chrome.action.setIcon({ path: iconSet(enabled ? 'on' : 'off') });
  await chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
  await chrome.action.setBadgeText({ text: enabled ? '' : 'OFF' });
  await chrome.action.setTitle({ title: `Shorts Blocker: ${enabled ? 'ON' : 'OFF'}` });
}

chrome.runtime.onInstalled.addListener(async () => {
  // Write defaults for any setting that isn't saved yet.
  await chrome.storage.sync.set(await chrome.storage.sync.get(DEFAULTS));
  refreshIcon();
});
chrome.runtime.onStartup.addListener(refreshIcon);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && 'enabled' in changes) refreshIcon();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-blocking') return;
  const { enabled } = await chrome.storage.sync.get(DEFAULTS);
  await chrome.storage.sync.set({ enabled: !enabled });
});
