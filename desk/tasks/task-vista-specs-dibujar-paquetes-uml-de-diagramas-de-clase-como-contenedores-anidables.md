---
sldb:
  by: agent
  at: '2026-11-16T12:43:58Z'
  authority: generated
  via: save_document_payload
id: task-vista-specs-dibujar-paquetes-uml-de-diagramas-de-clase-como-contenedores-anidables
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
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
- frontends/mindmap/views/specs/notation/notation-style.mjs
- frontends/mindmap/views/specs/notation/notation.css
- tests/e2e_notation_class.py
- tests/notation-packages.test.mjs
- tests/fixtures/notation-packages/class.packages.yml
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

ENTRA: la vista Specs de frontends/mindmap/views/specs/notation/. Lo que ya existe y se reutiliza: la contención genérica (notation.mjs: SUPPORTED_DRAWS incluye nest, buildScene arma parentOf desde los links draw nest, con detección de ciclos) y el contorno de carpeta del paquete (notation-style.mjs: OUTLINE_SHAPES, OUTLINES.package, SHAPE_INNER.package y el trazado de la línea 115; notation.css: .glyph.shape-package). Lo que falta, y es el trabajo: que un glifo package que además es contenedor (data.container) dibuje ese contorno alrededor de toda la caja del contenedor, con el título en la pestaña o en una cabecera bajo la pestaña que reserve su alto (containerHeader de notation-layout.mjs), y que las clases queden dentro. Si al correr el e2e nuevo alguna de estas cosas ya funciona, no se toca. Archivos que pueden cambiar: notation-view.js, notation.mjs, notation-layout.mjs, notation-style.mjs y notation.css. Fixture: tests/fixtures/notation-packages/class.packages.yml, copia literal byte a byte de ../../sldb/tests/fixtures/specs/class.packages.yml (core > billing > Invoice, Payment; core > identity > User; shared > AuditLog: dos niveles, style.kinds para billing e identity, sin estilo para core y shared). Va en su propia carpeta para no entrar en el glob de tests/fixtures/notation-class/ de los e2e existentes. El e2e nuevo vive en tests/e2e_notation_class.py con su propia constante PACKAGES = ROOT / 'tests' / 'fixtures' / 'notation-packages' y sincroniza con 'sldb notations sync --spec class.packages.yml --store .sldb' en un store temporal, igual que los demás e2e después de la tarea IR13 de la que depende. Prueba node nueva en tests/notation-packages.test.mjs, obligatoria si cambia notation.mjs, notation-layout.mjs o notation-style.mjs. Las clases no heredan el color del paquete. Sin data.packages nada cambia: los e2e de clase existentes (R9, R10, compartimentos) siguen en verde. NO ENTRA: notation-deployment.mjs, cambiar el contrato o la notación en sldb (si falta algo, nota por inbox a sldb y la tarea se detiene), el layout de otros tipos de diagrama, spec2viz.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Leer el contrato en ../../sldb/src/sldb/notations/builtin/uml-class.yml y la salida de sldb.api.notations.resolve_view sobre class.packages.yml: nodos de paquete con glyph package y container, links uml-class.contains con draw nest. 2) Escribir primero el e2e (paso 4) y correrlo contra el código actual para ver qué falla. 3) Corregir solo lo que falle: el contorno OUTLINES.package escalado a la caja del contenedor, el título del paquete en su cabecera con alto reservado (containerHeader), la contención de las clases por la ruta genérica de buildScene/parentOf; sin duplicar código de notation-deployment.mjs. 4) e2e en Chromium a 1800x1200 sobre class.packages.yml: (a) la caja de cada clase cae dentro de la de su paquete y billing e identity dentro de core (los dos niveles); (b) criterio G2: la cabecera del paquete reserva su alto y el primer hijo empieza debajo, su título no queda tapado; (c) criterio R13: tras «Ver todo» todo el diagrama queda dentro de window.innerWidth x window.innerHeight; (d) todo texto visible mide al menos 10 px; (e) el estilo computado del contorno de billing e identity tiene el fill de su kind y el de las clases de adentro no. 5) Guardar una captura PNG de /specs/notation sobre class.packages.yml en runs/subagents/<run_dir>/packages.png, con el run_dir que asigne el despacho, y commitear.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/e2e_notation_class.py
- node --test tests/*.test.mjs

## Done When

_Name the observable condition that makes the task complete._

`python -m pytest -q -rs tests/e2e_notation_class.py` pasa con el e2e nuevo de paquetes y sin skips, y una captura de /specs/notation sobre class.packages.yml muestra cada clase dentro de su paquete con pestaña y título visibles.
