---
id: atom-editorengine-when
title: GraphEditorEngine
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

It applies when backend code needs to materialize a create, update, or delete request over graph data. In lifecycle terms that is after an edit has already been shaped as `NodeEdit` or `EdgeEdit` and before the resulting `GraphData` is handed onward. It is not a load-time adapter or a render-time component.
