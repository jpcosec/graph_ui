---
id: atom-kgdb-how
title: Kgdb
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

The target read flow is: DataProvider asks Kgdb for a `GraphSnapshot`, Kgdb returns it, and `kgdb_to_ui_graph` converts it into the UI graph contract before `loadGraph(nodes, edges)` hydrates the store. The target write flow is: after canvas edits, DataProvider persists mutations back to Kgdb on save. The open questions are still unresolved: whether Kgdb is exposed as a server/API or as an on-disk library, and whether saves replace a whole snapshot or apply incremental node/edge mutations.
