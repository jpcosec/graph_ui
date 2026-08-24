---
id: atom-graphstore-where
title: GraphStore
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore lives in `apps/review-workbench/src/stores/graph-store.ts` in the frontend stores layer. It is consumed by L1 pages such as `GraphEditorPage.tsx` and by L2 canvas code that needs graph state and mutation actions. That file is the single implementation of graph session state, history, and dirty tracking on the client.
