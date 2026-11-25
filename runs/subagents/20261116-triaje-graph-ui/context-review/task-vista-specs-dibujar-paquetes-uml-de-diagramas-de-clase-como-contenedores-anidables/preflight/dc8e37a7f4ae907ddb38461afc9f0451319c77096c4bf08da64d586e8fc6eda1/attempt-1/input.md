FILE:desk/tasks/task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables.md
---
sldb:
  by: agent
  at: '2026-11-16T03:37:56Z'
  authority: generated
  via: save_document_payload
id: task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- desk/inbox/20261020-122513-suggestion-contrato-de-lectura-paquetes-uml-en-diagramas-de-clase-spec2viz-84686c3.md
- ../../sldb/src/sldb/notations/builtin/uml-class.yml
- ../../sldb/tests/fixtures/specs/class.packages.yml
depends_on:
- task-ir13-migrar-graph-ui-de-spec2viz-a-sldb-api-notations-resolve-view-sync-de-specs-viewdoc-pilotos-com
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/views/specs/notation/notation-view.js
- frontends/mindmap/views/specs/notation/notation.mjs
- frontends/mindmap/views/specs/notation/notation-layout.mjs
- frontends/mindmap/views/specs/notation/notation.css
- tests/e2e_notation_class.py
- tests/fixtures/notation-pilots/class.packages.yml
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
- atom-cómo-decide-el-layout-de-una-vista-su-estilo-de-arquitectura
from_drawer: desk/drawer/features/backlog-diagramas-pausa-2026-10-20.md
---

# Vista Specs: dibujar paquetes UML de diagramas de clase como contenedores anidables

## Rationale

_Explain why this task exists or the business driver behind it._

El contrato de paquetes UML (spec2viz 84686c3, notation-contract.md §15; hoy en sldb: notación builtin sldb/src/sldb/notations/builtin/uml-class.yml, glifo `package` con where collection = "packages" y link contains con draw nest) llegó el 2026-10-20 (nota del inbox 20261020-122513) y la vista Specs no lo dibuja: un spec type class con data.packages muestra los paquetes como cajas sueltas. Quedó registrado en el backlog de diagramas pausado (drawer backlog-diagramas-pausa-2026-10-20.md) como el único ítem sin empezar del lado de graph_ui.

## Goal

_Describe the concrete result this task must produce._

Un spec class con data.packages se ve en /specs/notation con cada paquete como contenedor con forma package (carpeta con pestaña UML y su título), con sus clases y subpaquetes adentro a cualquier profundidad, el relleno/trazo/ícono de node.style del paquete, y las mismas garantías de legibilidad que los otros diagramas (nada tapado, «Ver todo» entra en la ventana).

## Scope

_State what is in scope and what is out of scope._

ENTRA: la vista Specs de frontends/mindmap/views/specs/notation/ (notation-view.js, notation.mjs, notation-layout.mjs, notation.css) para que los links contains con draw nest del paquete a cada hijo se dibujen como contención (igual que los nodos anidados de deployment) y la forma package; un e2e nuevo en tests/e2e_notation_class.py sobre el fixture class.packages.yml (copiado de sldb/tests/fixtures/specs/class.packages.yml a tests/fixtures/notation-pilots/); una prueba node de la lógica pura si se toca notation-layout.mjs. Las clases no heredan el color del paquete. Sin data.packages nada cambia (los e2e de clase existentes siguen en verde). NO ENTRA: cambiar el contrato ni la notación en sldb (si falta algo, nota por inbox a sldb), el layout de otros tipos de diagrama, spec2viz.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Leer el contrato en sldb/src/sldb/notations/builtin/uml-class.yml y lo que devuelve `sldb.api.notations.resolve_view` para class.packages.yml (nodos con glyph package, links uml-class.contains con draw nest). 2) Reusar la ruta de contención que ya usa deployment (parentId, container, containerHeader en notation-layout.mjs y notation-deployment.mjs) para class; agregar la forma `shape-package` en notation.css con la pestaña. 3) e2e en Chromium: cada clase cae dentro de la caja de su paquete, un subpaquete dentro de su padre, el título del paquete no queda tapado por el primer hijo (criterio G2) y «Ver todo» entra en la ventana (R13). 4) Captura en runs/subagents/<run>/ y commit.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/e2e_notation_class.py
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

`python -m pytest -q -rs tests/e2e_notation_class.py` pasa con el e2e nuevo de paquetes y sin skips, y una captura de /specs/notation sobre class.packages.yml muestra cada clase dentro de su paquete con pestaña y título visibles.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

