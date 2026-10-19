---
id: atom-graph-ui-should-read-and-write-graph-data-directly-over-kgdb
title: graph_ui should read and write graph data directly over sldb.api.graph
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:intent
- topic:kgdb
- topic:data-loading
---

# graph_ui should read and write graph data directly over sldb.api.graph

## Answer

Target architecture: the sldb store is the live data source, both directions. Read path: sldb.api.graph GraphSnapshot -> snapshot_to_ui_graph adapter (src/adapters/snapshot_adapter.py) -> UI node/edge contract. Write path: operator edits in the canvas -> a real save that writes back to the store. Status: the mindmap already reads and writes the real store (frontends/mindmap/source/ layer, optionally via sldb serve with GRAPH_UI_BACKEND=remote). In the review-workbench the live read exists (features/graph-editor/lib/sldb-provider.ts over /sldb/*; mockClient remains in data-provider.ts as the fallback provider), saveDoc persists single documents, but saveGraph is still a no-op. kgdb is no longer a separate repo: sldb.api.graph is a Python library (snapshot_save/snapshot_load, query_snapshot) and sldb serve is the HTTP surface; whether edits are whole-snapshot replace or incremental mutations remains to be confirmed against sldb.
