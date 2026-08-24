---
id: atom-grapheditorpage-what
title: GraphEditorPage
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

GraphEditorPage is the generic L1 page for the graph editor path. It fetches schema and graph data through `graphDataProvider`, registers node types into the registry, hydrates the graph store, and renders `GraphEditor` with a generic load/error/ready flow. It is the reusable page-level entry for non-HUM graph editing.
