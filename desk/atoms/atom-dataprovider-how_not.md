---
id: atom-dataprovider-how_not
title: DataProvider
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider must not grow a whole-graph save that returns `{ ok: true }` without persisting; persistence is per document through `saveDoc`. L1 pages should not bypass it by importing fixtures or talking to a backend directly, because that would hard-wire data access into UI orchestration. The explicit `?src=fixture` fallback of `AntoniaFlowPage` must not be mistaken for the live store.
