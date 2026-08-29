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
files: []
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

_State what is in scope and what is out of scope._



## Implementation Path

_Outline the expected implementation route or affected surface._

- Generation runs at BUILD-TIME, following the exact pattern already used by
`apps/review-workbench/scripts/generate-hum-ast.mjs` (invoked by the
`hum:sync` npm script, which runs before `dev`, `build` and `test`).
- The spike does NOT wire a live sldb store read. It consumes a checked-in
JSON model descriptor that mirrors the sldb model's fields. Live sldb export
is a follow-up task. This keeps the spike self-contained and deterministic.

## Validation

_List the checks required before this task can close._

- Do NOT hand-write Zod for `conversation-step` in `register-defaults.ts`; it
must come from the generator.
- Do NOT read a live sldb store in this task.
- Keep the existing built-in node types working (regression: their tests must
still pass).
- `generated-node-types.ts` is a build artifact; it MAY be committed but must
be reproducible by running `npm run hum:sync`.

## Done When

_Name the observable condition that makes the task complete._

Promoted from desk/drawer/tasks/drawer-generate-node-types-from-sldb-models-at-build.md.

## Validation

_List the checks required before this task can close._

- pytest

## Done When

_Name the observable condition that makes the task complete._

Promoted work is completed, validated, and closed with a commit.
