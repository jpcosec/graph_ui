---
id: atom-graphcanvas-how_not
title: GraphCanvas
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:canvas
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphCanvas

## Answer

GraphCanvas does not own graph persistence, schema registration, or sidebar controls. It does not define the filter state either: the filters live in the UI store and FiltersSection edits them, while GraphCanvas.tsx only applies them through applyCanvasFilters before rendering.
