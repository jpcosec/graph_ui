---
id: atom-kgdb-where
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

The graph layer lives in the sldb package (`sldb.api.graph`), a declared dependency of graph_ui (`structuredLanguageDB` in `pyproject.toml`). In this repo the in-repo bridge is `src/adapters/snapshot_adapter.py`, where `snapshot_to_ui_graph` maps `GraphSnapshot` data into graph_ui's `GraphData` contract; `tests/test_snapshot_adapter.py` and `tests/test_sldb_end_to_end.py` exercise it. Specs under `docs/specs/` (`sequence.data-load-target.yml`, `deployment.runtime.yml`, `component.graph-ui.yml`) now name it as sldb.api.graph / `formerly kgdb`.
