---
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks:
- desk/tasks/task-evaluación-de-vistas-filtros-y-guardado-en-graph-ui.md
- desk/tasks/task-layout-por-estilo-de-arquitectura-en-las-vistas.md
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

- Evaluación de vistas, filtros y guardado en graph_ui [draft] - graph_ui evalúa un ViewDoc con sldb.api.graph (§4) por /api/views, /api/views/evaluate y /api/views/save; el ViewsSection de review-workbench lista, carga y guarda vistas del store y el FiltersSection edita nodes y relations; e2e lo prueba en navegador.
- Layout por estilo de arquitectura en las vistas [draft] - El layout de la vista (ViewDoc.layout, o el de su NotationDoc) con style layered o rings elige elk-layered o elk-rings en layout-strategies.ts; rings usa layout.ring_field; e2e verifica las posiciones.
