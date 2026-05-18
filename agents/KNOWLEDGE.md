# Datacore Boilerplate Guide

Welcome to the **Datacore Boilerplate**. This project provides a robust foundation for building high-performance, agent-controlled, and unit-tested components within Obsidian.

## 🚀 Key Features

### 1. Detached Testing Pattern
Test results are rendered in a separate Electron window.
- **Why?** It prevents UI reloads from killing your test state.
- **How?** Press **Ctrl+T** or use the `run_tests` MCP command.
- **File**: `src/TestRunner.jsx`

### 2. Native MCP Bridge (Agent Hands & Eyes)
A built-in JSON-RPC bridge for AI Agents.
- **Hands**: I can reload the view, click buttons, and open DevTools by writing to `mcp_commands.json`.
- **Eyes**: I can see what the component looks like by requesting a `screenshot` and verify health via `mcp_state.json`.
- **File**: `src/components/MCPBridge.jsx`

### 3. Modular View Factory
Standardized dependency injection.
- **Pattern**: `src/index.jsx` lazy-loads hooks, styles, and components, then injects them into the `ViewComponent`.
- **Consistency**: All components follow this strict separation of concerns.

## 🧬 Project Structure Reference

| File | Purpose |
|------|---------|
| `src/index.jsx` | View entry point & dependency injector |
| `src/components/MainComponent.jsx` | The core UI of your component |
| `src/components/ControlsMenu.jsx` | Top-level action buttons |
| `src/hooks/useFullTab.jsx` | Shared logic for portal-style rendering |
| `src/TestRunner.jsx` | Detached test window engine |
| `tests/suite.jsx` | Your component's unit tests |
| `agents/` | Instructions and logs for AI collaborators |

## 🛠 Interaction Protocol for Agents

#### To Trigger an Action:
Write a JSON object to `_resources/mcp/mcp_commands.json`:
```json
{
  "action": "screenshot",
  "executed": false
}
```

#### Supported Actions:
- `reload`: Refresh the UI.
- `screenshot`: Capture a focused snapshot of the layout.
- `run_tests`: Kick off the unit test suite.
- `click`: Target an element (e.g., `#mcp-btn-test`).
- `devtools`: Inspect the DOM.


#### To Verify State:
Read `_resources/mcp/mcp_state.json` and `tests/latest_results.json`.

### 4. Code Generation Pitfalls
When writing code that generates other code (e.g., `TestRunner.jsx` creating an HTML string for a detached window), you **MUST** escape nested template literals.
- **Bad**: `` `<div>${variable}</div>` `` (Parsers will try to evaluate this immediately)
- **Good**: `` `<div>\${variable}</div>` `` (Escaped backticks and variables are preserved for the generated file)
- **Consequence**: Failure to escape causes `SyntaxError: Unexpected token` during Datacore transpilation.

### 5. Security Hardening
AI Agents are powerful but can be dangerous if given unrestricted access.
- **Scope DOM Access**: Never use `document.querySelector` globally in MCP handlers. Pass a `containerRef` from the View to `MCPBridge` and scope queries to `containerRef.current`.
- **Command Allowlist**: Explicitly validate `cmdData.action` against an allowed list (e.g., `['reload', 'click']`). Reject everything else.
- **Sanitize Selectors**: Ensure `click` targets are part of your component's DOM tree.

### 6. Datacore API Limitations
- **Functional Components Only**: `dc` only exposes hooks (`useState`, `useEffect`, etc.) and basic components (`Stack`, `List`, `Card`).
- **No Class Components**: There is no `React.Component` or `preact.Component` exposed. **Error Boundaries are impossible** to implement using the standard `dc` object.
- **Styling**: `styles.jsx` (JS objects) is limited. Prefer injecting `<style>` tags for media queries and pseudo-selectors.
### 7. Modern CSS Architecture
- **Injected Styles**: Do not use inline `style={{ ... }}` objects. They start simple but become unmanageable and perform poorly.
- **Pattern**: 
    1. Define a standard CSS string in `src/styles/theme.css.js`.
    2. Use BEM-like classes (e.g., `.bfv-container`) in components.
    3. Inject it once using the `useTheme` hook in `src/index.jsx`.
