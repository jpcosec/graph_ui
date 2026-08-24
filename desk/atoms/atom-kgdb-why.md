---
id: atom-kgdb-why
title: Kgdb
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb exists in the graph_ui design so the editor can operate on real graph data instead of frozen bundle fixtures. Without it, graph_ui can render and edit only in-memory or mock data, and a reload does not prove that semantic edits persisted anywhere durable. It is the missing backing store needed to turn the tool from a viewer into an editor with real round-trips.
