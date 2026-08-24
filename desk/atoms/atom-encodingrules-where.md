---
id: atom-encodingrules-where
title: EncodingRules
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:encoding
provenance: docs/specs/matrix.graph-ui-views.yml
---

# EncodingRules

## Answer

EncodingRules lives in `apps/review-workbench/src/features/graph-editor/L2-canvas/encoding/encoding-rules.ts` in the L2 canvas layer. The active rule set is stored in `apps/review-workbench/src/stores/ui-store.ts`, and named views persist those rules through `apps/review-workbench/src/features/graph-editor/lib/projection-view-store.ts`. Those files together define the rules, hold the current selection, and serialize them into saved views.
