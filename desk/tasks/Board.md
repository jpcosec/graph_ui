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

Phase B delivery tasks (adapter, encoding, layout, store, sidebar) are closed. kgdb RelationFilter implemented and merged. Last remaining is sldb end-to-end proof in desk drawer -- requires sldb AST export to kgdb, a cross-repo item. Playwright interaction flow proves save, reload, persist of named views works end to end.

## Task Details

_Generated from the task references above._

- Define graph UI data contract [resolved] - 
- Define minimal editing surface [resolved] - 
- Create real graph fixture [resolved] - 
- Wire reusable editor to real fixture [resolved] - 
- Surface semantic signals [resolved] - 
- Prove one safe edit flow [resolved] - 
- Generate graph_ui node types from sldb models at build time [active] - A build-time generator that turns one sldb model into a `NodeTypeDefinition`:
- `payloadSchema` (Zod) derived from the model's `Field`s.
- `allowedConnections` derived from the model's relation fields.
- `colorToken` / `category` derived from `__family__`.
- default renderers wired.
