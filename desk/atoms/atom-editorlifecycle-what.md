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

EditorLifecycle is the state model that describes a graph editing session moving through loading, clean, dirty, saving, and error. In the state spec it is the `GraphSession` entity and it captures when the editor has loaded data, has unsaved semantic edits, is persisting, or has failed. It is the conceptual lifecycle around graph state rather than a visible UI widget.
