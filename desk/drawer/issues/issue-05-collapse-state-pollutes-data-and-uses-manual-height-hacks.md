---
title: Collapse state pollutes data and uses manual height hacks
severity: high
category: react-flow
---
# Collapse state pollutes data and uses manual height hacks
## What
Group collapse is implemented by writing view-only state into node `data.properties` using magic string keys, plus forcing `style.height` to a hardcoded `52`. The same constant is duplicated across files with a comment warning they must stay in sync.

## Where
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GroupShell.tsx:10-18`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GroupShell.tsx:40-61`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-edge-inheritance.ts:6-9`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-edge-inheritance.ts:31-41`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-edge-inheritance.ts:94-113`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-edge-inheritance.ts:164-183`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:309-317`
- `apps/review-workbench/src/features/hum-body/lib/adapter.ts:366-373`

## Why it's a threat
This mixes presentation state with graph/domain data, makes collapse behavior stringly typed, and creates fragile cross-file coupling. It is also fighting React Flow manually instead of deriving layout from measured node state. A future change to group header height or serialization shape can silently break expand/collapse.

## Evidence
Magic collapse keys are encoded as strings in graph data:

```tsx
export const COLLAPSED_KEY = '__collapsed';
...
return {
  ...properties,
  [COLLAPSED_KEY]: String(!collapsed),
};
```

The collapse hook also stores a remembered height in properties and mutates style height directly:

```tsx
const COLLAPSED_KEY = '__collapsed';
const EXPANDED_HEIGHT_KEY = '__expandedHeight';
const COLLAPSED_GROUP_HEIGHT = 52;
```

```tsx
const nextData = withCollapsedState(groupNode.data, true);
if (expandedHeight !== undefined) {
  nextData.properties = {
    ...nextData.properties,
    [EXPANDED_HEIGHT_KEY]: String(expandedHeight),
  };
}

updateNode(
  groupId,
  {
    data: nextData,
    style: { ...groupNode.style, height: COLLAPSED_GROUP_HEIGHT },
  },
  { isVisualOnly: true },
);
```

The adapter duplicates the constant and documents the brittle coupling:

```tsx
// Height a collapsed group box occupies (header only). Must match
// COLLAPSED_GROUP_HEIGHT in use-edge-inheritance.ts.
const COLLAPSED_GROUP_HEIGHT = 52;
```

## Suggested direction
Move collapse state out of serialized node properties and into explicit UI/view state. Use a single source of truth for group sizing, and let React Flow layout respond to measured dimensions rather than encoding remembered heights as string properties.