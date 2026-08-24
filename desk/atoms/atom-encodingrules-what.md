---
id: atom-encodingrules-what
title: EncodingRules
five_wh_one_plus: what
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules is the frontend rule set that maps graph facts to visual styling for nodes and edges. Each rule has a `when` clause keyed by `relationType`, `nodeFacet`, and optional `facetValue`, plus a `style` block for stroke or node color choices. The module exports `DEFAULT_ENCODING_RULES` along with `resolveEdgeStyle()` and `resolveNodeStyle()` so the canvas can derive consistent visuals from the current rules.
