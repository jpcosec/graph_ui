---
id: atom-kgdb-to-ui-why
title: snapshot_to_ui_graph
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# snapshot_to_ui_graph

## Answer

This adapter exists because graph_ui does not natively consume `GraphSnapshot` objects from sldb.api.graph. `snapshot_to_ui_graph(GraphSnapshot) -> GraphData` is the read-side bridge. Without it, sldb graph data would not arrive in the canonical graph_ui contract.
