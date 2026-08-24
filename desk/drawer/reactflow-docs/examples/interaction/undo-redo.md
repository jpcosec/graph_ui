---
source: https://reactflow.dev/examples/interaction/undo-redo
title: Undo and Redo
---

# Undo and Redo

This example demonstrates how to implement undo and redo functionality
for a React Flow graph. Users can track and revert changes when moving,
adding, or deleting nodes and edges. The implementation uses a
snapshot-based approach with the `useUndoRedo` hook that manages past
and future states, allowing users to navigate through their editing
history with button clicks or keyboard shortcuts (Ctrl+Z and
Ctrl+Shift+Z).

<div
class="border-border mt-4 h-[75vh] max-h-[650px] min-h-[400px] overflow-hidden rounded-sm border bg-muted animate-pulse"
role="status" aria-label="Loading example preview">

</div>

### About this Pro Example

-   Dependencies:
    <a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react </a>
-   License:
    <a href="https://xyflow.com/pro-license">xyflow Pro License </a>
