---
id: task-vista-changes-arbol-de-hashes-staleness-e-impacto-en-conocimiento
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
- tests/test_mindmap_changes.py
- docs/workspace-ui.md
task_type: code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-workspace-presents-document-graph-code-and-changes-as-projections-of-the-same-node
closeout_evidence:
- tests
- commit
- atom
---

# Vista Changes: arbol de hashes, staleness e impacto en conocimiento

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K04, K08), las mutaciones de contenido dejan de ser un detalle interno y se convierten en señal de UX. En sldb v1 las aristas estampan ref_hash en lectura, por lo que graph_ui debe persistir una linea base local para detectar staleness frente al estado actual.

## Goal

_Describe the concrete result this task must produce._

Añadir la vista/pestaña Changes en frontends/mindmap y la sección Integrity en el panel Context que consulten el estado real de verificación del store y crucen cada nodo o archivo mutado con sus dependientes a 1-2 hops en el grafo, señalando los artefactos potencialmente obsoletos (stale).

## Scope

_State what is in scope and what is out of scope._

Solo graph_ui: endpoint de integridad e impacto en frontends/mindmap sobre el store real (stores check + grafo de referencias), vista Changes, bloque Integrity en el panel lateral Context, footer de estado y pruebas automatizadas sobre mutaciones reales en un store temporal.

## Implementation Path

_Outline the expected implementation route or affected surface._

Consultar hallazgos/hashes del store real y cruzar los nodos mutados con sus aristas entrantes a 1-2 hops; proyectar las tarjetas de impacto en la pestaña Changes y las alertas en el panel Context sin sobrescribir ni ocultar hallazgos.

## Validation

_List the checks required before this task can close._

- pytest -q tests/test_mindmap_changes.py

## Done When

_Name the observable condition that makes the task complete._

Al mutar un archivo o documento en un store temporal real, la vista Changes y el panel Integrity listan el nodo modificado y los documentos dependientes afectados en base a la comparacion con la linea base previa, con pruebas pytest en verde.
