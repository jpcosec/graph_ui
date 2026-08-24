---
id: atom-layoutstrategies-where
title: LayoutStrategies
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies lives in `apps/review-workbench/src/features/graph-editor/L2-canvas/layout/layout-strategies.ts` as part of the L2 canvas layer. The code that invokes it is the `use-graph-layout` hook in `apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-graph-layout.ts`. Together those files define the available strategies and the call site that applies them to the canvas.
