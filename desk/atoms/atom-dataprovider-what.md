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

DataProvider is the frontend boundary that supplies the editor with its graph data and schema, and accepts save requests. It is exposed as the `graphDataProvider` object implementing `GraphDataProvider` with three methods: `getSchema()`, `getGraph()`, and `saveGraph(payload)`. It abstracts the data source from L1, so the editor does not care whether data comes from a static fixture or a live kgdb backend. Today it delegates reads to `mockClient` and its `saveGraph` is a stub.
