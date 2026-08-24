---
id: atom-viewssection-how_not
title: ViewsSection
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:views
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ViewsSection

## Answer

ViewsSection does not save graph content or node edits. It also must not save literal node ids in encoding rules, because ProjectionViewStore rejects views whose rule references match node-id patterns instead of facet or relation names.
