# 🛠️ Contributing to Basic View (v4-folder-skeleton)

Welcome! This document outlines the developer standards and compilation guidelines required to maintain the baseline folder implementation of the Basic View.

---

## 🏛️ Core Architecture Pillars

1.  **Full-Pane DOM Interception**:
    *   The view targets the nearest `.workspace-leaf-content` ancestor and replaces standard Markdown leaves with a full-pane portal overlay.
    *   Strict lifecycle cleanups are required upon unmounting to completely restore the native Obsidian view.
2.  **Anti-Bleed Style Isolation**:
    *   All styles must be scoped tightly under standard container class keys (`.basic-folder-view-container`) to avoid spilling into the Obsidian UI or interfering with active user themes.
3.  **Sterile Zero-Dependency Flow**:
    *   The view must rely strictly on standard pre-loaded React hooks (`useState`, `useEffect`, `useRef`) provided by the `dc` host workspace compiler leaf.

---

## 🚀 Local Compilation & Reload Loop

*   **Hot Reload Trigger**: During development, use the reload action menu or press the reload button inside the UI panel to invoke `dc.app.workspace.activeLeaf.rebuildView()`. This automatically flushes Obsidian's internal module cache, loading your latest React changes instantly with zero system reboots.
