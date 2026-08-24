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

It must not be described as the generic editor path, because it is a HUM-specific page with its own overlays, modes, and mock data model. It also must not be treated as live-data persistence: its drafts are localStorage-backed and its underlying source is the static generated HUM AST fixture, not a real kgdb write path.
