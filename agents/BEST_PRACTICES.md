# Datacore Boilerplate Best Practices

This boilerplate is designed for **High Performance**, **Self-Correcting Agents**, and **Modular Architecture**.

## 🏗 Project Structure
- `src/index.jsx`: Entry point and View Factory. Handles dependency injection and layout.
- `src/components/`: Pure UI components.
- `src/hooks/`: Reusable logic (FullTab, Sync, etc.).
- `src/styles/`: Global styles and design tokens.
- `src/TestRunner.jsx`: Real-time, detached unit test engine.
- `tests/suite.jsx`: Component-specific test logic.

## 🤖 Agent Interaction (Hands & Eyes)
Every component MUST include the `MCPBridge.jsx` to allow AI agents to verify and control the UI autonomously.

### 🧤 The Hands (Commands)
Agents can write to `mcp_commands.json` to trigger actions:
- `reload`: Rebuilds the component to pick up code changes.
- `screenshot`: Captures a focused visual of the component.
- `click`: Simulates a DOM interaction via selector.
- `run_tests`: Spawns the unit test debugger.
- `devtools`: Opens Obsidian's inspector.

### 👁 The Eyes (Observation)
Agents monitor the following to verify state:
- `mcp_state.json`: Current UI health and status.
- `mcp_screenshot.png`: Visual verification.
- `tests/latest_results.json`: Proof of technical correctness.

## 🚨 Essential Workflow Protocol (Step 0)
**Before starting any task**, always insure the **Agent Console** is open and active.
1.  **Open Console**: Use `Ctrl+T` or trigger `{"action": "run_tests"}` via MCP.
2.  **Verify Connection**: Check that the console shows "ONLINE" and responds to `ping`.
3.  **Why?**: This console is your lifeline. If the main view crashes, this console allows you to fix it without manual intervention.

## ⚖️ Development Standards
1.  **Stateless Components**: Keep UI components pure; move logic to hooks.
2.  **Test-Driven Execution**: Never push a change without running the test suite via the `run_tests` command.
3.  **DPR Awareness**: Always account for Device Pixel Ratio when performing visual captures.
4.  **Cleanup**: Always detach event listeners and close external windows in `useEffect` cleanups.
