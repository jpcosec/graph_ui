---
id: atom-projectionviewstore-how
title: ProjectionViewStore
five_wh_one_plus: how
tags:
- system:graph_ui
- layer:frontend
- topic:stores
provenance: docs/specs/matrix.graph-ui-views.yml
---

# ProjectionViewStore

## Answer

ProjectionViewStore is implemented in `projection-view-store.ts` over a `StorageLike` interface that resolves to `localStorage` when available and an in-memory fallback otherwise. `ensureSeeded()` guarantees a `default-view`, `save()` clones encoding rules and stamps `created_at`, `list()` returns cloned view objects, and `delete()` refuses to remove the default view. Before saving, `findLiteralNodeIdReferences()` scans encoding rules and throws if a view embeds literal node ids instead of facet and relation names.
