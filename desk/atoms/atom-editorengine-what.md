---
id: atom-editorengine-what
title: GraphEditorEngine
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

GraphEditorEngine is the backend editing unit that applies validated graph mutations to `GraphData`. In `src/editor.py` it exposes two methods: `apply_node_edit()` and `apply_edge_edit()`. Its responsibility is to perform create, update, and delete operations while preserving the contract's structural integrity checks present in that file.
