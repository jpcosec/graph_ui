---
sldb:
  by: agent
  at: '2026-11-16T12:43:45Z'
  authority: generated
  via: save_document_payload
id: task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- /home/jp/proyectos/softfactory_spec/SPEC.md
- f16fcd1
- desk/tasks/task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra.md
- frontends/mindmap/persistence.py
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/serve.py
- frontends/mindmap/views/workspace/
- tests/test_mindmap_workspace_edit.py
- docs/workspace-ui.md
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
closeout_evidence:
- tests
- commit
- atom
---

# Edicion contextual de relaciones y campos con control de concurrencia

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K06, K11, K13, K15) el usuario edita campos y agrega o quita relaciones desde el workspace sin saber en qué archivo se persisten, y las ediciones concurrentes de agentes o del CLI no se pisan en silencio. Editar la KB SLDB es la función propia de graph_ui (JP, 2026-11-16: graph_ui y la UI de deskops son productos distintos), así que esta tarea sigue en graph_ui. La decisión de T4 (opción A, por ahora) limita solo el código: aquí se editan documentos y relaciones, nunca código.

## Goal

_Describe the concrete result this task must produce._

Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.

## Scope

_State what is in scope and what is out of scope._

ENTRA: endpoints de mutación de campos y relaciones en frontends/mindmap con verificación de revisión previa (before-image), reutilizando el mecanismo de revisión y 409 que ya usa persistence.py para guardar el mapa (no uno nuevo); controles de edición en el panel Context y en la proyección Document del workspace; docs/workspace-ui.md; pruebas reales de persistencia y de conflicto 409. NO ENTRA: editar código o anclajes de código (T4, opción A), escribir en el store por fuera de pron.Store/sldb, y los cambios sin commitear de JP en frontends/desk/app.js y task.js.

## Implementation Path

_Outline the expected implementation route or affected surface._

Integrar las acciones + Add relation / Remove relation y guardado de campos del workspace con las mutaciones reales de pron.Store bajo el lock/revisión del servidor, devolviendo 409 ante revisiones obsoletas.

## Validation

_List the checks required before this task can close._

- pytest -q tests/test_mindmap_workspace_edit.py

## Done When

_Name the observable condition that makes the task complete._

Agregar o eliminar una relacion y editar un campo desde el workspace persiste en el store real bajo lock de servidor, sobrevive a recargar y rechaza con 409 una escritura con revision obsoleta sin perder estado local, con pruebas pytest en verde.
