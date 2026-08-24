---
source: https://reactflow.dev/examples/layout/expand-collapse
title: Expand and Collapse
---

# Expand and Collapse

This example demonstrates how to implement expandable and collapsible
nodes in a hierarchical tree structure. Nodes with children can be
expanded or collapsed by clicking on them, revealing or hiding their
descendants. The implementation uses a custom `useExpandCollapse` hook
that maintains the complete graph structure while only rendering the
currently visible portions.

<div
class="border-border mt-4 h-[75vh] max-h-[650px] min-h-[400px] overflow-hidden rounded-sm border bg-muted animate-pulse"
role="status" aria-label="Loading example preview">

</div>

### About this Pro Example

-   Dependencies:
    <a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react </a>,
    <a href="https://www.npmjs.com/package/@dagrejs/dagre">@dagrejs/dagre </a>
-   Implements a reusable `useExpandCollapse` hook that handles
    visibility logic
-   Demonstrates dynamic node addition with automatic layout
    recalculation
-   Uses node data properties to track expanded/collapsed state
-   Provides interactive controls to expand/collapse nodes and add
    children
-   License:
    <a href="https://xyflow.com/pro-license">xyflow Pro License </a>
