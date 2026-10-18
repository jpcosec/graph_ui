---
id: atom-kgdb-when
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

The graph layer belongs to the editor's open-and-save moments. Reads happen when the editor loads graph data (a snapshot built from the SLDB store and queried with `query_snapshot`); writes are document mutations against the store when the operator saves semantic edits. It is not part of visual-only actions like pan, zoom, or view selection.
