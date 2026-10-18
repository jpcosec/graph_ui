---
id: atom-kgdb-to-ui-what
title: snapshot_to_ui_graph
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# snapshot_to_ui_graph

## Answer

snapshot_to_ui_graph is the backend adapter function that converts an sldb `GraphSnapshot` (sldb.api.graph) into graph_ui's canonical `GraphData` contract. It lives in `src/adapters/snapshot_adapter.py` (formerly `kgdb_adapter.py` / `kgdb_to_ui_graph`) and is the verified bridge between sldb graph data and graph_ui-shaped nodes and edges. Its output is backend graph data ready for UI consumption.
