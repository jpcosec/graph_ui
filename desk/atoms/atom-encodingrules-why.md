---
id: atom-encodingrules-why
title: EncodingRules
five_wh_one_plus: why
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules exists so the editor can make graph structure legible without hardcoding styling logic into every renderer. Relation types such as `calls`, `reads`, and `inherited` need distinct strokes, and node categories need distinct color tokens, so the operator can visually parse the graph. Keeping this as a separate rule system also lets named views save a visual projection without changing the underlying graph data.
