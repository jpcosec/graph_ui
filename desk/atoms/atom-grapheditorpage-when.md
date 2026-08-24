---
id: atom-grapheditorpage-when
title: GraphEditorPage
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

It runs when the generic editor page is mounted and whenever schema/data query state changes enough to move between loading, error, and ready states. It also participates on save attempts when the graph store is dirty.
