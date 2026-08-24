---
title: Auto-layout ignores measured dimensions and never runs on load
severity: medium
category: react-flow
---
# Auto-layout ignores measured dimensions and never runs on load
## What
Layout is only triggered manually from the sidebar, and when it runs it falls back to default sizes whenever React Flow has not populated `node.width`/`node.height`. There is no `useNodesInitialized`/measured-dimensions gate before computing layout.

## Where
- `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/ViewSection.tsx:20-31`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-graph-layout.ts:28-50`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/layout/layout-strategies.ts:35-45`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/layout/layout-strategies.ts:65-91`

## Why it's a threat
This makes layout quality depend on timing and on hardcoded fallback sizes rather than actual rendered node dimensions. It is especially fragile in a graph with zoom-tier renderers, custom node cards, and collapsible groups. The result is a layout system that looks generic on paper but is only loosely connected to what React Flow actually measured.

## Evidence
Layout is an explicit button action, not part of graph initialization:

```tsx
const applyLayout = async () => {
  setIsApplyingLayout(true);
  const updatedNodes = await layout();
  setIsApplyingLayout(false);
  ...
};
```

The layout hook reads dimensions opportunistically and otherwise passes `undefined`:

```tsx
const nodesInput = nodes.map((node) => ({
  id: node.id,
  width: typeof node.width === 'number' ? node.width : undefined,
  height: typeof node.height === 'number' ? node.height : undefined,
}));
```

The strategy then substitutes generic defaults:

```ts
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 80;

function resolveNodeSize(node: LayoutNode) {
  return {
    width: node.width ?? DEFAULT_NODE_WIDTH,
    height: node.height ?? DEFAULT_NODE_HEIGHT,
  };
}
```

## Suggested direction
Treat layout as a measured-graph concern, not a blind post-processing step. Wait for nodes to initialize before computing layout, use actual measured dimensions for custom/group nodes, and decide explicitly whether initial graph load should run layout or preserve authoritative stored positions.