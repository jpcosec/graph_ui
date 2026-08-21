---
id: task-add-encodingsection-and-viewssection-to-the-sidebar
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-add-encodingsection-and-viewssection-to-the-sidebar
current_node: checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-execution-ready
history: []
references:
- desk/drawer/tasks/task-projection-sidebar-ui.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-saved-views-reference-facet-relation-names-never-literal-node-ids.md
- desk/contexts/pill-guardrail-filtering-is-primary-encoding-is-secondary-scope-stays-narrow.md
files: []
checklists:
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-execution-ready
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-testing-ready
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-saved-views-must-reference-facet-and-relation-names-never-literal-node-ids
- atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection
- atom-projection-grammar
---

# Add EncodingSection and ViewsSection to the sidebar

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Extend the existing sidebar with two sections: `EncodingSection` (edit the `EncodingRule` list) and `ViewsSection` (load/save/list `ProjectionView`s), sitting alongside the existing `FiltersSection`/`ViewSection`.

## Scope

_State what is in scope and what is out of scope._

In scope:
- `EncodingSection`: rule-list editor over `EncodingRule[]` (from task-encoding-rules-l2).
- `ViewsSection`: load/save/list `ProjectionView`s (via the store from task-projectionview-store) and a "save this as a named view" action.
- Wire relation-type toggles already spec'd in `FiltersSection` to the active query.
- Vitest/Playwright coverage for save -> reload of a named view.

Out of scope:
- New filter model (reuse existing `FiltersSection`).
- Multi-tenant/permissions on views.

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-projection-sidebar-ui.md.

## Validation

_List the checks required before this task can close._

- npm run test (review-workbench vitest)
- npm run test:user-flow --flow <encoding_view_flow>

## Done When

_Name the observable condition that makes the task complete._

An operator can build a filter+encoding+layout config in the sidebar, save it as a named view, and reload it, proven by a user-flow Playwright test.
