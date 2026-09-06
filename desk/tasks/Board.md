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
- desk/tasks/task-feed-hum-body-from-sldb-serve-remove-hardcoded-content.md
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

Routes graph_ui delivery work. Phase A (tasks 001-006) resolved. Phase B built the graph_ui side of the projection grammar per desk/drawer/PROJECTION_GRAMMAR_SPEC.md and is closed. The live Antonia typed-editor arc (sldb serve + typed inspector + flow_editor bridge) is merged to master (dae5756). Cross-repo pieces (sldb store extraction, kgdb relation model, gemini lens) are delegated to their home repos via inbox, not executed here.

## Notes

_Add short operational notes about the current routed set._

Phase B delivery tasks (adapter, encoding, layout, store, sidebar) are closed. kgdb RelationFilter implemented and merged. The build-time node-type generator (sldb model -> NodeTypeDefinition) is closed (8123184, e6166d8). The sldb end-to-end proof is DONE and lives in this repo, not deferred: live Antonia flow over `sldb serve` with typed inspector save+reload, verified by Playwright (050a35e, ce01267; npm test 79/79; evidence in apps/review-workbench/auto_user_test/antonia_live/). No graph_ui delivery task is currently open; remaining roadmap items are cross-repo (see desk/drawer/DELEGATED_CROSS_REPO_WORK.md).

## Task Details

_Generated from the task references above._

- Define graph UI data contract [resolved] - 
- Define minimal editing surface [resolved] - 
- Create real graph fixture [resolved] - 
- Wire reusable editor to real fixture [resolved] - 
- Surface semantic signals [resolved] - 
- Prove one safe edit flow [resolved] - 
- Feed hum-body from sldb serve (remove hardcoded content) [active] - Promote deferred work from task-hum-body-live-sldb.md.
