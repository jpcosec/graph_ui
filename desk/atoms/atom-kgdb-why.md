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

The graph layer exists in the graph_ui design so the editor operates on real graph data from the SLDB store instead of frozen bundle fixtures. It is now provided by sldb.api.graph rather than a separate kgdb project. The mindmap frontend reads and writes the real store, and the review-workbench's Antonia page reads live documents via `sldb serve` and persists per document (`saveDoc`); canvas-level graph edits are not persisted there, so a reload does not show them.
