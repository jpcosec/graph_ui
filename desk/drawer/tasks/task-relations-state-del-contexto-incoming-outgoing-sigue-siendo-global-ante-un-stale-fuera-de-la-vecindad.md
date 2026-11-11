---
id: task-relations-state-del-contexto-incoming-outgoing-sigue-siendo-global-ante-un-stale-fuera-de-la-vecindad
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

# relations_state del contexto (incoming/outgoing) sigue siendo global ante un stale fuera de la vecindad

## Rationale

_Explain why this task exists or the business driver behind it._

Promoted from the inbox note `desk/inbox/inbox-note-relations-state-del-contexto-incoming-outgoing-sigue-siendo-global-ante-un-stale-fuera-de-la-vecinda.md`.

## Goal

_Describe the concrete result this task must produce._

Triage and resolve the inbox message promoted from `desk/inbox/inbox-note-relations-state-del-contexto-incoming-outgoing-sigue-siendo-global-ante-un-stale-fuera-de-la-vecinda.md`.

## Scope

_State what is in scope and what is out of scope._

_Describe the incoming message with enough evidence to triage._

Pendiente de la integración deskops-ui (a1, 3b15fb6 y 01aa0e8). El grafo del vecindario ya no se bloquea por un stale de un documento ajeno; si el nodo stale no está en el índice, bloquea por seguridad. Pero relations_state del contexto (incoming/outgoing de un documento) sigue devolviendo store_no_preparado para todo nodo cuando hay un stale en cualquier parte del store. Hecho cuando relations_state aplica el mismo criterio que el grafo (bloquea si el stale toca al documento o a sus vecinos, o si el nodo stale falta del índice), con tests en test_mindmap_workspace. Relacionado con la nota de sldb 9c9dac6b (a2: stale global y rebuild que no lo resuelve).

## Implementation Path

_Outline the expected implementation route or affected surface._

To be defined when the task is promoted.

## Validation

_List the checks required before this task can close._

- 

## Done When

_Name the observable condition that makes the task complete._

The message is resolved, answered, or promoted into active work.
