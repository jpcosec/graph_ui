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

It works by using page components that call data/build functions, prepare graph nodes and edges, and then call store and registry APIs before rendering `GraphEditor`. `GraphEditorPage.tsx` uses `useQuery`, `registerSchemaTypes`, `loadGraph`, and `graphToDomain`/`saveGraph`; `HumBodyPage.tsx` uses `buildHumViewGraph`, `registerHumNodeTypes`, `loadGraph`, and local draft state keyed by mode/routine/trace.
