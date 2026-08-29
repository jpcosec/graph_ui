---
id: task-generate-graph-ui-node-types-from-sldb-models-at-build-time
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-generate-graph-ui-node-types-from-sldb-models-at-build-time
current_node: checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-execution-ready
history: []
references:
- desk/drawer/tasks/drawer-generate-node-types-from-sldb-models-at-build.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
- desk/contexts/pill-guardrail-the-model-descriptor-is-a-real-contract-mirror-not-a-mock.md
files:
- apps/review-workbench/src/schema/models/conversation-step.model.json
- apps/review-workbench/scripts/generate-node-types.mjs
- apps/review-workbench/src/schema/generated-node-types.ts
- apps/review-workbench/src/schema/renderer-helpers.ts
- apps/review-workbench/src/schema/register-defaults.ts
- apps/review-workbench/package.json
- apps/review-workbench/src/schema/generate-node-types.test.ts
checklists:
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-execution-ready
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-testing-ready
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Generate graph_ui node types from sldb models at build time

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

A build-time generator that turns one sldb model into a `NodeTypeDefinition`:
- `payloadSchema` (Zod) derived from the model's `Field`s.
- `allowedConnections` derived from the model's relation fields.
- `colorToken` / `category` derived from `__family__`.
- default renderers wired.

## Scope

IN scope: a build-time generator that turns ONE checked-in JSON model
descriptor (`conversation-step`) into a `NodeTypeDefinition`, wired into the
`hum:sync` build step and registered alongside the existing built-in node
types. OUT of scope: any live sldb store read, any second model, any change to
existing built-in node types.

This is a NEW node type. There is currently NO `conversation-step` entry in
`register-defaults.ts` to replace — you ADD it via the generator, you do not
remove anything.

## Implementation Path

Working dir: `apps/review-workbench/`. Generation runs at BUILD-TIME, mirroring
`scripts/generate-hum-ast.mjs` (invoked by the `hum:sync` npm script, which
runs before `dev`, `build`, `test`). No live sldb read; consume a checked-in
JSON descriptor. Follow these steps EXACTLY.

### Step 1 — create the model descriptor (verified against the real model)

Create `src/schema/models/conversation-step.model.json`. Its fields MUST be a
faithful transcription of the real sldb model. Source of truth to open and
verify field-by-field BEFORE writing:
`/home/jp/proyectos/gemini_test/kb_agent/models/knowledge/step.py`
(class `ConversationStep`, enum `StepKind`).

IMPORTANT modeling rule (Option B — faithful + relation hint): in the real
model, `allowed_transitions` and `grounding_atoms` are `str` fields (they hold
relation targets as text — the very anti-pattern the relation-model task will
later fix). The descriptor MUST keep their `kind` as `"string"` (faithful), and
ADDITIONALLY carry an optional `"projectsAs"` hint naming the relation they
represent. The generator treats a `string` field normally for `payloadSchema`,
and a field carrying `projectsAs` ALSO contributes to `allowedConnections`.
This captures the relation intent without lying about the field's real type.

