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

DataProvider serves the L1 app layer (`GraphEditorPage` uses `graphDataProvider`) and the live pages (`AntoniaFlowPage`, `NodeInspector` use `sldbProvider`), which want a schema, a graph payload, and a save seam without caring about the backing store details. It also serves whoever extends the backend wiring, because integration happens behind one interface instead of leaking into canvas and store code.
