---
id: atom-kgdb-how_not
title: Kgdb
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb must not remain only an implied future box in diagrams while graph_ui keeps using hardcoded fixtures and a no-op save path. The integration also must not skip the adapter seam by forcing canvas code to understand raw backend graph structures directly. Long-term persistence should not be reduced to localStorage-only named views, because that stores view choices, not graph edits.
