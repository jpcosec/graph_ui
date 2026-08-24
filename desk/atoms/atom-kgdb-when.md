---
id: atom-kgdb-when
title: Kgdb
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load-target.yml
---

# Kgdb

## Answer

Kgdb belongs to the editor's open-and-save moments. In the target sequence it is read when the operator opens the editor and DataProvider fetches graph data, and it is written when the operator saves after semantic edits. It is not part of visual-only actions like pan, zoom, or view selection.
