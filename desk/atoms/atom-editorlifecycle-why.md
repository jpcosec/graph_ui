---
id: atom-editorlifecycle-why
title: EditorLifecycle
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

EditorLifecycle exists so graph_ui can separate initial loading, editable clean state, unsaved semantic work, persistence attempts, and failures. That distinction matters because the editor should not treat all changes the same: semantic edits must make the graph dirty, while visual-only changes should not. It is the behavioral contract behind save, reload, and dirty-state expectations.
