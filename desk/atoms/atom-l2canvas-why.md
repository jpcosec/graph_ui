---
id: atom-l2canvas-why
title: L2Canvas
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:canvas
provenance: docs/specs/component.graph-ui.yml
---

# L2Canvas

## Answer

It exists so all graph interaction lives in one reusable layer instead of being reimplemented in every page. That separation lets L1 focus on data bootstrapping and lets L3 focus on presentation, while L2 carries the actual editing mechanics.
