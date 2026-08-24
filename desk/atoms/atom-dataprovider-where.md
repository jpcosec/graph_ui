---
id: atom-dataprovider-where
title: DataProvider
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:data-loading
- layer:frontend
provenance: docs/specs/sequence.data-load-target.yml
---

# DataProvider

## Answer

DataProvider lives at `apps/review-workbench/src/features/graph-editor/lib/data-provider.ts` in the frontend L1/data-loading boundary. Its current read path reaches `apps/review-workbench/src/mock/client.ts`, and its intended runtime role is described in `docs/specs/sequence.data-load-target.yml`. Those are the exact code and spec locations that define it today.
