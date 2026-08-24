---
title: Unused legacy KnowledgeGraph god component
severity: high
category: dead-code
---
# Unused legacy KnowledgeGraph god component
## What
The repo still contains a full second React Flow editor implementation in `pages/global/KnowledgeGraph.tsx`. It is a 2949-line component with its own local state, filters, undo/redo, layout, edit modals, copy/paste, and collapse logic, but the current app entrypoint does not mount it.

## Where
- `apps/review-workbench/src/pages/global/KnowledgeGraph.tsx:923-949`
- `apps/review-workbench/src/pages/global/KnowledgeGraph.tsx:2322-2949`
- `apps/review-workbench/src/App.tsx:16-21`

## Why it's a threat
A dead editor this large is not harmless residue; it is parallel architecture. Future changes to editor behavior now have two places to inspect, compare, and accidentally copy from. It also preserves obsolete patterns the newer editor is supposed to replace, which makes architectural drift more likely.

## Evidence
`App.tsx` mounts `HumBodyPage`, not `KnowledgeGraph`:

```tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <HumBodyPage />
      </AppShell>
    </QueryClientProvider>
  );
}
```

`KnowledgeGraph.tsx` still defines a complete editor surface with its own state machine:

```tsx
function NodeEditorInner({ initialNodes, initialEdges, onSave, onChange, readOnly = false }: KnowledgeGraphProps): JSX.Element {
  const [nodes, setNodes, onNodesChange] = useNodesState<SimpleNode>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<SimpleEdge>(initial.edges);

  const [editorState, setEditorState] = useState<EditorState>("browse");
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [focusedRelationId, setFocusedRelationId] = useState<string | null>(null);
  ...
}
```

And it still exports a mountable page wrapper:

```tsx
export function KnowledgeGraph(props: KnowledgeGraphProps): JSX.Element {
  return (
    <section className="m-0 min-h-screen">
      <ReactFlowProvider>
        <NodeEditorInner {...props} />
      </ReactFlowProvider>
    </section>
  );
}
```

## Suggested direction
Decide explicitly whether `KnowledgeGraph` is the old editor or still part of the product. If it is obsolete, retire it and keep only the layered `features/graph-editor` path. If it is still needed, move it behind a clearly owned route and stop duplicating editor capabilities elsewhere.