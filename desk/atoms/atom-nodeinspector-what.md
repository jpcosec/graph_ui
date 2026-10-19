---
id: atom-nodeinspector-what
title: NodeInspector
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# NodeInspector

## Answer

NodeInspector is the side sheet for editing a focused node, opened by double click on the node. For nodes whose type has typed fields it renders one editor per field and saves the document through `sldbProvider.saveDoc` (POST /sldb/save); otherwise it falls back to a name plus key-value properties form that writes back to the graph store.
