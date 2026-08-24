---
id: atom-editorengine-where
title: GraphEditorEngine
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

GraphEditorEngine lives in `src/editor.py` in the backend layer. That file imports `GraphData`, `UINode`, `UIEdge`, `NodeEdit`, `EdgeEdit`, and `EditAction`, then defines the `GraphEditorEngine` class and its two mutation methods. No frontend files define or host it.