- **Benefits**: Enforces consistency, enables pseudo-selectors (`:hover`), and supports media queries for mobile responsiveness.

### 8. Robust Debugging
- **Centralized Manager**: Never leave raw `console.log` calls in production code. Use `src/utils/debugManager.jsx`.
- **Capabilities**:
    - **Toggle**: Globally enable/disable logs via `debugManager.setEnabled(bool)`.
    - **Broadcast**: It automatically pipes logs to the `MCPBridge` for agent visibility (`_resources/mcp/mcp_logs.json`).
    - **Interception**: It patches the global console to capture output from third-party libraries or legacy code.
### 9. Test Window Synchronization
- **Problem**: Detached windows (like the Test Runner) don't automatically refresh when the main view reloads.
- **Solution**: Expose a `reloadTestWindow(folderPath)` function from `TestRunner.jsx` and call it within `handleCodeReload` in `index.jsx`.
- **Implementation**:
    - Use `BrowserWindow.getAllWindows()` to find the existing window by title.
    - Re-run the test suite and regenerate the HTML.
    - Use `win.loadURL` to refresh the content without closing the window.

### 10. Hook Usage in View Factory
- **Critical Rule**: Even when using the dependency injection pattern in `index.jsx`, **ALL hooks (including custom ones like `useTheme`) MUST be called inside the `ViewComponent` function**.
- **Error**: Calling `useTheme` at the top level of `View` (outside `ViewComponent`) causes `TypeError: Cannot read properties of null (reading '__H')`.
- **Correct Pattern**:
    ```javascript
    async function View({ folderPath }) {
        // ... imports ...
        function ViewComponent() {
            useTheme({ css: CSS, folderPath }); // CORRECT: Inside component
            // ...
        }
        return <ViewComponent />;
    }
    ```

### 11. Safe Event Handling in HTML Strings
- **Problem**: Passing complex objects to inline `onclick` handlers (e.g., `onclick="func('${JSON.stringify(obj)}')`) is fragile. Quotes inside the object break the HTML attribute.
- **Solution**: Use `data-attributes` to store the encoded string and read it back.
- **Pattern**:
    ```javascript
    const dataStr = encodeURIComponent(JSON.stringify(complexObj));
    return `
        <div 
            data-payload="${dataStr}" 
            onclick="handle(JSON.parse(decodeURIComponent(this.dataset.payload)))"
        >
            Click Me
        </div>
    `;
    ```

### 12. Absolute Paths in Detached Windows
- **Crucial**: Electron's `require('path')` and `fs` modules in a detached window context often fail with relative paths.
- **Fix**: Always resolve paths using `dc.app.vault.adapter.basePath` **before** generating the HTML/Script for the external window.
- **Example**:
    ```javascript
    const path = require('path'); // Node module
    const basePath = dc.app.vault.adapter.basePath; // Obsidian API
    const fullPath = path.join(basePath, folderPath, '_resources/mcp/mcp_logs.json');
    ```

### 13. Safe Loader & Robust Recovery
- **Problem**: If the `MainComponent` or its dependencies have a syntax error or runtime crash during boot, the entire React tree dies, including the `MCPBridge`. This makes the "Agent Console" useless for remote fixing.
- **Solution**: Use a "Safe Loader" pattern in `index.jsx`.
- **Implementation**:
    1.  **Inline Agent**: Start a minimal, pure-JS MCP agent (using `fs.readFileSync`) *before* any React components load.
    2.  **Lazy Loading**: Wrap the loading of the main application in a `try/catch` block.
    3.  **Crash Screen**: If loading fails, render a fallback UI with the error message.
    4.  **Persistent Connection**: Because the agent started first, the "Agent Console" remains connected. The agent can trigger a view rebuild (`dc.app.workspace.activeLeaf.rebuildView()`) once the code is fixed, allowing recovery without manual intervention.

### 14. Dynamic Documentation Reference
- **Resource**: `_resources/mcp/mcp_schema.json`
- **Pattern**: The Agent Console (Test Runner) reads this JSON file to generate its "Docs" tab.
- **Maintenance**: When adding new MCP actions, update the schema file to ensure the documentation stays in sync automatically.

