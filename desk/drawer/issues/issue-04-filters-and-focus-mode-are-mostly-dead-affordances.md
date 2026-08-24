---
title: Filters and focus mode are mostly dead affordances
severity: medium
category: dead-code
---
# Filters and focus mode are mostly dead affordances
## What
The sidebar exposes text filtering, attribute filtering, and “hide non-neighbors in focus mode”, but the canvas layer only applies relation-type filtering. Focus mode is set in UI state, yet the graph rendering path does not consume it.

## Where
- `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/FiltersSection.tsx:17-45`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/FiltersSection.tsx:49-124`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/sidebar/ViewSection.tsx:16-40`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphCanvas.tsx:92-109`

## Why it's a threat
This is deceptive UI: controls imply architectural capabilities that the rendering pipeline does not actually provide. Dead affordances also leave a misleading mental model for future maintainers, who may assume filtering/focus already exists and build new behavior on top of inert state.

## Evidence
The sidebar writes multiple filter fields:

```tsx
setFilter({ filterText: event.target.value })
...
setFilter({
  attributeFilter: key || value ? { key, value } : null,
});
...
setFilter({ hideNonNeighbors: event.target.checked })
```

The view section also enables focus mode through UI state:

```tsx
const focusedNodeId = useUIStore((state) => state.focusedNodeId);
...
setFilter({ hideNonNeighbors: true });
setEditorState('focus');
```

But the canvas only reads one filter field and applies only relation hiding:

```tsx
const selectedNode = useUIStore((state) => state.selectedNode);
const selectedEdge = useUIStore((state) => state.selectedEdge);
const hiddenRelationTypes = useUIStore((state) => state.filters.hiddenRelationTypes);

useEffect(() => {
  const filtered = filterGraphByRelationTypes(nodes, edges, hiddenRelationTypes);
  setNodesState(filtered.nodes.map(asCanvasNode));
  setEdgesState(filtered.edges.map(asCanvasEdge));
}, [edges, hiddenRelationTypes, nodes]);
```

## Suggested direction
Either implement text/attribute/focus filtering in the actual graph projection pipeline, or remove the controls until that pipeline exists. The important fix is alignment between visible controls, store state, and rendered behavior.