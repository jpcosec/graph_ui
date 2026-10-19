---
id: atom-grapheditorpage-why
title: GraphEditorPage
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

It exists to provide a generic editor boot path that loads arbitrary graph-shaped data through a provider instead of tying the app to one page. It is the generic counterpart to `AntoniaFlowPage`, which is the page `App.tsx` mounts today; the HUM-specific page it was contrasted with was retired.
