---
id: atom-projectionviewstore-what
title: ProjectionViewStore
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore is the frontend store object that manages named projection views over the graph. A `ProjectionView` contains a `view_id`, `label`, `encoding` rules, `layout_strategy`, and optional creator metadata, and the store supports `load()`, `save()`, `list()`, and `delete()`. It persists view definitions separately from graph content so the editor can remember visual projections across reloads.
