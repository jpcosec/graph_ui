---
id: task-add-projectionview-model-and-file-based-projectionviewstore
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-add-projectionview-model-and-file-based-projectionviewstore
current_node: checklist-task-add-projectionview-model-and-file-based-projectionviewstore-execution-ready
history: []
references:
- desk/drawer/tasks/task-projectionview-store.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids.md
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
files: []
checklists:
- checklist-task-add-projectionview-model-and-file-based-projectionviewstore-execution-ready
- checklist-task-add-projectionview-model-and-file-based-projectionviewstore-testing-ready
- checklist-task-add-projectionview-model-and-file-based-projectionviewstore-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar
---

# Add ProjectionView model and file-based ProjectionViewStore

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Add a `ProjectionView` model and a small file-based `ProjectionViewStore` (`load`, `save`, `list`) that persists named views as JSON under `graph_ui/desk/fixtures/views/`, referencing facet/relation names only.

## Scope

_State what is in scope and what is out of scope._

In scope:
- `ProjectionView` model (SPEC section 3.4):
  `view_id, label, query: StructuredQuery, encoding: list[EncodingRule], layout_strategy: str, created_by, created_at`.
  (Mirror `EncodingRule` shape in Python for storage only; the authoritative TS type lands in the encoding task.)
- `ProjectionViewStore` with `load(view_id)`, `save(view)`, `list()` over `graph_ui/desk/fixtures/views/*.json`.
- Portability check: reject/flag views whose `query.filters[].facet` or `relations[].relation_types` contain literal node ids.
- Tests: round-trip save/load/list + portability rejection.

Out of scope:
- UI surface (later task).
- Actual rendering of encoding/layout.

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-projectionview-store.md.

## Validation

_List the checks required before this task can close._

- npm run test (review-workbench vitest)

## Done When

_Name the observable condition that makes the task complete._

A ProjectionView can be saved, listed, and reloaded from localStorage, proven by Vitest tests.
