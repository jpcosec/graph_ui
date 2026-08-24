---
id: atom-l1app-how_not
title: L1App
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

L1App must not own low-level canvas interaction like edge buttons, minimap behavior, or keyboard shortcuts; those belong in L2. It also must not let domain data bypass registry/store setup, because the point of L1 is to normalize page-specific input before the canvas renders it.
