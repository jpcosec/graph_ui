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

DataProvider serves the live page (`AntoniaFlowPage` reads through `sldbProvider`) and the inspector (`NodeInspector` saves through `sldbProvider.saveDoc`), which want a schema, a graph payload, and a per-document save seam without caring about the backing store details. It also serves whoever extends the backend wiring, because integration happens behind one interface instead of leaking into canvas and store code.
