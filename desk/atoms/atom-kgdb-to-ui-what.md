---
id: atom-kgdb-to-ui-what
title: kgdb_to_ui_graph
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# kgdb_to_ui_graph

## Answer

kgdb_to_ui_graph is the backend adapter function that converts a kgdb `GraphSnapshot` into graph_ui's canonical `GraphData` contract. It lives in `src/adapters/kgdb_adapter.py` and is the verified bridge between kgdb graph data and graph_ui-shaped nodes and edges. Its output is backend graph data ready for UI consumption.
