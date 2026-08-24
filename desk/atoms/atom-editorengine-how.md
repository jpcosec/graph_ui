---
id: atom-editorengine-how
title: GraphEditorEngine
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

`apply_node_edit()` branches on `EditAction.CREATE`, `UPDATE`, and `DELETE`: it rejects node ID collisions, creates `UINode` instances, updates labels and node types, merges metadata, and cascades edge deletion when a node is removed. `apply_edge_edit()` handles edge create and delete: it verifies that source and target nodes exist before creating a `UIEdge`, and filters matching edges out on delete. Both methods mutate and return the `GraphData` instance they receive.
