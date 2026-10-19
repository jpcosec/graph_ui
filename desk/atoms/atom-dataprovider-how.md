---
id: atom-dataprovider-how
title: DataProvider
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

`graphDataProvider` (`data-provider.ts`, interface `GraphDataProvider`) returns an in-file `mockSchema`, delegates `getGraph()` to `mockClient.getGraph()`, and `saveGraph(_payload)` returns `{ ok: true }` without writing; `GraphEditorPage` is its only consumer. The live editor path (`AntoniaFlowPage`, `NodeInspector`) uses `sldbProvider` from `sldb-provider.ts`, which fetches `/sldb/schema` and `/sldb/graph` and persists with `saveDoc` via POST `/sldb/save`. The target flow in `sequence.data-load-target.yml` (GraphSnapshot via sldb.api.graph, adapted with snapshot_to_ui_graph, write-back on save) is still the spec.
