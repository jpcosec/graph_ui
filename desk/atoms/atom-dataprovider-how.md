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

`sldbProvider` (`sldb-provider.ts`, interface `SldbDataProvider`) fetches `/sldb/schema` and `/sldb/graph` (getSchema/getGraph, cached once) and persists a single document with `saveDoc(docId, payload)` via POST `/sldb/save`; Vite proxies `/sldb/*` to `sldb serve`. `AntoniaFlowPage` loads schema and documents through it and `NodeInspector` saves through it. The response types live in `lib/sldb-types.ts`. The target flow in `sequence.data-load-target.yml` (GraphSnapshot via sldb.api.graph, adapted with snapshot_to_ui_graph) is still the spec.