### 15. Module Loading Pitfalls (dc.require)
- **Problem**: Destructuring from `dc.require` can fail if the module exports multiple functions/components but the `index.jsx` code expects a different structure.
- **Pattern**: When a module like `TestRunner.jsx` exports an object `{ View, spawnTestWindow, reloadTestWindow }`, avoid destructuring just one part if you need the utilities.
- **Correct**:
    ```javascript
    const TestRunner = await dc.require(path);
    // Use as: 
    // <TestRunner.View />
    // TestRunner.spawnTestWindow()
    ```
- **Dangerous**: `const { TestRunner } = await dc.require(path);` (Likely `undefined` if the file doesn't have a `TestRunner` property in its return object).

### 16. Browser-Compatible Libraries
Some Node.js libraries (like `gram.js`) are not browser-compatible by default.
- **Pattern**: Do not rely on `esm.sh` or `unpkg` if the library uses internal `instanceof` checks, as multiple chunks can break class identity.
- **Fix**: Create a customized **Webpack Browser Bundle** with necessary polyfills (`path-browserify`, `stream-browserify`, etc.) and load it as a single script file.
- **Deployment**: Commit the bundled file (e.g., `src/utils/my-lib.bundle.js`) to the repo and load it via `adapter.read()`.

### 17. Cache Busting for Injected Scripts
Datacore/Obsidian views are persistent, and browsers caching injected `<script src="...">` or module imports is extremely aggressive.
- **Problem**: Changing the file content on disk does **NOT** update the running script if the filename remains the same.
- **Solution**: Version your loader files (e.g., `client_v1.js` -> `client_v2.js`) to force a fresh load when major logic changes occur.

### 18. Global Bridge Registry (Stability Pattern)
- **Problem**: In Obsidian/Datacore, components often reload or re-render during development or state changes. If a component manages a long-lived socket connection (like Telegram), each reload creates a *new* connection without closing the old one, leading to "Socket closed" and session collision errors.
- **Solution**: Use a global registry attached to `window`.
- **Implementation**:
    ```javascript
    if (!window.__MCP_TG_REGISTRY__) window.__MCP_TG_REGISTRY__ = {};
    if (window.__MCP_TG_REGISTRY__[folderPath]) {
        bridgeRef.current = window.__MCP_TG_REGISTRY__[folderPath];
        return; // Re-use existing instance
    }
    // Create new and register
    const bridge = new Bridge();
    window.__MCP_TG_REGISTRY__[folderPath] = bridge;
    ```
- **Benefit**: Zero-interruption reloads and guaranteed singleton connections per project path.

### 19. Persistence Awareness in Detached Windows
- **Problem**: Detached Electron windows remain open even if the main Obsidian component leaf is closed. This leads to a "Ghost UI" where buttons like "Send" or "Reload" fail silently because the underlying bridge is dead.
- **Solution**: Implement a heartbeat check.
- **Implementation**:
    1. The main component updates `_resources/mcp/mcp_state.json` with a current `timestamp`.
    2. The detached window polls this file.
    3. If `(Date.now() - timestamp) > 10000`, the window style is updated to show a **"BRIDGE INACTIVE"** warning, disabling interactive elements.
- **Benefit**: Clear user feedback and prevention of orphaned UI states.

### 20. Global MCP Server (telegram-mcp)
Beyond the project-local bridge, we've implemented a **Global MCP Server** for account-level interaction.
- **Configuration**: Managed in `~/.gemini/antigravity/mcp_config.json`.
- **Server Path**: `/Users/blackbird/.nvm/versions/node/v20.19.5/bin/telegram-mcp`.
- **User Authentication**: Unlike the local project bridge (which uses Bots), the global server uses a **User Account**.
- **Privacy**: User tokens allow the agent to see messages and groups that are normally hidden from bots.
- **Two-Way Sync**: Enables the agent to read incoming Telegram messages and reply directly from the Antigravity chat interface, creating a seamless mobile-to-desktop workflow.
