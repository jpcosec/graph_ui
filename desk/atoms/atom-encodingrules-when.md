---
id: atom-encodingrules-when
title: EncodingRules
five_wh_one_plus: when
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules is used whenever the canvas renders nodes or edges and needs the current visual style for a relation or node facet. It also matters when a projection view is saved, loaded, or reset, because the active rule set is part of the view state. In short, it applies during everyday render-time styling and during view-management flows.
