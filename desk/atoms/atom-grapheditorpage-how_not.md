---
id: atom-grapheditorpage-how_not
title: GraphEditorPage
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:data-loading
provenance: docs/specs/component.graph-ui.yml
---

# GraphEditorPage

## Answer

It must not be confused with the default mounted app path, because `src/App.tsx` currently mounts `HumBodyPage`, not `GraphEditorPage`. It also must not pretend persistence is real today: its `saveGraph` target is still a no-op provider path, so treating it as a live kgdb-backed save would be false.
