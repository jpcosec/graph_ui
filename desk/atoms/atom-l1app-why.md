---
id: atom-l1app-why
title: L1App
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

It exists to keep domain shaping and bootstrapping above the canvas so the editor core stays reusable. Without L1, data loading, schema registration, and page-specific behavior would leak into L2/L3 and make the editor less modular.
