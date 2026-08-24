---
id: atom-projectionviewstore-where
title: ProjectionViewStore
five_wh_one_plus: where
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore lives in `apps/review-workbench/src/features/graph-editor/lib/projection-view-store.ts` in the frontend lib layer. It is consumed by the views sidebar flow and coordinated with UI state that tracks the active view id. That file contains the data shape, storage resolution, validation guard, and CRUD methods for named views.
