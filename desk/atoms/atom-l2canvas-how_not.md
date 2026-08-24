---
id: atom-l2canvas-how_not
title: L2Canvas
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:canvas
provenance: docs/specs/component.graph-ui.yml
---

# L2Canvas

## Answer

L2Canvas must not fetch domain data or decide what a page means; that belongs in L1. It also must not collapse into passive rendering-only code, because its job is interactive editing, not just drawing nodes and edges from a fixture.
