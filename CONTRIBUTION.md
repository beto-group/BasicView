# Engineering & Contribution Guide

This guide defines the architectural standards, performance pillars, and development workflows for maintaining **BASIC VIEW**.

---

## 🛠️ Core Engineering Pillars

### 1. Zero-Dependency Sandbox Safety
*   **Sandboxed Runtime**: All code must execute cleanly inside the global `dc` context without referencing external node APIs or third-party modules.
*   **Encapsulation**: Styles, utilities, and helper functions must remain local to `src/BasicView.component.jsx` to prevent global CSS bleed.

### 2. Immersive DOM Reparenting (Workspace Docking)
*   **Dynamic Leaf Traversal**: Full-tab mode works by traversing the DOM upwards to locate the nearest `.workspace-leaf-content` ancestor and appending the component directly to `.view-content`.
*   **Layout Preservation**: A hidden placeholder `div` must be prepended at the original parent node's location during reparenting. When the component unmounts, it must seamlessly return to its placeholder's position to avoid breaking the markdown preview flow.
*   **State Refs Management**: Keep references to original parents and dimensions inside an un-managed `useRef({})` object. Do not trigger React re-renders for styling positions or DOM operations.

### 3. Timestamped File Hot-Reloading (HMR-like Loop)
*   **Isolated Renders**: Clicking the reload button reads the active note using Obsidian's `vault.adapter.read()`.
*   **Clutter Cleanup**: Write the current file's content into a temporary note inside `_RESOURCES/temp` named `_temp-[fileName]-[timestamp].md`, and launch it in a new leaf to force Datacore's compiler to reload.
*   **Garbage Collection**: Unmounting the container must trigger active cleanups of the temporary files to prevent vault clutter.

---

## 💻 Local Compilation & Testing
1.  Add `BASIC VIEW` into your local vault under `_RESOURCES/DATACORE/`.
2.  Create a testing note that calls `BASIC VIEW` via a codeblock import:
    ```datacorejsx
    const AppModule = await dc.require("_RESOURCES/DATACORE/BASIC VIEW/src/App.jsx");
    const { View } = await AppModule({ folderPath: "_RESOURCES/DATACORE/BASIC VIEW", dc });
    return <View />;
    ```
3.  Click **"Enter Full Tab"** to test workspace leaf reparenting, and use the **Reload** icon to check the file-based code reload sequence.
