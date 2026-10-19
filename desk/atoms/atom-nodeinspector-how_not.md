---
id: atom-nodeinspector-how_not
title: NodeInspector
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# NodeInspector

## Answer

NodeInspector does not change the node type or the schema definition. It only edits the focused node's draft; the typed path persists that one document through `sldbProvider.saveDoc`, and the fallback path writes only title and properties into the current graph store entry. Graph-level save remains owned by the page.
