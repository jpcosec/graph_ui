---
id: task-modelo-de-vista-viewdoc-en-spec2viz
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/PROJECTION_GRAMMAR_SPEC.md
---

# Modelo de vista ViewDoc en spec2viz

## Rationale

_Explain why this task exists or the business driver behind it._

Las vistas de la gramática de proyección son documentos del store y spec2viz es dueño del vocabulario visual (D3): su modelo vive junto a NotationDoc.

## Goal

_Describe the concrete result this task must produce._

spec2viz.sldb_models.ViewDoc existe en spec2viz main con los campos de PROJECTION_GRAMMAR_SPEC §3 (nodes {model, where}, relations, direction, notation, layout) y graph_ui puede trackear y leer un ViewDoc.

## Scope

_State what is in scope and what is out of scope._

Pedido a spec2viz por su inbox (lo implementa spec2viz); en graph_ui solo se verifica que el modelo se importa y se trackea.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- ViewDoc importable desde spec2viz.sldb_models y un test de graph_ui que crea un ViewDoc en un store temporal

## Done When

_Name the observable condition that makes the task complete._

spec2viz.sldb_models.ViewDoc existe en spec2viz main con los campos de PROJECTION_GRAMMAR_SPEC §3 (nodes {model, where}, relations, direction, notation, layout) y graph_ui puede trackear y leer un ViewDoc.
