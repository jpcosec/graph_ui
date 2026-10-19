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

It makes explicit which edits survive a reload. AntoniaFlowPage persists one document at a time (NodeInspector -> sldbProvider.saveDoc -> POST /sldb/save); the earlier whole-graph save (isDirty/markSaved, saveGraph) was a no-op and was removed in 56ad840, so the lifecycle no longer pretends the canvas is savable.
