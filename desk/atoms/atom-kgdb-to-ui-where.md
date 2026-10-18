---
id: atom-kgdb-to-ui-where
title: snapshot_to_ui_graph
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:backend
- topic:adapters
provenance: docs/specs/component.graph-ui.yml
---

# snapshot_to_ui_graph

## Answer

The adapter lives in `src/adapters/snapshot_adapter.py` in the backend layer (renamed from `kgdb_adapter.py`). That file imports `GraphSnapshot` and `KnowledgeNode` from `sldb.api.graph` and imports `GraphData`, `UIEdge`, and `UINode` from graph_ui's contract module. All conversion helpers used by the adapter are defined in the same file.
