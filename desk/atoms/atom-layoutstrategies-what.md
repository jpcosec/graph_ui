---
id: atom-layoutstrategies-what
title: LayoutStrategies
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies is the pluggable registry of graph auto-layout algorithms for the canvas. It exposes a `LAYOUT_STRATEGIES` record mapping a strategy name to a `LayoutStrategy` object whose `computeLayout(nodes, edges, config)` returns positioned nodes. Two strategies ship: `dagre-layered` (the default, directed layered layout) and `concentric-rings` (breadth-first depth rings around a root). Each strategy consumes `LayoutNode`/`LayoutEdge` inputs plus `LayoutOptions` and produces a `LayoutResult` of `{ id, position }` entries.
