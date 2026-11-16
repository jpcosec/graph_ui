---
sldb:
  by: agent
  at: '2026-11-16T12:43:41Z'
  authority: generated
  via: save_document_payload
id: task-decisión-de-jp-el-workspace-de-graph-ui-edita-y-ancla-código-softfactory-k03-k05-k12-o-solo-muestra
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- ../../sldb/docs/architecture/code-anchoring.md
- /home/jp/proyectos/softfactory_spec/SPEC.md
depends_on: []
pills: []
files:
- docs/decisiones/2026-11-codigo-en-el-workspace.md
task_type: task.decision
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/tasks/task-edicion-y-anclaje-de-codigo-con-tree-sitter-e-identidad-ante-refactor.md
---

# Decisión de JP: ¿el workspace de graph_ui edita y ancla código (softfactory K03/K05/K12) o solo muestra el estado de los CodeAnchorDoc de sldb?

## Rationale

_Explain why this task exists or the business driver behind it._

El drawer guardaba desde el 2026-10-31 "Edición y anclaje de código con Tree-sitter e identidad ante refactor" (softfactory_spec K03, K05, K12 / U03, U05), a la espera de que el store cerrara el contrato de anclas. Ese contrato ya existe en sldb (docs/architecture/code-anchoring.md: CodeAnchorDoc, `code:<ruta>::<qualified_name>`, fingerprints signature/shape/docstring/body, `sldb anchors record` y `anchors check --record` con reconexión ante renombres). Lo que falta no es técnico: decidir cuánto del trabajo con código asume graph_ui, que es un producto distinto de la UI de deskops y con función propia. Es una decisión de producto de JP.

## Goal

_Describe the concrete result this task must produce._

Una decisión escrita de JP, con una de tres opciones: (A) graph_ui solo muestra, en la vista inspect, los anclajes de código de un documento y su estado (intact/changed/lost) leyendo CodeAnchorDoc por la API de sldb, sin editar código; (B) además edita fragmentos de código anclados desde el workspace (K05), con escritura y reanclaje por sldb; (C) nada de código en graph_ui; el tema pasa a la UI de deskops o se descarta.

## Scope

_State what is in scope and what is out of scope._

ENTRA: presentar las opciones A/B/C con su costo y lo que cada una implica para el workspace; registrar la respuesta de JP como documento en docs/decisiones/2026-11-codigo-en-el-workspace.md; según la respuesta, crear la tarea de código correspondiente con deskops add task (host:local) o dejar constancia del descarte. NO ENTRA: implementar nada, tocar sldb o kimun.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) El coordinador presenta a JP las tres opciones con la evidencia de sldb/docs/architecture/code-anchoring.md. 2) JP elige; el coordinador registra el recibo owner. 3) Se escribe el documento de decisión y, si es A o B, se crea la tarea task.code con su contrato completo.

## Validation

_List the checks required before this task can close._

- test -s docs/decisiones/2026-11-codigo-en-el-workspace.md

## Done When

_Name the observable condition that makes the task complete._

docs/decisiones/2026-11-codigo-en-el-workspace.md existe con la opción elegida por JP y su fecha, y, si eligió A o B, hay una tarea task.code nueva en desk/tasks/ que la implementa.
