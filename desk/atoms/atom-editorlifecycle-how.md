---
id: atom-editorlifecycle-how
title: EditorLifecycle
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

Per `state.editor-lifecycle.yml`, the session starts in `loading`, moves to `clean` on `data_ready`, and goes to `error` on `fetch_failed`. Semantic edits transition `clean` to `dirty` when they are not `isVisualOnly`; `dirty` transitions to `saving` on save; `saving` returns to `clean` on `persisted` with `markSaved`, or back to `dirty` on `save_failed`. A guarded reload sends `clean` back to `loading` only when the graph is not dirty.
