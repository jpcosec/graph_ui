---
id: atom-humbodypage-how
title: HumBodyPage
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# HumBodyPage

## Answer

It registers HUM node types with `registerHumNodeTypes(registry)`, builds or restores graphs with `buildHumViewGraph()`, loads them into `useGraphStore().loadGraph()`, and persists per-view drafts in `window.localStorage` under `hum-body-view-drafts`. It also drives mode tabs, routine and trace selectors, summary tiles, and the `GraphEditor` hero/workspace overlay props.
