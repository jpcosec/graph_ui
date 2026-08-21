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
- desk/tasks/task-add-layout-strategy-registry-with-elk-layered-and-elk-rings.md
- desk/tasks/task-add-projectionview-model-and-file-based-projectionviewstore.md
- desk/tasks/task-add-encodingsection-and-viewssection-to-the-sidebar.md
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

Routes graph_ui delivery work. Phase A (tasks 001-006) resolved. Phase B builds the graph_ui side of the projection grammar per desk/drawer/PROJECTION_GRAMMAR_SPEC.md. Cross-repo pieces (kgdb RelationFilter, sldb AST export) are delegated to their home repos via inbox, not executed here.

## Notes

_Add short operational notes about the current routed set._

Phase B active work is graph_ui-local only. RelationFilter lives in the kgdb repo (not here); it was delegated via kgdb desk/inbox on 2026-08-20 and tracked as a dependency, not a graph_ui task. Four deferred drawer tasks remain local (store, encoding, layout, sidebar). The sldb-proof task also spans kgdb+sldb. Promote data layer before presentation before UI. Run phase.md when a layer closes.

## Task Details

_Generated from the task references above._

- Define graph UI data contract [resolved] - 
- Define minimal editing surface [resolved] - 
- Create real graph fixture [resolved] - 
- Wire reusable editor to real fixture [resolved] - 
- Surface semantic signals [resolved] - 
- Prove one safe edit flow [resolved] - 
- Add layout strategy registry with elk-layered and elk-rings [ready_for_testing] - Introduce a `LAYOUT_REGISTRY` (name -> `LayoutStrategy`) in graph_ui's L2, register the existing ELK layered layout under `elk-layered`, and add a second `elk-rings` (radial) strategy, selected by `ProjectionView.layout_strategy`.
- Add ProjectionView model and file-based ProjectionViewStore [active] - Add a `ProjectionView` model and a small file-based `ProjectionViewStore` (`load`, `save`, `list`) that persists named views as JSON under `graph_ui/desk/fixtures/views/`, referencing facet/relation names only.
- Add EncodingSection and ViewsSection to the sidebar [active] - Extend the existing sidebar with two sections: `EncodingSection` (edit the `EncodingRule` list) and `ViewsSection` (load/save/list `ProjectionView`s), sitting alongside the existing `FiltersSection`/`ViewSection`.
