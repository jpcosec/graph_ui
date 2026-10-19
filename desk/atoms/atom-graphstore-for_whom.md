---
id: atom-graphstore-for_whom
title: GraphStore
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore is for frontend code that needs a shared graph session, especially `AntoniaFlowPage` (which loads it), `GraphCanvas`, inspectors, and action controls. It also serves the operator indirectly by enabling create/edit/delete and undo/redo in one coherent store. Any client-side feature that needs the current nodes and edges or needs to mutate them goes through this store.
