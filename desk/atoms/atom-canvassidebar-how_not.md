---
id: atom-canvassidebar-how_not
title: CanvasSidebar
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:canvas
provenance: docs/specs/matrix.graph-ui-views.yml
---

# CanvasSidebar

## Answer

CanvasSidebar is not the graph renderer and it does not implement the business logic of each tool directly. It composes the section components instead of duplicating their save, filter, layout, or view logic here.
