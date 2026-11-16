---
sldb:
  by: agent
  at: '2026-11-16T19:09:09Z'
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
- desk/tasks/task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en.md
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
- Edicion contextual de relaciones y campos con control de concurrencia [draft] - Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.
- Decisión de JP: ¿el workspace de graph_ui edita y ancla código (softfactory K03/K05/K12) o solo muestra el estado de los CodeAnchorDoc de sldb? [draft] - Una decisión escrita de JP, con una de tres opciones: (A) graph_ui solo muestra, en la vista inspect, los anclajes de código de un documento y su estado (intact/changed/lost) leyendo CodeAnchorDoc por la API de sldb, sin editar código; (B) además edita fragmentos de código anclados desde el workspace (K05), con escritura y reanclaje por sldb; (C) nada de código en graph_ui; el tema pasa a la UI de deskops o se descarta.
- El lector del workspace y el adaptador usan la lectura pública de sldb (read_store, extract_payload) en vez de módulos internos [draft] - Ningún archivo .py bajo frontends/ ni tests/deskops_viewdocs.py importa sldb.store.runtime_cache_signature ni sldb.runtime.validation; las lecturas usan sldb.api.read_store y sldb.api.extract_payload, y un listado GET del workspace sobre un store sin preparar responde 503 con el texto de sldb ('store not prepared: run `sldb stores update`') en vez de migrar el store.
