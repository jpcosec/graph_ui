---
id: atom-uistore-how
title: UiStore
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore is implemented in `ui-store.ts` with small focused setters such as `setEditorState()`, `setFilter()`, `clearFilters()`, `setActiveEncodingRules()`, `setActiveLayoutStrategy()`, and `setActiveViewId()`. It clones `DEFAULT_ENCODING_RULES` when seeding or resetting active rules, stages pending deletes until `executePendingDelete()` calls `removeElements()`, and provides `openCommandDialog()` / `closeCommandDialog()` for the palette flow. Its filter state combines hidden relation types, free-text search, attribute filtering, and neighbors-only mode into one UI-level projection state.
