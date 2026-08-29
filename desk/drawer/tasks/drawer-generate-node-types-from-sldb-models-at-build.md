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

Start with ONE model definition (`ConversationStep`). Generate its
`NodeTypeDefinition` at build from a JSON model-descriptor, register it, and
render a validated `ConversationStep` node in the canvas WITHOUT hand-writing
Zod for it.

## Decisions locked

- Generation runs at BUILD-TIME, following the exact pattern already used by
  `apps/review-workbench/scripts/generate-hum-ast.mjs` (invoked by the
  `hum:sync` npm script, which runs before `dev`, `build` and `test`).
- The spike does NOT wire a live sldb store read. It consumes a checked-in
  JSON model descriptor that mirrors the sldb model's fields. Live sldb export
  is a follow-up task. This keeps the spike self-contained and deterministic.

## Exact implementation contract

Working dir: `apps/review-workbench/`.

1. Create `src/schema/models/conversation-step.model.json` — a descriptor of
   the `ConversationStep` sldb model (source of truth:
   `/home/jp/proyectos/gemini_test/kb_agent/models/knowledge/step.py`). Shape:
   ```json
   {
     "typeId": "conversation-step",
     "label": "Conversation Step",
     "family": "conversation",
     "icon": "message-square",
     "fields": [
       {"name": "id", "kind": "string", "required": true},
       {"name": "title", "kind": "string", "required": true},
       {"name": "kind", "kind": "enum",
        "values": ["interaccion_simple","obtencion_datos","handout","llamado_tool"],
        "default": "interaccion_simple"},
       {"name": "instructions", "kind": "string", "required": true},
       {"name": "required_slots", "kind": "string"},
       {"name": "handout_target", "kind": "string"},
       {"name": "tool_ref", "kind": "string"},
       {"name": "allowed_transitions", "kind": "relation", "relationType": "flows_to"},
       {"name": "grounding_atoms", "kind": "relation", "relationType": "grounded_by"},
       {"name": "completion_condition", "kind": "string"}
     ]
   }
   ```
2. Create `scripts/generate-node-types.mjs` (mirror the structure of
   `scripts/generate-hum-ast.mjs`): read every `*.model.json` under
   `src/schema/models/`, emit `src/schema/generated-node-types.ts` exporting a
   `generatedNodeTypes: NodeTypeDefinition[]` array. Mapping rules:
   - `string` field -> `z.string()` (`.min(1)` when `required`, else
     `.optional()`).
   - `enum` field -> `z.enum([...])` (`.optional()` unless required; apply
     `.default()` when present).
   - `relation` field -> excluded from `payloadSchema`; its `relationType`
     value is collected; the set of distinct target typeIds it implies feeds
     `allowedConnections` (for the spike, if the descriptor lists no explicit
     targets, use `allowedConnections: ['conversation-step']`).
   - `colorToken` = `token-${family}`; `category` = `family`.
   - `renderers`: reuse the placeholder/EntityCard pattern from
     `register-defaults.ts` (import and factor it, or duplicate the tiny
     helpers). Do NOT invent new renderer components.
   - `defaultSize`: `{ width: 220, height: 100 }`.
3. Wire generation into build: add the generator call to the `hum:sync` script
   in `package.json` (either extend `hum:sync` to run both generators, or add
   the call inside `generate-hum-ast.mjs`'s flow — prefer a combined
   `hum:sync` that runs `generate-hum-ast.mjs` then `generate-node-types.mjs`).
4. Register generated types: in `src/schema/register-defaults.ts`, import
   `generatedNodeTypes` and register them inside `registerDefaultNodeTypes()`
   via the existing `registerIfMissing` path, AFTER the built-in defaults.
5. Add a unit test `src/schema/generate-node-types.test.ts` (vitest) that:
   - imports `generatedNodeTypes`,
   - asserts a `conversation-step` type exists with the 8 non-relation fields
     in its `payloadSchema` (validate a good payload passes, a bad one — e.g.
     missing `instructions` — fails),
   - asserts `allowedConnections` is non-empty.

## Guardrails

- Do NOT hand-write Zod for `conversation-step` in `register-defaults.ts`; it
  must come from the generator.
- Do NOT read a live sldb store in this task.
- Keep the existing built-in node types working (regression: their tests must
  still pass).
- `generated-node-types.ts` is a build artifact; it MAY be committed but must
  be reproducible by running `npm run hum:sync`.

## Done when

- `npm run hum:sync` (in `apps/review-workbench/`) regenerates
  `src/schema/generated-node-types.ts` deterministically.
- `conversation-step` is present in the registry sourced from the descriptor,
  validated, with no hand-written Zod for it.
- `npx vitest run` passes, including the new
  `src/schema/generate-node-types.test.ts` and existing schema tests.

## Files expected to change

- `apps/review-workbench/src/schema/models/conversation-step.model.json` (new)
- `apps/review-workbench/scripts/generate-node-types.mjs` (new)
- `apps/review-workbench/src/schema/generated-node-types.ts` (new, generated)
- `apps/review-workbench/src/schema/register-defaults.ts` (edit)
- `apps/review-workbench/package.json` (edit `hum:sync`)
- `apps/review-workbench/src/schema/generate-node-types.test.ts` (new)
