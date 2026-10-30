---
id: task-deskops-workflow-view
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- desk/atoms/atom-deskops-workflow-views-delegate-state-and-gates-to-deskops.md
- f241471
- desk/drawer/tasks/task-deskops-workflow-view.md
depends_on: []
pills: []
files:
- frontends/mindmap/deskops_routes.py
- frontends/mindmap/serve.py
- frontends/mindmap/shell/registry.js
- frontends/mindmap/views/workflow/deskops
- tests/test_mindmap_deskops.py
- tests/e2e_mindmap_deskops.py
- tests/mindmap-deskops.test.mjs
- docs/deskops-ui.md
- README.md
task_type: implementation
inherits_from: []
inherit_acceptance_context: false
atoms:
- desk/atoms/atom-deskops-workflow-views-delegate-state-and-gates-to-deskops.md
from_drawer: desk/drawer/tasks/task-deskops-workflow-view.md
closeout_evidence:
- tests
- commit
- document
---

# Deskops workflow view in Mindmap

## Rationale

_Explain why this task exists or the business driver behind it._

El usuario necesita una UI para deskops aprovechando UIs y sldb existentes. La revisión verificó Mindmap activo, sldb serve/surface para documentos y WorkersPanel ya conectado; falta el tablero operativo.

## Goal

_Describe the concrete result this task must produce._

Entregar una vista funcional en español /workflow/deskops integrada en Mindmap sobre un desk real, con tareas enrutadas, inspección de contexto y gates y avance mediante deskops.

## Scope

_State what is in scope and what is out of scope._

Solo graph_ui: frontends/mindmap/deskops_routes.py; frontends/mindmap/serve.py; frontends/mindmap/shell/registry.js; frontends/mindmap/views/workflow/deskops/{deskops-view.js,deskops.mjs,deskops.css}; tests/test_mindmap_deskops.py; tests/e2e_mindmap_deskops.py; tests/mindmap-deskops.test.mjs; README.md; docs/deskops-ui.md; pyproject.toml (extra opcional deskops si procede). Se permiten ajustes mínimos de tests existentes por registro de nueva vista. No tocar sldb ni deskops ni otras UIs, ni inbox ajeno. No crear tareas, editar documentos o cerrar tareas por HTTP en esta entrega. No mocks como producto ni pruebas que reemplacen servicios reales. El panel workers existente se reutiliza sin duplicarlo.

## Implementation Path

_Outline the expected implementation route or affected surface._

Fase única independiente del closeout en deskops. Reutilizar shell/router/skin/WorkersPanel y request(). Añadir descriptor facet=workflow,id=deskops,label=Deskops, shell.primary=false, estilos propios con tokens de skins sin hex. En serve.make_server fijar root del workflow: DESKOPS_ROOT absoluto si configurado, en local padre del store efectivamente pasado; en remote sin env devolver error explicativo de configuración, jamás usar cwd/otro store. GET /api/desk/board lee BoardDoc mediante SLDB/deskops y SOLO referencias tasks en ese board (no list_tasks que escanea huérfanas); devuelve identidad del desk, board y tareas con datos reales, current_node/status/goal y errores por referencia. GET /api/desk/task?id=... debe resolver solo una tarea del board y obtener payload, gates con holds/condition/target desde show_task y siguiente acción desde next_action_report. No parser YAML/Markdown propio. Fallos globales HTTP explícitos, fallos por tarea visibles, diferencia vacío/error. POST /api/desk/advance acepta id y revision del detalle, rechaza stale con 409, valida Origin mismo origen (rechaza origin externo), tamaño/tipos del body, serializa avances y delega advance_task(id) SIN target; refresca detalle; gate bloqueado visible, ningún commit/cierre. Revisión debe representar contenido actual de task y board, y serialización entre peticiones; documentar límite frente a escritores CLI concurrentes si no existe lock compartido. Selección por click/teclado, buscador, filtro de estado, contadores reales, detalle legible (objetivo, alcance, validaciones, evidencia declarada, pills, dependencias, próximos pasos y gates), botón actualizar, estado de carga/vacío/error, botón avance solo cuando corresponde pero backend reevalúa gates siempre; terminal se dirige al CLI de closeout como información, no botón que mienta. No montar el editor genérico de SLDB para cambiar status. Usar SLDB por las operaciones existentes; no clonar surface ni los editores retirados. UI responsive a 390px y escritorio, dark/light. Documentar comando reproducible SLDB_STORE=/abs/deskops/.sldb DESKOPS_ROOT=/abs/deskops graph-ui 8091 y ruta, límites y relación SLDB. Validar desde un desk temporal real (deskops init o scaffold), crear tareas reales y board y probar que huérfanas no aparecen, rutas rotas se diagnostican, stale/cross-origin/blocked/post exitoso, sin cerrar ni escribir desk real. Playwright navegador real prueba la ruta, selección, filtros, error/vacío, avance y captura screenshot.

## Validation

_List the checks required before this task can close._

- pytest
- node --test tests/mindmap-deskops.test.mjs
- pytest tests/test_mindmap_deskops.py tests/e2e_mindmap_deskops.py -q
- graph-ui 8091 con desk real solo lectura; screenshot Playwright

## Done When

_Name the observable condition that makes the task complete._

La vista carga desde URL directa con datos del board, muestra gates autoritativos y permite un avance real en sandbox; pruebas relevantes y suite pytest de graph_ui pasan o fallos preexistentes quedan demostrados y reportados sin falso cierre; documentación y evidencia quedan guardadas.
