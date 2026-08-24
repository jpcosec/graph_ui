---
id: atom-projectionviewstore-why
title: ProjectionViewStore
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore exists because operators need to reuse visual perspectives without duplicating or mutating the underlying graph. A saved view can capture a chosen layout strategy and encoding rule set, which is different from saving nodes and edges themselves. Keeping that concern separate allows the editor to preserve reusable reading surfaces while the graph data source remains unchanged.
