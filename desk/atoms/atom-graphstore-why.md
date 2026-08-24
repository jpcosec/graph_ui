---
id: atom-graphstore-why
title: GraphStore
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore exists to keep graph mutation logic centralized instead of spreading it across React components. The editor needs one place that can load a graph, apply semantic edits, derive dirty state, and support undo/redo over `CREATE_ELEMENTS`, `DELETE_ELEMENTS`, `UPDATE_NODE`, and `UPDATE_EDGE` actions. Without that store, every panel and canvas interaction would have to reimplement graph update semantics and history management.