The descriptor content is exactly (this DOES match `step.py`; all 12 fields
present, `tags` and `domain_ref` included):

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
    {"name": "allowed_transitions", "kind": "string", "projectsAs": "flows_to"},
    {"name": "grounding_atoms", "kind": "string", "projectsAs": "grounded_by"},
    {"name": "tags", "kind": "stringlist"},
    {"name": "domain_ref", "kind": "string"},
    {"name": "completion_condition", "kind": "string"}
  ]
}
```

Field kinds correspond to the real Python types in `step.py`:
- `id`, `title`, `instructions`, `required_slots`, `handout_target`,
  `tool_ref`, `allowed_transitions`, `grounding_atoms`, `domain_ref`,
  `completion_condition` -> Python `str` (or `str | None`) -> `kind: "string"`.
- `kind` -> Python `StepKind` (StrEnum) -> `kind: "enum"`.
- `tags` -> Python `list[AtomTag]` (list of namespaced strings) ->
  `kind: "stringlist"`.
Required strings (`id`, `title`, `instructions`) have no default in Python;
all other strings have string defaults or are `| None`, so they are
non-required.

If the real `step.py` disagrees with the field NAMES, KINDS, enum values or
required-ness above, STOP and report the discrepancy — do not silently diverge
and do not invent fields. (`projectsAs` is an intentional graph-projection hint
added by us, not a claim about the Python type; it is expected and correct.)

### Step 2 — create the generator

Create `scripts/generate-node-types.mjs`, structured like
`scripts/generate-hum-ast.mjs`. It reads every `*.model.json` under
`src/schema/models/` and emits `src/schema/generated-node-types.ts` exporting
`export const generatedNodeTypes: NodeTypeDefinition[]`. Field -> Zod mapping
(see the dedicated mapping section under Validation). Non-schema fields of the
definition:
- `colorToken` = `` `token-${family}` ``
- `category` = `family`
- `defaultSize` = `{ width: 220, height: 100 }`
- `allowedConnections` = derived in code from fields carrying a `projectsAs`
  hint. Since no explicit target typeIds are declared for this spike, each
  `projectsAs` field contributes `'conversation-step'` (self-connection); the
  result is de-duplicated and MUST be non-empty. It MUST be derived from the
  presence of `projectsAs` fields, never hardcoded as an unrelated literal. If
  a descriptor had zero `projectsAs` fields, `allowedConnections` would be `[]`
  — but this descriptor has two, so it resolves to `['conversation-step']`.
- `renderers` = reuse the placeholder/EntityCard helpers already in
  `register-defaults.ts`. Factor those helpers into a shared module
  (e.g. `src/schema/renderer-helpers.ts`) imported by BOTH
  `register-defaults.ts` and the generated file, OR have the generated file
  import them from `register-defaults.ts`. Do NOT invent new renderer
  components.

### Step 3 — wire into build (single decision, no alternatives)

Add a SEPARATE sibling script call. In `package.json`, change `hum:sync` from
`node scripts/generate-hum-ast.mjs` to:
`node scripts/generate-hum-ast.mjs && node scripts/generate-node-types.mjs`.
Do NOT fold the logic into `generate-hum-ast.mjs`.

### Step 4 — register the generated types

In `src/schema/register-defaults.ts`, import `generatedNodeTypes` from
`./generated-node-types` and register them inside `registerDefaultNodeTypes()`
by iterating them through the EXISTING `registerIfMissing` path, AFTER the
built-in `defaultNodeTypes.forEach(registerIfMissing)` line. This is an
ADDITION; leave the existing built-in definitions untouched.

### Step 5 — test (against real generated output, not inlined literals)

Create `src/schema/generate-node-types.test.ts` (vitest). It MUST import
`generatedNodeTypes` from `./generated-node-types` (the REAL generated artifact)
and assert:
- a `conversation-step` definition exists;
- its `payloadSchema` accepts a valid payload (with the required fields `id`,
  `title`, `instructions` present), and REJECTS a payload missing the required
  `instructions` field;
- `allowedConnections` equals `['conversation-step']` (derived from the two
  `projectsAs` fields), hence non-empty.
The test MUST NOT reconstruct an expected node-type literal by hand and compare
to it — it validates the real generated object's behavior (per the anti-mock
pill).

## Validation

Run ALL of these from `apps/review-workbench/` before hand-off:
- `npm run hum:sync` run TWICE — `git status` shows no diff on the second run
  (deterministic regeneration).
- `npx vitest run src/schema/` — passes, including the new test and existing
  schema tests (`register-defaults.test.ts`, `registry.test.ts`).
- `npx tsc --noEmit` — no type errors introduced.

### Field -> Zod mapping (exact)

- `string`, not required -> `z.string().optional()`
- `string`, `required: true` -> `z.string().min(1)`
- `enum` -> `z.enum([...values])`; append `.default(<default>)` if `default`
  present, else `.optional()`
- `stringlist` -> `z.array(z.string()).optional()` (unless `required: true`,
  then `z.array(z.string())`)
- a field carrying `projectsAs` -> STILL mapped to its `kind` in `payloadSchema`;
  the `projectsAs` value ADDITIONALLY drives `allowedConnections`. `projectsAs`
  never removes a field from the schema.

The generator MUST support exactly these three field kinds: `string`, `enum`,
`stringlist`. If it encounters an unknown `kind`, it MUST throw (fail the
build), never silently skip.

All 12 fields of `conversation-step` are payload fields (none are excluded).
`allowed_transitions` and `grounding_atoms` remain string payload fields AND
project as relations. The test's "required field" check uses `instructions`.

### Guardrails (from bound pills)

- Do NOT hand-write Zod for `conversation-step`; it must come from the
  generator (`generated-node-types.ts`).
- Do NOT read a live sldb store.
- Do NOT fabricate descriptor fields; transcribe the real `step.py`.
- Do NOT write a test that asserts against a hand-copied literal instead of the
  real generated output.
- Keep existing built-in node types and their tests green.

## Done When

- `npm run hum:sync` deterministically regenerates
  `src/schema/generated-node-types.ts`.
- `conversation-step` is present in the registry, sourced from the descriptor
  via the generator, validated, with no hand-written Zod for it.
- `npx vitest run src/schema/` and `npx tsc --noEmit` pass.

## Files expected to change

- `apps/review-workbench/src/schema/models/conversation-step.model.json` (new)
- `apps/review-workbench/scripts/generate-node-types.mjs` (new)
- `apps/review-workbench/src/schema/generated-node-types.ts` (new, generated)
- `apps/review-workbench/src/schema/renderer-helpers.ts` (new, if factoring)
- `apps/review-workbench/src/schema/register-defaults.ts` (edit: import+register)
- `apps/review-workbench/package.json` (edit: `hum:sync`)
- `apps/review-workbench/src/schema/generate-node-types.test.ts` (new)

## Validation

_List the checks required before this task can close._

- pytest

## Done When

_Name the observable condition that makes the task complete._

Promoted work is completed, validated, and closed with a commit.
