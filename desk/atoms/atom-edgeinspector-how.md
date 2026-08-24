---
id: atom-edgeinspector-how
title: EdgeInspector
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EdgeInspector

## Answer

It reads focusedEdgeId from the UI store, finds the matching edge in the graph store, and mirrors relationType into local draft state. Saving calls graphStore.updateEdge with the new relation type while preserving the existing edge properties, then closes the sheet and returns the editor to browse mode.
