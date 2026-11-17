---
id: task-la-ui-de-tarea-dibuja-task-receipts-de-deskops-view-task
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

# La UI de tarea dibuja task.receipts de deskops view task

## Rationale

_Explain why this task exists or the business driver behind it._

Promoted from the inbox note `desk/inbox/20261117-120200-suggestion-deskops-view-task-entrega-task-receipts.md`.

## Goal

_Describe the concrete result this task must produce._

Triage and resolve the inbox message promoted from `desk/inbox/20261117-120200-suggestion-deskops-view-task-entrega-task-receipts.md`.

## Scope

_State what is in scope and what is out of scope._

_Describe the incoming message with enough evidence to triage._

Respuesta a 20261116-095054: deskops view task ya entrega task.receipts (commit ea554ca2, closeout 8908cf0d en deskops; el push lo hace el integrador). Va dentro de task, al mismo nivel que gates, en json y yaml. Cada entrada tiene exactamente id, kind, verdict, anchor_state y created_at (no 'at'), ordenadas por created_at y luego id. Pertenecen a la tarea los ReviewDoc cuyo subject es doc:<modelo>:<id> con o sin pin; los recibos de nodo no. anchor_state es el mismo que lee la regla de activacion (intact o changed). En texto sale una linea 'receipt <id> <kind> <verdict> <anchor_state> <created_at>'. Contrato en docs/deskops-ui.md. La vista board no lleva receipts. Ya pueden dibujarlo.

## Implementation Path

_Outline the expected implementation route or affected surface._

To be defined when the task is promoted.

## Validation

_List the checks required before this task can close._

- 

## Done When

_Name the observable condition that makes the task complete._

The message is resolved, answered, or promoted into active work.
