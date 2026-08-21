---
id: task-add-layout-strategy-registry-with-elk-layered-and-elk-rings
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings
current_node: checklist-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-closeout-ready
history:
- operator-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-activate
- operator-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-ready-for-testing
references:
- 0fd2fe8
depends_on: []
pills:
- desk/contexts/pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb.md
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
files: []
checklists:
- checklist-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-execution-ready
- checklist-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-testing-ready
- checklist-task-add-layout-strategy-registry-with-elk-layered-and-elk-rings-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar
closeout_evidence_verified: false
---

# Add layout strategy registry with elk-layered and elk-rings

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Introduce a `LAYOUT_REGISTRY` (name -> `LayoutStrategy`) in graph_ui's L2, register the existing ELK layered layout under `elk-layered`, and add a second `elk-rings` (radial) strategy, selected by `ProjectionView.layout_strategy`.

## Scope

_State what is in scope and what is out of scope._

In scope:
- `LayoutStrategy` interface + `LAYOUT_REGISTRY: Record<string, LayoutStrategy>` (SPEC section 4.1), mirroring spec2viz's `RENDERER_MAP` (`spec2viz/renderers/__init__.py:19-28`).
- Register existing `use-graph-layout.ts` ELK layout under key `elk-layered` (behavior unchanged, just named).
- Add `elk-rings`: ELK `radial` algorithm; nodes sharing a `ring`/`layer` facet on the same radius; edges only between adjacent rings unless the relation type is config-marked as an "interface" relation.
- Vitest tests for registry selection and elk-rings ring/interface behavior.

Out of scope:
- More than two strategies (vision point 1.3).
- A general architecture-style DSL.

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-layout-strategy-registry.md.

## Validation

_List the checks required before this task can close._

- npm run test (review-workbench vitest)

## Done When

_Name the observable condition that makes the task complete._

Two named layout strategies are selectable via the registry, elk-rings places rings + honors interface edges, proven by Vitest tests.
