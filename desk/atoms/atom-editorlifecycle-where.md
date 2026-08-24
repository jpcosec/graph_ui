---
id: atom-editorlifecycle-where
title: EditorLifecycle
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:editing
- layer:runtime
provenance: docs/specs/state.editor-lifecycle.yml
---

# EditorLifecycle

## Answer

The lifecycle is specified explicitly in `docs/specs/state.editor-lifecycle.yml`. Its concrete frontend support lives in `apps/review-workbench/src/stores/graph-store.ts` through concepts like `isDirty`, semantic actions, and `markSaved`, and in `apps/review-workbench/src/features/graph-editor/L1-app/GraphEditorPage.tsx` where save success calls `markSaved`. Those are the exact spec and code paths that define EditorLifecycle today.
