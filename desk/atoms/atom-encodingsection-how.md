---
id: atom-encodingsection-how
title: EncodingSection
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:canvas
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingSection

## Answer

It reads activeEncodingRules from the UI store, renders each rule with a human-readable description, and opens inline controls for style edits. Changes call setActiveEncodingRules, reset can restore defaults, and any manual style edit clears the activeViewId so the UI no longer claims an untouched saved view.
