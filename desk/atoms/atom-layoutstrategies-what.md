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

LayoutStrategies is the pluggable registry of graph auto-layout algorithms for the canvas. It exposes a `LAYOUT_STRATEGIES` record mapping a strategy name to a `LayoutStrategy` object whose async `computeLayout(nodes, edges, config)` returns positioned nodes. Two strategies ship: `elk-layered` (the default, an elkjs layered layout) and `elk-rings` (breadth-first depth rings around a root). Each strategy consumes `LayoutNode`/`LayoutEdge` inputs plus `LayoutOptions` and produces a `LayoutResult` of `{ id, position }` entries.
