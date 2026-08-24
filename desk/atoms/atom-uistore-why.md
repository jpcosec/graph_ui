---
id: atom-uistore-why
title: UiStore
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# UiStore

## Answer

UiStore exists so UI concerns stay separate from graph semantics. The editor needs to remember filters, dialog state, active layout and encoding choices, and browse-versus-edit mode, but those values should not pollute GraphStore's node and edge history. Keeping them separate lets the UI evolve without turning every sidebar toggle or modal open event into a graph mutation.
