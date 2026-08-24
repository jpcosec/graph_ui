---
source: https://reactflow.dev/examples/layout/dynamic-layouting
title: Dynamic Layouting
---

# Dynamic Layouting

This example creates a self-organizing graph where nodes position
themselves automatically in a tree-like structure. Key features include:

-   **Node creation**: Instead of manually placing or connecting nodes,
    users click on placeholder elements to add new nodes
-   **Multiple interaction points**: Add children by clicking on nodes,
    convert placeholders into nodes, or insert nodes between existing
    ones using the ”+” button on edges
-   **Smart layout algorithm**: When the graph changes, an auto-layout
    hook powered by `d3-hierarchy` recalculates all positions
-   **Smooth transitions**: Nodes animate to their new positions,
    maintaining visual clarity even as complexity increases

<div
class="border-border mt-4 h-[75vh] max-h-[650px] min-h-[400px] overflow-hidden rounded-sm border bg-muted animate-pulse"
role="status" aria-label="Loading example preview">

</div>

### About this Pro Example

-   Dependencies:
    <a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react </a>,
    <a href="https://www.npmjs.com/package/d3-hierarchy">d3-hierarchy </a>
-   License:
    <a href="https://xyflow.com/pro-license">xyflow Pro License </a>
