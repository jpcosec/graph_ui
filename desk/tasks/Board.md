---
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks:
- desk/tasks/task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento.md
- desk/tasks/task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia.md
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

DAG Knowledge Workspace UI: task-workspace-multiproyeccion integrada y cerrada. Tareas restantes en draft: task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento y task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia. Candidatos dependientes de contratos externos no cerrados (anclas CST Tree-sitter, adaptador remoto C2 y prueba integral multiagente E01) registrados en desk/drawer/tasks/.

## Task Details

_Generated from the task references above._

- Vista Changes: arbol de hashes, staleness e impacto en conocimiento [draft] - Añadir la vista/pestaña Changes en frontends/mindmap y la sección Integrity en el panel Context que consulten el estado real de verificación del store y crucen cada nodo o archivo mutado con sus dependientes a 1-2 hops en el grafo, señalando los artefactos potencialmente obsoletos (stale).
- Edicion contextual de relaciones y campos con control de concurrencia [draft] - Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.
