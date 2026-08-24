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

The exact fixture files are `apps/review-workbench/src/features/hum-body/lib/generated-hum-ast.ts` and `apps/review-workbench/src/mock/fixtures/graph_data.json`. The current consumers are `apps/review-workbench/src/features/hum-body/lib/mock-data.ts` and `apps/review-workbench/src/mock/client.ts`, and the current flow is documented in `docs/specs/sequence.data-load.yml`. Those are the precise paths that define StaticFixtures today.
