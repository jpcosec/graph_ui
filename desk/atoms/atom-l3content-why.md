---
id: atom-l3content-why
title: L3Content
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:rendering
provenance: docs/specs/component.graph-ui.yml
---

# L3Content

## Answer

It exists so content rendering can vary by node type without forcing L1 or L2 to know visual details. That keeps the editor extensible: pages and registries can swap renderer components while reusing the same canvas and store logic.
