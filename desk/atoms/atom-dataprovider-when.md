---
id: atom-dataprovider-when
title: DataProvider
five_wh_one_plus: when
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider is used at the beginning of an editor session when L1 needs schema and graph data, and again when the operator saves. In the target sequence, it first fetches graph data on open and later handles the `save (Ctrl+S)` request after canvas edits have accumulated in the store. Its work belongs to the loading and saving phases of the editor lifecycle, not to low-level canvas interaction.
