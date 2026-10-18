---
id: atom-kgdb-what
title: sldb.api.graph (formerly kgdb)
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# sldb.api.graph (formerly kgdb)

## Answer

sldb.api.graph (formerly the separate kgdb project, merged into sldb in 6deb222) is the typed graph layer graph_ui consumes. It provides `GraphSnapshot`, `KnowledgeNode`, `Edge`, `snapshot_save`/`snapshot_load` and `query_snapshot`, over documents that live in the SLDB store (`.sldb/`). graph_ui builds a snapshot from that store and adapts it into its own contract; it does not keep a separate graph store.
