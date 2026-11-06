---
id: task-edicion-contextual-de-relaciones-y-campos-con-control-de-concurrencia
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- /home/jp/proyectos/softfactory_spec/SPEC.md
- desk/tasks/task-workspace-multiproyeccion-documento-grafo-local-codigo-y-contexto.md
- docs/deskops-ui.md
depends_on:
- task-workspace-multiproyeccion-documento-grafo-local-codigo-y-contexto
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

En softfactory_spec (K06, K11, K13, K15), el usuario debe poder editar campos y agregar o quitar relaciones desde el workspace sin necesitar saber en qué archivo se persisten, garantizando que ediciones concurrentes de agentes o CLI no se sobrescriban silenciosamente.

## Goal

_Describe the concrete result this task must produce._

Habilitar en el panel Context y en la proyección Document del workspace el alta/baja de relaciones válidas según el modelo y la edición de campos vía pron.Store/sldb, exigiendo el hash de revisión previo y rechazando con 409 Conflict cualquier escritura obsoleta.

## Scope

_State what is in scope and what is out of scope._

Solo graph_ui: endpoints de mutación de campos y relaciones en frontends/mindmap con verificación de revisión previa (before-image), controles de edición en el panel Context y Document, y pruebas reales de persistencia y conflicto 409.

## Implementation Path

_Outline the expected implementation route or affected surface._

Integrar las acciones + Add relation / Remove relation y guardado de campos del workspace con las mutaciones reales de pron.Store bajo el lock/revisión del servidor, devolviendo 409 ante revisiones obsoletas.

## Validation

_List the checks required before this task can close._

- pytest -q tests/test_mindmap_workspace_edit.py

## Done When

_Name the observable condition that makes the task complete._

Agregar o eliminar una relacion y editar un campo desde el workspace persiste en el store real bajo lock de servidor, sobrevive a recargar y rechaza con 409 una escritura con revision obsoleta sin perder estado local, con pruebas pytest en verde.
