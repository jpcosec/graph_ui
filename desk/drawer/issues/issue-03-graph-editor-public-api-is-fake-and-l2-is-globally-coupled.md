---
title: GraphEditor public API is fake and L2 is globally coupled
severity: high
category: coupling
---
# GraphEditor public API is fake and L2 is globally coupled
## What
The L2 editor exposes `initialNodes` and `initialEdges` props, but `GraphEditor` immediately discards them and reads everything from global Zustand stores. The same direct store reach-through continues in `GraphCanvas`, `NodeShell`, and `NodeInspector`.

## Where
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphEditor.tsx:18-21`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphEditor.tsx:38-50`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/GraphCanvas.tsx:92-109`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/NodeShell.tsx:141-146`
- `apps/review-workbench/src/features/graph-editor/L2-canvas/panels/NodeInspector.tsx:59-69`

## Why it's a threat
This makes the editor harder to reason about, harder to reuse, and harder to test in isolation. The prop API suggests composition, but runtime behavior depends on hidden global state. That is coupling by surprise: callers cannot tell from the component boundary what actually drives the editor.

## Evidence
`GraphEditor` accepts graph props and then explicitly ignores them:

```tsx
export function GraphEditor({ initialNodes, initialEdges, onSave, hero, workspace, topOverlay, shellVariant = 'default', contentTopInset = 0, overlayPlacement = 'canvas' }: GraphEditorProps) {
  useKeyboard();

  void initialNodes;
  void initialEdges;

  const deleteConfirmOpen = useUIStore((state) => state.deleteConfirmOpen);
  ...
}
```

`GraphCanvas` does not receive graph state from its parent; it reaches into stores directly:

```tsx
export function GraphCanvas() {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const onNodesChange = useGraphStore((state) => state.onNodesChange);
  const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
  const onConnect = useGraphStore((state) => state.onConnect);
  ...
}
```

`NodeShell` and `NodeInspector` also manipulate UI/global state themselves:

```tsx
const setFocusedNode = useUIStore((state) => state.setFocusedNode);
const setFocusedEdge = useUIStore((state) => state.setFocusedEdge);
const setEditorState = useUIStore((state) => state.setEditorState);
```

```tsx
const focusedNodeId = useUIStore((state) => state.focusedNodeId);
const nodes = useGraphStore((state) => state.nodes);
const updateNode = useGraphStore((state) => state.updateNode);
```

## Suggested direction
Make the boundary honest. Either embrace a store-driven editor and remove misleading data props, or lift graph/UI state orchestration to a higher layer and pass explicit props/callbacks into L2. Avoid mixed mode APIs where props exist only cosmetically.