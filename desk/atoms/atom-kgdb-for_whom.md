---
id: atom-kgdb-for_whom
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

sldb.api.graph serves graph_ui as the typed graph layer over the SLDB store for live graph reads. It also serves operators indirectly, because real store-backed documents are what make their edits survive reloads and become reviewable state instead of transient UI changes. For implementers, it is the dependency the snapshot adapter and the frontend data sources integrate with.
