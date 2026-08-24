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

DataProvider is implemented as the `graphDataProvider` object in `data-provider.ts`, conforming to the `GraphDataProvider` interface. Today `getSchema()` returns a small in-file `mockSchema`, `getGraph()` delegates to `mockClient.getGraph()`, and `saveGraph(_payload)` returns `{ ok: true }` without writing anything. The target flow in `sequence.data-load-target.yml` is for this boundary to fetch from kgdb, load the store with UI graph data, and later persist save requests back to kgdb.
