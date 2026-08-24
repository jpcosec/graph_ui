---
id: atom-graphcanvas-how
title: GraphCanvas
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:canvas
provenance: docs/specs/matrix.graph-ui-views.yml
---

# GraphCanvas

## Answer

It reads nodes, edges, and change handlers from the graph store and hidden relation types from the UI store. On each change it filters edges by relation type, keeps isolated nodes visible, maps AST structures into ReactFlow structures, and renders ReactFlow with NodeShell, GroupShell, FloatingEdge, and ButtonEdge.
