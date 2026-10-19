---
id: task-estilo-de-notación-en-las-vistas-viewdoc-de-review-workbench
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references: []
depends_on:
- task-estilo-de-glifos-en-la-vista-specs-colores-íconos-formas-y-leyenda
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Estilo de notación en las vistas (ViewDoc) de review-workbench

## Rationale

_Explain why this task exists or the business driver behind it._

Un ViewDoc puede nombrar una notación; spec2viz expone resolve_documents para aplicarla a documentos de cualquier modelo.

## Goal

_Describe the concrete result this task must produce._

El servidor de graph_ui aplica la notación de la vista con resolve_documents y review-workbench dibuja cada nodo con el estilo de su glifo y la leyenda de la notación; e2e.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap (views_routes, adapter) y apps/review-workbench (canvas, leyenda).

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- e2e en Chromium de una vista con notación

## Done When

_Name the observable condition that makes the task complete._

El servidor de graph_ui aplica la notación de la vista con resolve_documents y review-workbench dibuja cada nodo con el estilo de su glifo y la leyenda de la notación; e2e.
