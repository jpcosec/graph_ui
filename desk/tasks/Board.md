---
sldb:
  by: agent
  at: '2026-10-30T14:11:06Z'
  authority: generated
  via: update_document
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks: []
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

Fase Deskops UI cerrada en daa6400f29ab. Vista /workflow/deskops entregada con API/gates reales, filtros, avance y WorkersPanel. Validación: 158 pruebas de suite general aprobadas; una expectativa vieja de pestañas corregida y revalidada (2/2); API 7/7, navegador 1/1, Node 3/3 y skins 4/4. No hay tareas activas. Pill no-mocks continúa reusable; conocimiento durable en atom-deskops-workflow-views-delegate-state-and-gates-to-deskops y docs/deskops-ui.md.

## Task Details

_Generated from the task references above._
