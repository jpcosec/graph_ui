---
source: https://reactflow.dev/examples/nodes/shapes
title: Shapes
---

# Shapes

This example shows how to render
<a href="/learn/customization/custom-nodes">Custom Nodes</a>
with different shapes commonly used in flow charts like circles,
diamonds, or hexagons. It also showcases how to create a sidebar
component, custom minimap nodes, and a node toolbar for changing the
color of the shapes.

The example uses a centralized Shape component that renders different
SVG paths based on the shape type. By defining node data with
`{ type: 'shape', data: { type: 'diamond', color: '#ff0071' }}`, you can
control which shape gets rendered and how it appears, all while using a
single node type implementation.

<div
class="border-border mt-4 h-[75vh] max-h-[650px] min-h-[400px] overflow-hidden rounded-sm border bg-muted animate-pulse"
role="status" aria-label="Loading example preview">

</div>

### About this Pro Example

-   Dependencies:
    <a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react </a>
-   License:
    <a href="https://xyflow.com/pro-license">xyflow Pro License </a>
