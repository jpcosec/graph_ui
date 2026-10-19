---
id: atom-editorlifecycle-how_not
title: EditorLifecycle
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

Do not reintroduce a whole-graph dirty flag or a Save Graph action: there is no backend for persisting the canvas, and a save that acknowledges without storing misleads the operator. Do not mark a document saved before POST /sldb/save returns.
