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

Target architecture: replace the static baked fixture with the sldb store as the live data source, both directions. Read path: sldb.api.graph GraphSnapshot -> snapshot_to_ui_graph adapter (already exists at src/adapters/snapshot_adapter.py) -> UI node/edge contract consumed by the editor. Write path: operator edits in the canvas -> graphToDomain -> a real saveGraph that writes back to the store (in the review-workbench data-provider.ts it is still a no-op; the mindmap's source/ layer performs real mutations). Questions that were open with kgdb are partly answered: kgdb is no longer a separate repo, sldb.api.graph is a Python library (snapshot_save/snapshot_load, query_snapshot) and sldb serve is the HTTP surface; the write contract and whether edits are whole-snapshot replace or incremental mutations remain to be confirmed against sldb. graph_ui already owns the read adapter and the projection/RelationFilter machinery; for the review-workbench what is missing is a live data provider (replace mockClient) and a persisting save.
