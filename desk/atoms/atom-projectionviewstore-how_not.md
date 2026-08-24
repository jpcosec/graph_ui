---
id: atom-projectionviewstore-how_not
title: ProjectionViewStore
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore must not store the graph itself; it only stores view metadata such as encoding and layout choices. It must not allow literal node-id references inside encoding rules, because views are supposed to stay stable across graph changes by naming facets and relations instead. It also must not delete the seeded default view, which the implementation explicitly protects.
