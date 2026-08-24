---
id: atom-l1app-for_whom
title: L1App
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- layer:frontend
- topic:orchestration
provenance: docs/specs/component.graph-ui.yml
---

# L1App

## Answer

It is for downstream editor pages and adapters that need to plug a graph-shaped domain into the shared editor surface. It serves the operator indirectly by preparing the graph, but its direct consumers are `GraphEditor`, the schema registry, and the zustand stores.
