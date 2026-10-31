---
id: task-workspace-multiproyeccion-documento-grafo-local-codigo-y-contexto
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- /home/jp/proyectos/softfactory_spec/SPEC.md
- docs/deskops-ui.md
- docs/mindmap-spec.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/mindmap/serve.py
- frontends/mindmap/workspace_routes.py
- frontends/mindmap/shell/registry.js
- frontends/mindmap/views/workspace/
- tests/test_mindmap_workspace.py
- tests/mindmap-workspace.test.mjs
- tests/e2e_mindmap_workspace.py
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
- document
---

# Workspace multiproyeccion: documento, grafo local, codigo y contexto

## Rationale

_Explain why this task exists or the business driver behind it._

En softfactory_spec (K07, K10, K13), documento, grafo, código, tarea y decisión arquitectónica son proyecciones navegables del mismo nodo lógico. Hoy Mindmap ofrece vistas globales por faceta pero no un workspace centrado en el objeto seleccionado que permita alternar entre Documento, Grafo (1-2 hops) y Código conservando su panel lateral de identidad y relaciones.

## Goal

_Describe the concrete result this task must produce._

Entregar en frontends/mindmap la vista /workspace/node con pestañas Document, Graph (vecindad a 1-2 hops con filtros por tipo) y Code (proyección del archivo o fragmento referenciado), junto con el panel lateral Context que muestra identidad, hash, estado, relaciones entrantes/salientes y permite navegar haciendo clic hacia cualquier nodo relacionado.

## Scope

_State what is in scope and what is out of scope._

Solo graph_ui: frontends/mindmap/serve.py y rutas de lectura de nodo/vecindad/código bajo el repo, frontends/mindmap/shell/registry.js, frontends/mindmap/views/workspace/, pruebas en tests/ (pytest, node --test y Playwright sobre store temporal real) y documentación en docs/. Sin mocks ni parsers propios fuera de sldb y deskops.

## Implementation Path

_Outline the expected implementation route or affected surface._

Añadir endpoint de proyección de nodo en frontends/mindmap (documento + vecindad a 1-2 hops desde el grafo del store + lectura acotada de fragmentos de archivos referenciados) y la vista /workspace/node con tabs Document/Graph/Code y panel Context reutilizando shell, router y skins existentes.

## Validation

_List the checks required before this task can close._

- pytest -q tests/test_mindmap_workspace.py
- node --test tests/mindmap-workspace.test.mjs

## Done When

_Name the observable condition that makes the task complete._

Seleccionar un documento, átomo o tarea permite alternar entre Document, Graph (1-2 hops filtrable) y Code, inspeccionar su identidad, hash y relaciones en el panel Context y navegar a cualquier nodo vinculado, con suite pytest y node --test en verde.
