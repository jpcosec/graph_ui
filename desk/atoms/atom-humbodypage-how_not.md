---
id: atom-humbodypage-how_not
title: HumBodyPage
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# HumBodyPage

## Answer

HumBodyPage no longer exists in the tree: it was removed in commit 9f64f0f (retire archived HUM view and focus on Mindmap). Historically it was a HUM-specific page, not the generic editor path, with its own overlays, modes and mock data model; its drafts were localStorage-backed and its source was the static generated HUM AST fixture, not a real sldb write path.
