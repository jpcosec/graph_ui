---
id: atom-layoutstrategies-how_not
title: LayoutStrategies
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies must not own filtering, encoding, or persistence; its job is only node positioning. It must not change graph semantics, add or remove elements, or rewrite node payloads, because its output is limited to positions for nodes that already exist. It also must not assume a single layout fits every graph, which is why the code keeps a named registry instead of one hardcoded algorithm.
