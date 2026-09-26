# CLAUDE.md

Shorts Blocker: a Manifest V3 Chromium extension (Chrome, Brave, Edge, Arc, Vivaldi)
that hides YouTube Shorts everywhere on youtube.com and m.youtube.com, with an
on/off toggle in the toolbar popup and a keyboard shortcut.

Plain JavaScript, HTML and CSS. No build step, no dependencies, no bundler.

## Hard rules

These are not optional. Follow them on every task.

### 1. No changes without an approved execution plan

- Before changing anything, present an **execution plan** and wait for explicit approval.
  "Anything" includes: creating, editing, moving or deleting files; `git commit`, `git tag`,
  `git push`, or any command that rewrites history; installing tools; changing settings.
- The plan must list:
  - the files to touch and what changes in each
  - why the change is needed
  - how it will be verified
  - any risks and how to roll back
- Only execute **after** the user approves. No approval means no changes.
- Approval covers only the plan as written. If the scope grows or the approach changes
  partway through, stop and present a revised plan.
- Read-only work doesn't need approval: reading files, searching, running syntax checks,
  or inspecting YouTube's page structure.

### 2. Proper error handling in every script

- **`chrome.*` APIs**: every call to `chrome.storage`, `chrome.action`, `chrome.commands`,
  `chrome.tabs` etc. must handle failure: `try/catch` around `await`, or `.catch()`.
  Never leave a promise rejection unhandled.
- **Extension context invalidated**: after the extension is reloaded or updated, content
  scripts already running in open tabs lose access to `chrome.runtime`. `content.js` must
  detect this, stop its observers and listeners, and exit quietly rather than throw repeatedly.
- **DOM access**: YouTube changes its markup often. Assume any element can be missing.
  Use null checks and optional chaining; a missing element must never throw.
- **Parsing and stored data**: guard URL parsing, and merge stored settings with `DEFAULTS`
  so missing or malformed values fall back safely.
- **Logging**: use `console.warn` / `console.error` with the prefix `[Shorts Blocker]`.
  Never swallow errors silently, and never log on every DOM mutation (no console spam).
- **Fail safe**: if the extension breaks, YouTube itself must keep working normally.
  The popup must show an error state instead of silently doing nothing.

### 3. Comment the code

- Every file starts with a header comment: what it does and how it fits with the other files.
- Every function has a short comment on what it does and why. Non-trivial functions get
  JSDoc (`@param`, `@returns`).
- Every CSS selector group states which YouTube page or area it targets. When a selector is
  added or changed, note when it was verified against live YouTube, e.g. `/* verified 2026-09 */`.
- Explain non-obvious decisions, for example why the observer is throttled, why `:is()` is
  used, or why blocking defaults to "on" before storage loads.
- Comments explain **why**. Don't restate what the code obviously does.

## Project structure

| File | Role |
| --- | --- |
| `manifest.json` | Permissions, popup, keyboard shortcut, content script registration |
| `hide-shorts.css` | Selectors that hide Shorts, all scoped under `html[data-shorts-blocker="on"]` |
| `content.js` | Runs on YouTube: sets/removes the `on` attribute, marks text-only items (the "Shorts" filter chip), redirects `/shorts/ID` to `/watch?v=ID` |
| `background.js` | Service worker: toolbar icon/badge state, keyboard shortcut handler |
| `popup.html` / `popup.css` / `popup.js` | Toolbar popup, also used as the Options page |
| `icons/` | `on-*.png` and `off-*.png` at 16/32/48/128 px |

## Conventions

- Settings live in `chrome.storage.sync`. The `DEFAULTS` object (`{ enabled, redirect }`) is
  duplicated in `content.js`, `background.js` and `popup.js`. Keep all three in sync.
- Hiding is done in CSS, not by removing elements, so toggling is instant and reversible.
  Only use JS (`data-shorts-blocker-hide`) for items CSS can't match, such as matching by text.
- Don't add permissions to `manifest.json` without justifying them in the plan.
- The `version` in `manifest.json` must match the git tag for each release (tag `vX.Y.Z` means
  `"version": "X.Y.Z"`).

## Verifying changes

1. `node --check content.js background.js popup.js`, and confirm `manifest.json` parses as JSON.
2. Reload the extension at `chrome://extensions` (↻ on its card), then refresh YouTube.
3. Check with blocking on and off:
   - search results (Shorts shelf and the "Shorts" filter chip)
   - home feed and subscriptions
   - watch page recommendations
   - channel page (Shorts tab and shelf)
   - left sidebar
   - opening a `/shorts/` URL directly
4. Check the popup toggles, the toolbar icon/badge, and the Alt+Shift+S shortcut.
5. Report what was actually tested and what wasn't.
