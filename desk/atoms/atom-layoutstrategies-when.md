---
id: atom-layoutstrategies-when
title: LayoutStrategies
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies is used when the editor needs an automatic arrangement for the current graph. In practice that happens from the canvas layout flow driven by `use-graph-layout`, typically after the operator chooses or triggers an auto-layout action. The chosen strategy name can also be stored in a projection view so the same arrangement style is reused later.
