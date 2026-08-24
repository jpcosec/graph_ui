---
id: atom-python-backend-how_not
title: Python Backend
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:backend
- topic:architecture
provenance: docs/specs/component.graph-ui.yml
---

# Python Backend

## Answer

The Python Backend must not take on frontend responsibilities such as ReactFlow rendering, sidebar behavior, or browser state. It also must not fragment into multiple incompatible graph contracts, because the verified design centers on one canonical `GraphData` model in `src/contracts/graph_data.py`. Grounded logic here stays contract-first and headless.
