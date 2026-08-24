---
id: atom-viewsection-how_not
title: ViewSection
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ViewSection

## Answer

ViewSection does not persist graph data and it should not be treated as a semantic editor. In the current source, layout updates are written through updateNode with isVisualOnly: true, so auto-layout is a visual operation rather than a durable semantic change.
