---
id: atom-layoutstrategies-for_whom
title: LayoutStrategies
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:layout
provenance: docs/specs/matrix.graph-ui-views.yml
---

# LayoutStrategies

## Answer

LayoutStrategies is for the L2 canvas code that needs computed positions and for operators who need a readable graph without manual dragging of every node. `ViewSection` and related layout controls depend on it to offer named layout choices. Saved projection views also consume its strategy names so a view can restore the intended arrangement style.
