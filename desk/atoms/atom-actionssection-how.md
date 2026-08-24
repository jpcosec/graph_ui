---
id: atom-actionssection-how
title: ActionsSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ActionsSection

## Answer

It reads nodes, edges, undoStack, redoStack, and isDirty from the graph store, then uses UI store clipboard and delete-confirm state for copy, paste, and delete flows. Save delegates to the provided onSave callback, copy stores the selected node id, paste clones payload and properties into a new offset node, and delete opens a confirmation flow before graphStore.removeElements executes.
