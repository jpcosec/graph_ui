---
id: atom-encodingrules-how_not
title: EncodingRules
five_wh_one_plus: how_not
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules must not be treated as the primary projection mechanism for deciding what the graph shows; filtering owns that role and encoding is secondary. It must not create, remove, or hide graph elements by itself, because its responsibility is styling, not graph selection or persistence. It also must not smuggle semantic meaning into literal node-id references, since saved projection views are supposed to reference facets and relation names instead.
