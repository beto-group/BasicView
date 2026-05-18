# Fix Telegram Login LocalStorage Error

## Problem
The `TestRunner` loads its dashboard UI using a `data:text/html` URI. This context has blocked `localStorage` access for security reasons, causing the Telegram client (which relies on `localStorage` or session storage) to fail immediately upon connection attempt.

## Solution
Change the `TestRunner` to write the generated HTML to a temporary file (`dashboard.html`) in the same directory and load it via `win.loadFile()`. This grants the window a `file://` origin, which permits `localStorage` usage.

## Proposed Changes

### [66.6 BasicFolderView](file:///Volumes/BackUp_WB-1TB/APPLICATIONS/BETO_BACKEND/app-repos/production-contabo/DATACORE/66.6%20BasicFolderView)

#### [MODIFY] [src/TestRunner.jsx](file:///Volumes/BackUp_WB-1TB/APPLICATIONS/BETO_BACKEND/app-repos/production-contabo/DATACORE/66.6%20BasicFolderView/src/TestRunner.jsx)
- Update `spawnTestWindow` to write `dashboard.html` and use `win.loadFile()`.
- Update `reloadTestWindow` to write `dashboard.html` and use `existing.loadFile()`.

## Verification Plan
1.  Open the Agent Console/TestRunner.
2.  Attempt to log in to Telegram (bot).
3.  Confirm no error regarding `localStorage`.
4.  Reload the console and verify session persists (or at least doesn't crash).
