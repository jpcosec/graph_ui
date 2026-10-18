---
id: atom-kgdb-why
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

The graph layer exists in the graph_ui design so the editor operates on real graph data from the SLDB store instead of frozen bundle fixtures. It is now provided by sldb.api.graph rather than a separate kgdb project. The mindmap frontend reads and writes the real store; the older review-workbench provider (`data-provider.ts`) still serves a mock graph and a no-op save, so there a reload does not prove semantic edits persisted.
