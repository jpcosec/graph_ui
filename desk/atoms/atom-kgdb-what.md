---
id: atom-kgdb-what
title: Kgdb
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb is the target live graph source and persistence backend for graph_ui. In the intended flow it is the system that holds graph snapshots, returns a `GraphSnapshot` on read, and accepts write-back when the operator saves. It replaces the current fixture-backed data path with a real graph store.
