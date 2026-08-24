---
id: atom-editorlifecycle-when
title: EditorLifecycle
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

EditorLifecycle applies for the entire duration of an editor session. It begins when schema and graph loading start, remains relevant through semantic edits and saves, and matters again on failure or reload. Every meaningful load/save/dirtiness transition belongs to this lifecycle.
