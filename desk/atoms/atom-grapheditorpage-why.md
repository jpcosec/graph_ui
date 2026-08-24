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

It exists to provide a generic editor boot path that is separate from the HUM-specific page. That keeps the editor capable of loading arbitrary graph-shaped data through a provider instead of tying the whole app to the current HUM mock flow.
