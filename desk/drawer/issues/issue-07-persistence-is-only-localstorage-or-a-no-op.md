---
title: Persistence is only localStorage or a no-op
severity: high
category: data-coupling
---
# Persistence is only localStorage or a no-op
## What
There is no trustworthy persistence boundary. `HumBodyPage` saves per-view drafts into browser `localStorage`, while the general graph data provider acknowledges saves without storing the payload anywhere.

## Where
- `apps/review-workbench/src/features/hum-body/HumBodyPage.tsx:15`
- `apps/review-workbench/src/features/hum-body/HumBodyPage.tsx:79-90`
- `apps/review-workbench/src/features/hum-body/HumBodyPage.tsx:155-178`
- `apps/review-workbench/src/features/graph-editor/lib/data-provider.ts:47-56`
- `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx:168-183`

## Why it's a threat
The UI exposes “Save” semantics, dirty tracking, and view drafts, but the durable storage contract is not real. That makes it easy to mistake ephemeral browser state for persisted application state. It also blocks meaningful integration testing of save/load behavior because the default implementation cannot fail or round-trip data.

## Evidence
`HumBodyPage` loads and writes drafts from `localStorage`:

```tsx
const STORAGE_KEY = 'hum-body-view-drafts';
...
const raw = window.localStorage.getItem(STORAGE_KEY);
return raw ? JSON.parse(raw) as Record<string, { nodes: typeof nodes; edges: typeof edges }> : {};
```

```tsx
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draftGraphs));
```

Its save handler only updates in-memory/local draft state:

```tsx
const handleSave = () => {
  const currentGraph = { nodes, edges };
  setDraftGraphs((current) => ({
    ...current,
    [currentKey]: currentGraph,
  }));
  markSaved();
};
```

The shared data provider discards the payload entirely:

```ts
export const graphDataProvider: GraphDataProvider = {
  async getSchema() {
    return mockSchema;
  },
  async getGraph() {
    return mockClient.getGraph();
  },
  async saveGraph(_payload) {
    return { ok: true };
  },
};
```

## Suggested direction
Make persistence explicit. If the app is demo-only, label it as such and avoid pretending saves are durable. If persistence matters, add a real repository boundary with load/save round-trips and failure handling, and keep per-view browser drafts as a secondary convenience feature only.