---
id: atom-kgdb-to-ui-why
title: kgdb_to_ui_graph
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# kgdb_to_ui_graph

## Answer

This adapter exists because graph_ui targets kgdb as its live graph source but does not natively consume `GraphSnapshot` objects. The grounding explicitly identifies `kgdb_to_ui_graph(GraphSnapshot) -> GraphData` as the read-side bridge. Without it, kgdb data would not arrive in the canonical graph_ui contract.
