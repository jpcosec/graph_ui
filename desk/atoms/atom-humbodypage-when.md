---
id: atom-humbodypage-when
title: HumBodyPage
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# HumBodyPage

## Answer

It runs at app boot right now, because `src/App.tsx` mounts `HumBodyPage` inside the shell. After boot it recomputes or reloads drafts when mode, routine, trace, or stored local draft state changes.
