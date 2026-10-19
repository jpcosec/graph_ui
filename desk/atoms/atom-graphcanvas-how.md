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

It reads nodes, edges, and change handlers from the graph store, and filters, focusedNodeId and editor state from the UI store. In an effect it runs applyCanvasFilters (hidden relation types, text, attribute, and hide-non-neighbors in focus mode, keeping isolated nodes visible), maps AST structures into ReactFlow structures, and renders ReactFlow with NodeShell, GroupShell, FloatingEdge, and ButtonEdge.
