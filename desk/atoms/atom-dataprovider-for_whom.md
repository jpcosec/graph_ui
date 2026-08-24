---
id: atom-dataprovider-for_whom
title: DataProvider
five_wh_one_plus: for_whom
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider serves the L1 app layer, especially `GraphEditorPage`, which wants a schema, a graph payload, and a save seam without caring about the backing store details. It also serves whoever wires graph_ui to a real backend later, because that integration can happen behind one interface instead of leaking into canvas and store code. Indirectly it serves the operator by being the place where real persistence will eventually happen.
