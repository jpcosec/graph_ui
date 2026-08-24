---
id: atom-kgdb-where
title: Kgdb
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb appears as the target backend in `docs/specs/sequence.data-load-target.yml` and `docs/specs/deployment.runtime.yml`. The in-repo bridge to it is `src/adapters/kgdb_adapter.py`, where `kgdb_to_ui_graph` maps `GraphSnapshot` data into graph_ui's `GraphData` contract. Those are the exact places where the current repository names and connects to Kgdb.
