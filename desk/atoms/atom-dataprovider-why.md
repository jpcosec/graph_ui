---
id: atom-dataprovider-why
title: DataProvider
five_wh_one_plus: why
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider exists to decouple the editor's L1 orchestration from any specific data source. By funneling schema, graph reads, and saves through one interface, the editor can swap a mock fixture for a live kgdb backend without touching canvas, stores, or UI code. This indirection is what makes the planned migration to kgdb a localized change rather than a rewrite. It also gives a single seam to add persistence, validation, and error handling for load and save.
