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

DataProvider must not stay a permanent stub where `saveGraph()` always returns `{ ok: true }` and nothing is persisted. L1 pages should not bypass it by importing fixtures or talking to a backend directly, because that would hard-wire data access into UI orchestration. It is also not acceptable to let this boundary hide that the current data source is frozen bundle data instead of a live store.
