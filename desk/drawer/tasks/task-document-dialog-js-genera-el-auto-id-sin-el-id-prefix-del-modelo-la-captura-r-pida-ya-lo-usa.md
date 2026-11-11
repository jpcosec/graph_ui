---
id: task-document-dialog-js-genera-el-auto-id-sin-el-id-prefix-del-modelo-la-captura-r-pida-ya-lo-usa
status: deferred
summary: ''
tags:
- workspace:desk
- artifact:task
- source:inbox
current_node: ''
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

# document-dialog.js genera el auto-id sin el id_prefix del modelo (la captura rápida ya lo usa)

## Rationale

_Explain why this task exists or the business driver behind it._

Promoted from the inbox note `desk/inbox/inbox-note-document-dialog-js-genera-el-auto-id-sin-el-id-prefix-del-modelo-la-captura-rápida-ya-lo-usa.md`.

## Goal

_Describe the concrete result this task must produce._

Triage and resolve the inbox message promoted from `desk/inbox/inbox-note-document-dialog-js-genera-el-auto-id-sin-el-id-prefix-del-modelo-la-captura-rápida-ya-lo-usa.md`.

## Scope

_State what is in scope and what is out of scope._

_Describe the incoming message with enough evidence to triage._

Pendiente de la integración deskops-ui (runs/subagents/deskops-ui-integration-report.md, master 9d0eba7). deskops CC38 (4a1aae81) exige el prefijo del modelo en el id, por ejemplo 'atom-' para AtomDoc. 428b5b7 hizo que la captura rápida use el id_prefix que publica el adaptador, en Python y en shared/documents.mjs, pero el diálogo de documento (document-dialog.js) sigue generando el auto-id sin prefijo. Crear un AtomDoc desde ese diálogo daría un id que el modelo rechaza. Hecho cuando document-dialog.js antepone id_prefix como quickId, con un test node y un e2e que crean un AtomDoc desde el diálogo.

## Implementation Path

_Outline the expected implementation route or affected surface._

To be defined when the task is promoted.

## Validation

_List the checks required before this task can close._

- 

## Done When

_Name the observable condition that makes the task complete._

The message is resolved, answered, or promoted into active work.
