---
id: atom-editorlifecycle-what
title: EditorLifecycle
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

EditorLifecycle is the state model of an editing session in review-workbench: loading, ready or error, and the per-document loop inspecting -> saving. In docs/specs/state.editor-lifecycle.yml it is the `EditorSession` entity. There is no whole-graph clean/dirty state: canvas edits live in the graph store and are not persisted; only a document saved from the inspector is.
