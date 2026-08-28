---
id: drawer-express-gemini-flow-view-as-lens-over-kgdb
status: drawer
tags:
- workspace:desk
- artifact:task
- source:drawer
depends_on: []
atoms:
- atom-projection-is-layered-sldb-is-content-kgdb-is-graph-overlay-is-view
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
---

# Express gemini_test flow view as a declarative lens over kgdb

## Rationale

gemini_test resolves projection with three hardcoded server-side lenses
(`/api/taxonomy` by tags, `/api/viz/graph` by embeddings+PCA, `/api/flow` by
transitions). These are the exact anti-pattern graph_ui named. One concrete
case validates the projection grammar more than three specs.

## Goal

Take `/api/flow` (the cleanest: already a declared graph via
`allowed_transitions`) and express it as a declarative view over a kgdb
`GraphSnapshot`, using graph_ui's filter/encoding/layout overlay instead of a
bespoke endpoint.

## Scope

Single view. Prove graph_ui can render the ConversationStep flow from kgdb
with:
- filter by `relation_type = flows_to`
- layout directed
- encoding by `kind`

## Done when

- The flow graph renders in graph_ui from a kgdb snapshot, matching the
  bespoke `/api/flow` output, with no view-specific server code.

## Depends conceptually on

- ConversationStep node type available in graph_ui
  (drawer-generate-node-types-from-sldb-models-at-build).
