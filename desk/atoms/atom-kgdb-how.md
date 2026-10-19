---
id: atom-kgdb-how
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

The read flow is: a `GraphSnapshot` is built from the `.sldb` store (`snapshot_save`/`snapshot_load` in sldb.api.graph), optionally narrowed with `query_snapshot` and a `StructuredQuery`, and `snapshot_to_ui_graph` converts it into the UI graph contract. The mindmap frontend talks to the store through `serve.py`, which serves local reads and proxies to `sldb serve` in remote mode. The review-workbench reads live documents through `sldb-provider.ts` (`/sldb/schema`, `/sldb/graph`, `/sldb/save` proxied by Vite) and writes one document at a time with `saveDoc`; it has no whole-graph save.
