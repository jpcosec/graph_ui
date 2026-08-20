---
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks:
- desk/tasks/001-define-graph-ui-data-contract.md
- desk/tasks/002-define-minimal-editing-surface.md
- desk/tasks/003-create-real-graph-fixture.md
- desk/tasks/004-wire-reusable-editor-to-real-fixture.md
- desk/tasks/005-surface-semantic-signals.md
- desk/tasks/006-prove-one-safe-edit-flow.md
- desk/tasks/task-add-relationfilter-to-kgdb-structuredquery.md
# List of pill-xxx paths
pills: []
# List of ritual-xxx paths
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
# e.g., system:sldb, workspace:desk
tags:
- system:graph_ui
- workspace:desk
---

# Graph UI Tasks Board

## Purpose

_Explain what this board routes and why it exists._

Routes graph_ui delivery work. Phase A (tasks 001-006) resolved. Phase B builds the projection grammar per desk/drawer/PROJECTION_GRAMMAR_SPEC.md.

## Notes

_Add short operational notes about the current routed set._

Active tasks are the two no-dep data-layer tasks (adapter and RelationFilter). Five deferred tasks remain in drawer (store, encoding, layout, sidebar, sldb proof). Promote data layer before presentation before UI. Run phase.md when a layer closes.

## Task Details

_Generated from the task references above._

- Define graph UI data contract [resolved] - 
- Define minimal editing surface [resolved] - 
- Create real graph fixture [resolved] - 
- Wire reusable editor to real fixture [resolved] - 
- Surface semantic signals [resolved] - 
- Prove one safe edit flow [resolved] - 
- Add RelationFilter to kgdb StructuredQuery [active] - Add an additive `RelationFilter` to kgdb's `StructuredQuery` and one executor branch that filters edges by `relation_type` membership and direction, with tests, keeping kgdb domain-agnostic (no visual concepts).
