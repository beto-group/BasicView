# Agent Console Tools

The **Agent Console** is a powerful external debugging window that runs alongside the Datacore component. It provides a persistent, interactive environment for monitoring and controlling the application.

## 🎯 Launching
- **Shortcut**: `Ctrl + T` (or `Cmd + T` on Mac) while the component is focused.
- **Command**: Write `{"action": "run_tests"}` to `mcp_commands.json`.

## 🛠 Capabilities

### 1. ⚡ Reload Frame
Forces a complete reload of the Datacore component iframe.
- **Use Case**: Applying code changes without closing/opening the view.
- **Internal**: Writes `reload` action.

### 2. ⚙️ Settings
Opens the Obsidian Settings modal.
- **Use Case**: Verifying that the bridge functionality is working and the main app is responsive.

### 3. 🔍 Inspect (DevTools)
Opens the Electron Developer Tools for the iframe.
- **Use Case**: Debugging DOM issues, checking console logs directly, or inspecting network requests.

### 4. ▶ Test (Unit Tests)
Runs the `tests/suite.jsx` test suite.
- **Use Case**: Verifying logic after refactoring.
- **Feedback**: Shows Pass/Fail results directly in the console sidebar.

### 5. 🗑️ Clear History
Wipes the local activity and log history from the JSON files.
- **Use Case**: Starting a fresh debugging session.

### 6. 📚 Docs (Command Reference)
A dynamically generated library of all available MCP commands.
- **Source**: Powered by `mcp_schema.json`.
- **Use Case**: Quick lookup of command syntax and usage examples for agents.

## 🛡️ Robustness: The Safe Loader
The console is supported by a **Safe Loader** pattern in `index.jsx`:
1. **Immediate Agent**: A primitive MCP agent starts *before* React, using pure Node.js `fs`.
2. **Persistence**: Even if the main component crashes (syntax error, runtime exception), the console remains **CONNECTED**.
3. **Recovery**: You can trigger a `reload` from the console to boot the app back up after fixing code.

## 📡 Architecture
The console operates on a **polling loop** (1000ms interval) that watches:
1. `mcp_activity.json`: For actions executed by the main component.
2. `mcp_logs.json`: For console logs captured by the `debugManager`.
3. `mcp_schema.json`: For dynamic documentation generation.

The console is designed to be the "last man standing" in a crash scenario.
