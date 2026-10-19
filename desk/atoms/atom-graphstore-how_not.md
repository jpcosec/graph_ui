---
id: atom-graphstore-how_not
title: GraphStore
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphStore

## Answer

GraphStore must not treat visual-only changes as semantic history, which is why `isVisualOnly` bypasses the undo stack. It must not persist data by itself; persistence is per document (NodeInspector -> `sldbProvider.saveDoc`), and the store has no dirty or saved state. It also must not silently invent edits for missing ids, because `updateNode()` and `updateEdge()` return early when the target element does not exist.
