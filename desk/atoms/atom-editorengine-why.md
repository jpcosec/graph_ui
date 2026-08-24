---
id: atom-editorengine-why
title: GraphEditorEngine
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:editing
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorEngine

## Answer

This engine exists so graph edits have a dedicated backend implementation instead of being scattered through unrelated modules. The grounding identifies `editor.py` as the place that applies CRUD edits with collision checking and cascade delete. That gives graph_ui one explicit mutation path over the canonical contract.
