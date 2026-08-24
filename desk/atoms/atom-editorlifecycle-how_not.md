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

EditorLifecycle must not treat visual-only changes like pan, zoom, or collapse as if they were semantic edits that dirty the graph. It also must not pretend a failed save returned the session to `clean`, because the unsaved edits still exist. Long-term, the lifecycle should not be used to hide a no-op persistence path behind a fake successful save.
