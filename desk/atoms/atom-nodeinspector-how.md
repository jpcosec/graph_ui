---
id: atom-nodeinspector-how
title: NodeInspector
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:editing
provenance: docs/specs/matrix.graph-ui-views.yml
---

# NodeInspector

## Answer

It derives the open node from focusedNodeId in the UI store, builds a local draft from the current node data, and uses PropertyEditor to edit key-value properties. On save it rewrites label or name fields when present, updates the payload value title or name, replaces properties, and calls graphStore.updateNode before closing back to browse mode.
