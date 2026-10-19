---
id: task-estilo-de-glifos-en-la-vista-specs-colores-íconos-formas-y-leyenda
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
---

# Estilo de glifos en la vista Specs: colores, íconos, formas y leyenda

## Rationale

_Explain why this task exists or the business driver behind it._

La notación ya declara cómo se ve cada elemento (spec2viz §13): fill, stroke e ícono resueltos por tema, color de línea y formas nuevas; graph_ui debe dibujarlos en vez de íconos fijos por clase.

## Goal

_Describe the concrete result this task must produce._

La vista Specs usa node.style (fill/stroke por tema, ícono lucide), link.color y las formas cylinder, queue, cloud, package y note; classes.mjs solo cuando el glifo no declara estilo; leyenda por notación (glifo -> forma, color, ícono, rótulo); e2e en Chromium.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation (vista, css, layout) y shell si hace falta el set de íconos.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- e2e en Chromium que verifica color, ícono, forma y leyenda

## Done When

_Name the observable condition that makes the task complete._

La vista Specs usa node.style (fill/stroke por tema, ícono lucide), link.color y las formas cylinder, queue, cloud, package y note; classes.mjs solo cuando el glifo no declara estilo; leyenda por notación (glifo -> forma, color, ícono, rótulo); e2e en Chromium.
