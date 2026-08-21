---
id: task-add-encodingrule-support-in-graph-ui-l2-render-layer
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-add-encodingrule-support-in-graph-ui-l2-render-layer
current_node: checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-closeout-ready
history:
- operator-task-add-encodingrule-support-in-graph-ui-l2-render-layer-activate
- operator-task-add-encodingrule-support-in-graph-ui-l2-render-layer-ready-for-testing
references:
- atom-encoding-rules-l2 - testing via Vitest ts
- commit:HEAD
depends_on: []
pills:
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
- desk/contexts/pill-guardrail-encoding-and-layout-live-in-graph-ui-spec2viz-not-in-kgdb.md
files: []
checklists:
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-execution-ready
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-testing-ready
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-filtering-is-the-primary-projection-mechanism-encoding-is-secondary
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar
closeout_evidence_verified: false
---

# Add EncodingRule support in graph_ui L2 render layer

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Introduce an `EncodingRule` type in the TS render layer and make `NodeShell`/`FloatingEdge` consult an active rule list instead of a single hardcoded `colorToken` per type, so filtered-in nodes/edges can be visually distinguished.

## Scope

_State what is in scope and what is out of scope._

In scope:
- `EncodingRule` TS interface (SPEC section 3.3):
  `when: { relationType?; nodeFacet?; facetValue? }`, `style: { strokeColor?; strokeStyle?: 'solid'|'dashed'; strokeWidth?; nodeColorToken? }`.
- Extend `NodeShell` and `FloatingEdge` to resolve style from the active `EncodingRule[]` (fallback to current default when no rule matches).
- Vitest unit tests for rule matching and fallback.

Out of scope:
- kgdb changes (encoding is presentation, stays out of kgdb).
- Layout strategies (separate task).
- Sidebar UI editor (separate task).

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-encoding-rules-l2.md.

## Validation

_List the checks required before this task can close._

- npm run test (review-workbench vitest)

## Done When

_Name the observable condition that makes the task complete._

NodeShell/FloatingEdge render styles from an EncodingRule[] with a working default fallback, proven by Vitest tests.
