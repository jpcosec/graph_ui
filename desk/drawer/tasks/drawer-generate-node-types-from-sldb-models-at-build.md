---
id: drawer-generate-node-types-from-sldb-models-at-build
status: drawer
tags:
- workspace:desk
- artifact:task
- source:drawer
depends_on: []
atoms:
- atom-graph-ui-is-a-schema-driven-typed-editor-not-a-generic-canvas
- atom-graph-ui-node-types-must-not-be-hand-written-zod-generate-them-from-sldb-models-at-build
---

# Generate graph_ui node types from sldb models at build time

## Rationale

graph_ui already has `@/schema/registry` (NodeTypeRegistry) covering both typed
data and derived UI, but the type definitions are hand-written Zod in
`src/schema/register-defaults.ts`. The nucleus tesis requires the registry to be
populated FROM sldb models, not local definitions. This is the bridge where
"typed editor" meets "sldb nucleus".

## Goal

A build-time generator that turns one sldb model into a `NodeTypeDefinition`:
- `payloadSchema` (Zod) derived from the model's `Field`s.
- `allowedConnections` derived from the model's relation fields.
- `colorToken` / `category` derived from `__family__`.
- default renderers wired.

## Scope (spike first)

Start with ONE real sldb model (`ConversationStep`). Export it to a
schema/contract at build, generate its `NodeTypeDefinition`, register it, and
render a validated `ConversationStep` node in the canvas WITHOUT hand-writing
Zod.

## Decisions locked

- Generation runs at BUILD-TIME (export sldb models -> schema/contract ->
  graph_ui consumes), not runtime store reads.

## Done when

- A `ConversationStep` node type is present in the registry sourced from the
  sldb model, editable and validated, with no hand-written Zod for it.

## Open questions

- Export format of sldb models (JSON-schema? kgdb-adjacent contract?).
- Where the generator lives (sldb export sink vs graph_ui build step).
- Field -> Zod mapping for enums (`StepKind`) and relation fields.
