# Shorts Blocker

A Manifest V3 extension for Chromium browsers (Chrome, Brave, Edge, Arc, Vivaldi, Opera)
that hides YouTube Shorts on search, home, subscriptions, the sidebar, channel pages,
the watch page and m.youtube.com.

## Install (unpacked)

1. Open `chrome://extensions` (Brave: `brave://extensions`, Edge: `edge://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and pick this folder.
4. Pin it: puzzle-piece icon in the toolbar → pin **Shorts Blocker**.

## Use

- Click the toolbar icon to switch blocking on/off (applies instantly, no reload).
- **Alt+Shift+S** toggles it too (change at `chrome://extensions/shortcuts`).
- When off, the icon turns gray and shows an `OFF` badge.

## Files

| File | Role |
| --- | --- |
| `manifest.json` | Declares permissions, the popup, the shortcut and which pages get the scripts |
| `hide-shorts.css` | The selectors that hide Shorts. **Edit this when YouTube changes its layout.** |
| `content.js` | Runs on YouTube: turns the CSS on/off, hides the "Shorts" filter chip, redirects `/shorts/` URLs |
| `background.js` | Updates the toolbar icon/badge and handles the keyboard shortcut |
| `popup.html/.css/.js` | The toolbar popup (also used as the Options page) |

After editing any file, press the ↻ reload button on the extension's card in
`chrome://extensions`, then refresh YouTube.
