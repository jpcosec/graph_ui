---
id: atom-projectionviewstore-when
title: ProjectionViewStore
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore is used when the editor initializes, lists available views, loads one into the current session, saves a named view, or deletes a non-default view. It is especially active around the sidebar views flow and after reloads, because its persistence target is browser storage. In practice it is the view-memory layer of the editor session.
