---
id: atom-layoutstrategies-how
title: LayoutStrategies
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies is implemented as the `LAYOUT_STRATEGIES` registry in `layout-strategies.ts`, where each strategy exposes `computeLayout(nodes, edges, config)`. `dagre-layered` delegates to `computeDagreLayeredLayout`, while `concentric-rings` delegates to `computeConcentricRingsLayout`, and `getLayoutStrategy()` falls back to `DEFAULT_LAYOUT_STRATEGY_NAME` when needed. The `use-graph-layout` hook reads the active strategy name from UI state, runs the selected strategy, and applies the returned `{ id, position }` coordinates to existing nodes.
