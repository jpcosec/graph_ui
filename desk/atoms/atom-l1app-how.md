---
id: atom-l1app-how
title: L1App
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

It works by using a page component that calls data functions, prepares graph nodes and edges, and then calls store and registry APIs before rendering `GraphEditor`. `AntoniaFlowPage.tsx` loads the live (sldb serve) or fixture graph, registers models via `registerModelsFromSchema`, and calls `loadGraph`.
