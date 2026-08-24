---
id: atom-l1app-what
title: L1App
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

L1App is the application/orchestration layer of the React editor. It is responsible for page-level concerns: fetching or constructing graph data, registering node types, hydrating the graph store, and handing a prepared graph to the shared `GraphEditor` canvas surface. In this repo, `GraphEditorPage` and `HumBodyPage` are the concrete L1 pages.
