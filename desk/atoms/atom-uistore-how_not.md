---
id: atom-uistore-how_not
title: UiStore
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore must not become a second graph database; it should not own nodes, edges, or semantic undo history. It must not persist operator edits by itself, because save and dirty tracking live elsewhere, and its filters should not be mistaken for permanent graph mutations. It also must not blur browse and edit modes together, since keyboard and panel behavior depends on the explicit `EditorState` values.
