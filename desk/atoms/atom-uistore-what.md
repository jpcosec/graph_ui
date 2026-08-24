---
id: atom-uistore-what
title: UiStore
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore is the zustand store for non-graph editor session state on the frontend. It holds `EditorState` (`browse`, `focus`, `edit_node`, `edit_relation`), focus and selection ids, sidebar openness, filters, active encoding rules, active layout strategy, active view id, copy/delete dialog state, and command dialog state. Its job is to capture how the editor is being used, rather than the graph data itself.
