---
id: atom-dataprovider-what
title: DataProvider
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider is the frontend boundary that supplies the editor with its graph data and schema, and accepts save requests. `graphDataProvider` in `data-provider.ts` implements `GraphDataProvider` (`getSchema()`, `getGraph()`, `saveGraph(payload)`) over a mock: it reads from `mockClient` and its `saveGraph` is a stub. The live path is `sldbProvider` in `sldb-provider.ts`, which reads `/sldb/schema` and `/sldb/graph` and saves a document with `saveDoc` (POST `/sldb/save`).
