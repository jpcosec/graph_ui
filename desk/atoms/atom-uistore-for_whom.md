---
id: atom-uistore-for_whom
title: UiStore
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore is for frontend components that manage the operator's session experience, especially sidebar sections, command and delete dialogs, and keyboard interaction hooks. It also serves the operator indirectly by remembering the active view, active layout, and current filters while they work. Any UI element that is not the graph's semantic data but still needs shared state depends on this store.
