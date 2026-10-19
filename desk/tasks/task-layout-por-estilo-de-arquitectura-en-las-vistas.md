---
id: task-layout-por-estilo-de-arquitectura-en-las-vistas
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references: []
depends_on:
- task-evaluación-de-vistas-filtros-y-guardado-en-graph-ui
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/PROJECTION_GRAMMAR_SPEC.md
---

# Layout por estilo de arquitectura en las vistas

## Rationale

_Explain why this task exists or the business driver behind it._

Que el layout exprese el estilo de arquitectura (capas ordenadas o anillos unidos por interfaces) y no sea genérico por vista.

## Goal

_Describe the concrete result this task must produce._

El layout de la vista (ViewDoc.layout, o el de su NotationDoc) con style layered o rings elige elk-layered o elk-rings en layout-strategies.ts; rings usa layout.ring_field; e2e verifica las posiciones.

## Scope

_State what is in scope and what is out of scope._

apps/review-workbench L2-canvas/layout y la carga de vistas.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- vitest de la selección de estrategia y un e2e con las dos

## Done When

_Name the observable condition that makes the task complete._

El layout de la vista (ViewDoc.layout, o el de su NotationDoc) con style layered o rings elige elk-layered o elk-rings en layout-strategies.ts; rings usa layout.ring_field; e2e verifica las posiciones.
