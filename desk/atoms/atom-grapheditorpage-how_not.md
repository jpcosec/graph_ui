---
id: atom-grapheditorpage-how_not
title: GraphEditorPage
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

It must not be confused with the default mounted app path: `apps/review-workbench/src/App.tsx` mounts `AntoniaFlowPage`, not `GraphEditorPage`. It also must not pretend persistence is real through this page: its `saveGraph` target is still the no-op `graphDataProvider` path, so treating it as a live sldb-backed save would be false.
