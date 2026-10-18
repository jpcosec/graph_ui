---
id: atom-kgdb-how_not
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

The graph layer must not remain only an implied future box in diagrams while the review-workbench provider keeps using hardcoded fixtures and a no-op save path. Integrations must not skip the adapter seam by forcing canvas code to understand raw `GraphSnapshot` structures directly. Long-term persistence should not be reduced to localStorage-only named views, because that stores view choices, not graph edits.
