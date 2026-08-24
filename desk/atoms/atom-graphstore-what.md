---
id: atom-graphstore-what
title: GraphStore
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore is the zustand store that holds the editor's graph state and semantic edit history. It owns the current `nodes`, `edges`, `undoStack`, `redoStack`, and `savedSnapshot`, plus actions such as `loadGraph`, `addElements`, `removeElements`, `updateNode`, `updateEdge`, `undo`, `redo`, `isDirty`, and `markSaved`. It is the canonical in-memory source of truth for graph edits inside the frontend session.
