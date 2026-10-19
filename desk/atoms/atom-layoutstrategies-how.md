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

LayoutStrategies is implemented as the `LAYOUT_STRATEGIES` registry in `layout-strategies.ts`, where each strategy exposes `computeLayout(nodes, edges, config)`. `elk-layered` delegates to `computeElkLayeredLayout` (elkjs), while `elk-rings` delegates to `computeElkRingsLayout`, and `getLayoutStrategy()` falls back to `DEFAULT_LAYOUT_STRATEGY_NAME` when needed. The `use-graph-layout` hook reads the active strategy name from the UI store, runs the selected strategy on measured node sizes, and applies the returned `{ id, position }` coordinates to existing nodes as visual-only updates.
