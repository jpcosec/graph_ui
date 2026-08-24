---
id: atom-grapheditorpage-how
title: GraphEditorPage
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

It uses TanStack Query to call `graphDataProvider.getSchema()` and `graphDataProvider.getGraph()`, then `registerSchemaTypes()` to seed the registry and `useGraphStore().loadGraph()` to hydrate nodes and edges. On save it reads the current store, converts with `graphToDomain`, and calls `graphDataProvider.saveGraph()` through a mutation before `markSaved()` on success.
