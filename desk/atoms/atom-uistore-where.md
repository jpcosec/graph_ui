---
id: atom-uistore-where
title: UiStore
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore lives in `apps/review-workbench/src/stores/ui-store.ts` in the frontend stores layer. It is read by L2 canvas components such as sidebar sections, keyboard handlers, and dialog flows that need session-level UI state. The file is the central implementation of editor mode, filter, and dialog state on the client.
