---
id: atom-encodingrules-how
title: EncodingRules
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules is implemented in `encoding-rules.ts` as arrays of `EncodingRule` objects for default node and edge cases. `resolveEdgeStyle()` finds a matching relation rule and returns stroke color, width, dash pattern, and relation-specific opacity, while `resolveNodeStyle()` reads the requested facet from `ASTNode.data` or `payload.value` and resolves a node color token. The UI store keeps a cloned `activeEncodingRules` array so views and sidebar controls can swap rule sets without mutating the defaults.
