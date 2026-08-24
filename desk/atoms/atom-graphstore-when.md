---
id: atom-graphstore-when
title: GraphStore
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore is active for the entire editor session. It is populated when L1 calls `loadGraph()`, updated whenever the operator creates, connects, selects, drags, or edits nodes and edges, and consulted again during save to determine dirty state and mark the current snapshot as saved. Undo and redo also operate against it whenever the operator triggers history navigation.
