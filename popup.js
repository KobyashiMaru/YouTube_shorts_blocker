const DEFAULTS = { enabled: true, redirect: true };
const toggles = {
  enabled: document.getElementById('enabled'),
  redirect: document.getElementById('redirect'),
};

function render(settings) {
  toggles.enabled.checked = settings.enabled;
  toggles.redirect.checked = settings.redirect;
  document.getElementById('redirect-row').classList.toggle('disabled', !settings.enabled);
  document.getElementById('status').textContent =
    settings.enabled ? 'Shorts are hidden' : 'Paused: Shorts are visible';
  document.getElementById('logo').src = `icons/${settings.enabled ? 'on' : 'off'}-48.png`;
}

chrome.storage.sync.get(DEFAULTS).then(render);

for (const [key, input] of Object.entries(toggles)) {
  input.addEventListener('change', () => chrome.storage.sync.set({ [key]: input.checked }));
}

// Keep the popup correct if the setting changes elsewhere (shortcut, other window).
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync') render(await chrome.storage.sync.get(DEFAULTS));
});

chrome.commands.getAll().then((commands) => {
  const toggle = commands.find((c) => c.name === 'toggle-blocking');
  if (toggle?.shortcut) document.getElementById('shortcut').textContent = toggle.shortcut;
});

document.getElementById('edit-shortcut').addEventListener('click', (event) => {
  event.preventDefault();
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
