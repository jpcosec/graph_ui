---
id: atom-staticfixtures-where
title: StaticFixtures
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:data-loading
- layer:runtime
provenance: docs/specs/sequence.data-load.yml
---

# StaticFixtures

## Answer

The exact fixture files are `apps/review-workbench/src/mock/fixtures/graph_data.json` and `apps/review-workbench/src/features/antonia-flow/antonia-fixture.generated.json`. The current consumers are `apps/review-workbench/src/mock/client.ts` and `apps/review-workbench/src/features/antonia-flow/lib/adapter.ts`, and the flow is documented in `docs/specs/sequence.data-load.yml`. Those are the precise paths that define StaticFixtures today.
