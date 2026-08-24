---
id: atom-editorlifecycle-for_whom
title: EditorLifecycle
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

EditorLifecycle serves the frontend code that needs consistent rules for dirty state, save transitions, and error recovery. It also serves the human using the editor, because their expectations about whether work is loaded, unsaved, saved, or failed depend on this model being coherent. It is a contract for both runtime logic and user trust.
