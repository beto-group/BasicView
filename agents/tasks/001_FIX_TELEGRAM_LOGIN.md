# Fix Telegram Login LocalStorage Error (001)

## Context
When attempting to connect a Telegram bot in the TestRunner dashboard (`66.6 BasicFolderView`), the following error occurs:
`Error: Failed to read the 'localStorage' property from 'Window': Storage is disabled inside 'data:' URLs.`

This happens because the dashboard HTML is loaded via `data:` URI in `TestRunner.jsx`, which has restricted storage access in modern browsers/Electron.

## Objectives
1.  Allow `localStorage` access in the TestRunner dashboard window.
2.  Enable persistent session storage for Telegram authentication.

## Implementation Steps
- [ ] Modify `src/TestRunner.jsx` to:
    - [ ] Write the generated HTML to a temporary file (`dashboard.html`) instead of using a `data:` URI.
    - [ ] Load the file using `win.loadFile()` to establish a proper `file://` origin.
- [ ] Verify that `localStorage` is accessible.
- [ ] Ensure `reloadTestWindow` also follows this pattern to persist session across reloads.
