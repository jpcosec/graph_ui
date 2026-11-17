---
sldb:
  by: agent
  at: '2026-11-17T03:14:58Z'
  authority: generated
  via: save_document_payload
# board-xxx
id: board-graph-ui
# Affected workspace or domain
scope: graph_ui
# List of task-xxx paths
tasks:
- desk/tasks/task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento.md
- desk/tasks/task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia.md
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
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

- Vista Changes: arbol de hashes, staleness e impacto en conocimiento [draft] - Añadir en /workspace la pestaña Changes y la sección Integrity del panel Context: listan los documentos que sldb reporta como cambiados o stale y los anclajes de código que no están intact, y para cada uno los documentos que dependen de él a 1-2 saltos en el índice de relaciones, marcados como potencialmente obsoletos. Todo de solo lectura.
- Edicion contextual de relaciones y campos con control de concurrencia [draft] - En el workspace de Mindmap (/workspace/node, puerto 8088; no el visor standalone de solo lectura de frontends/workspace en el 8090) se puede editar un campo de un documento desde 'Campos del Documento (IR)' de la proyección Documento y agregar o quitar una relación válida según el modelo desde el panel 'Contexto y Relaciones'. Cada escritura lleva la revisión del documento (su source_hash) y el servidor la rechaza con 409 si el documento cambió desde que se leyó, sin perder lo que el usuario escribió.
- Decisión de JP: ¿el workspace de graph_ui edita y ancla código (softfactory K03/K05/K12) o solo muestra el estado de los CodeAnchorDoc de sldb? [draft] - Una decisión escrita de JP, con una de tres opciones: (A) graph_ui solo muestra, en la vista inspect, los anclajes de código de un documento y su estado (intact/changed/lost) leyendo CodeAnchorDoc por la API de sldb, sin editar código; (B) además edita fragmentos de código anclados desde el workspace (K05), con escritura y reanclaje por sldb; (C) nada de código en graph_ui; el tema pasa a la UI de deskops o se descarta.
