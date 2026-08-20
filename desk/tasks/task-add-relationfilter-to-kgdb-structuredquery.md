---
id: task-add-relationfilter-to-kgdb-structuredquery
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-add-relationfilter-to-kgdb-structuredquery
current_node: checklist-task-add-relationfilter-to-kgdb-structuredquery-execution-ready
history: []
references: []
depends_on: []
pills:
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
- desk/contexts/pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb.md
files: []
checklists:
- checklist-task-add-relationfilter-to-kgdb-structuredquery-execution-ready
- checklist-task-add-relationfilter-to-kgdb-structuredquery-testing-ready
- checklist-task-add-relationfilter-to-kgdb-structuredquery-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-kgdb-s-query-language-has-no-relation-type-filter-yet
- atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary
- atom-projection-grammar
---

# Add RelationFilter to kgdb StructuredQuery

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Add an additive `RelationFilter` to kgdb's `StructuredQuery` and one executor branch that filters edges by `relation_type` membership and direction, with tests, keeping kgdb domain-agnostic (no visual concepts).

## Scope

_State what is in scope and what is out of scope._

In scope:
- New `RelationFilter` model in `kgdb/src/kgdb/query/language.py`:
  `relation_types: list[VocabularyTerm]` (allow-list, empty = all), `direction: Literal["outgoing","incoming","both"] = "both"`.
- Add `relations: list[RelationFilter] = Field(default_factory=list)` to `StructuredQuery`.
- One new branch in `kgdb/src/kgdb/query/executor.py`: after resolving the node set, filter the edge set by `relation_type in relation_types` and by direction.
- Tests in `kgdb/tests/` covering allow-list, empty=all, and each direction.

Out of scope:
- Encoding, layout, saved views (later tasks).
- Any visual/presentation concept in kgdb.

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-relationfilter-in-kgdb-query.md.

## Validation

_List the checks required before this task can close._

- pytest (kgdb suite)

## Done When

_Name the observable condition that makes the task complete._

A StructuredQuery with a RelationFilter returns only edges of the allowed relation types and direction, proven by tests, with kgdb still visual-free.
