---
title: Orphaned GraphEditorPage and bypassed translation layer
severity: high
category: compartmentalization
---
# Orphaned GraphEditorPage and bypassed translation layer
## What
`GraphEditorPage` is supposed to be the L1 orchestration layer, but it is not mounted by the app. Inside that orphaned path, it also imports the domain translation layer and then explicitly bypasses it with a direct pass-through cast.

## Where
- `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx:11-15`
- `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx:120-148`
- `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx:168-183`
- `apps/review-workbench/src/App.tsx:16-21`

## Why it's a threat
This leaves the intended L1/L2 split only partially real. The app now has a nominal application layer that is disconnected from runtime, while the actual runtime lives in `HumBodyPage`. That makes the layering look cleaner than it is. The explicit bypass of `schemaToGraph` is an additional sign that the planned data flow is no longer authoritative.

## Evidence
The file advertises an L1 orchestrator and imports the translation layer:

```tsx
/** L1: Page component - fetches data, registers types, orchestrates editor */
import { GraphEditor } from '../L2-canvas/GraphEditor';
import { graphDataProvider, type GraphSchema } from '../lib/data-provider';
import { graphToDomain } from '../lib/graph-to-domain';
import { schemaToGraph } from '../lib/schema-to-graph';
```

But the actual graph load ignores the translation layer:

```tsx
const graph = useMemo(() => {
  if (!rawData || !isSchemaRegistered) {
    return { nodes: [] as ASTNode[], edges: [] as ASTEdge[] };
  }

  // Direct pass-through - no translation layer
  const data = rawData as { nodes: ASTNode[]; edges: ASTEdge[] };
  return { nodes: data.nodes, edges: data.edges };
}, [rawData, isSchemaRegistered]);
```

And the current app entrypoint does not use `GraphEditorPage` at all:

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

## Suggested direction
Pick one real application entrypoint. If `GraphEditorPage` is the intended L1 boundary, route the app through it and make translation/persistence real. If `HumBodyPage` is the primary product surface, fold the necessary L1 responsibilities into a single maintained boot path and delete the abandoned one.