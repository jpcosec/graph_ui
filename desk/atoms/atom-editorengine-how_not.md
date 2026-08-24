---
id: atom-editorengine-how_not
title: GraphEditorEngine
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

GraphEditorEngine must not bypass node existence checks, skip collision detection, or leave dangling edges behind when a node is deleted. It also must not take on UI concerns such as inspector state or keyboard shortcuts, because those belong to the frontend. In this repo its grounded scope is backend graph mutation only.
