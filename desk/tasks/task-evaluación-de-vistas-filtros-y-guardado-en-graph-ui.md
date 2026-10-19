---
id: task-evaluación-de-vistas-filtros-y-guardado-en-graph-ui
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references: []
depends_on:
- task-modelo-de-vista-viewdoc-en-spec2viz
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/PROJECTION_GRAMMAR_SPEC.md
---

# Evaluación de vistas, filtros y guardado en graph_ui

## Rationale

_Explain why this task exists or the business driver behind it._

Ver un corte de un store (modelos, where, relaciones) sin escribir código, guardarlo como documento y reusarlo contra cualquier store.

## Goal

_Describe the concrete result this task must produce._

graph_ui evalúa un ViewDoc con sldb.api.graph (§4) por /api/views, /api/views/evaluate y /api/views/save; el ViewsSection de review-workbench lista, carga y guarda vistas del store y el FiltersSection edita nodes y relations; e2e lo prueba en navegador.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap (evaluador y rutas) y apps/review-workbench (ViewsSection, FiltersSection, sldb provider de vistas); sin cambios de dibujo.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- tests de evaluación y rutas contra un store real y un e2e Playwright

## Done When

_Name the observable condition that makes the task complete._

graph_ui evalúa un ViewDoc con sldb.api.graph (§4) por /api/views, /api/views/evaluate y /api/views/save; el ViewsSection de review-workbench lista, carga y guarda vistas del store y el FiltersSection edita nodes y relations; e2e lo prueba en navegador.
