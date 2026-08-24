---
id: atom-layoutstrategies-why
title: LayoutStrategies
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

Graph-shaped data has no inherent screen positions, so nodes loaded from a source arrive without a readable spatial arrangement. LayoutStrategies exists to compute those positions automatically so the operator can read structure instead of manually dragging every node. A registry (rather than a single hardcoded algorithm) is used because different graphs read best under different arrangements — hierarchies under `dagre-layered`, radial/centered structures under `concentric-rings` — and named views can persist which strategy they use.
