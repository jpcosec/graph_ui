---
id: atom-dataprovider-what
title: DataProvider
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider is the frontend boundary that supplies the editor with its graph data and schema, and accepts save requests. `sldbProvider` in `sldb-provider.ts` implements `SldbDataProvider`: it reads `/sldb/schema` and `/sldb/graph` and saves one document with `saveDoc` (POST `/sldb/save`). There is no whole-graph save and no mock provider.
