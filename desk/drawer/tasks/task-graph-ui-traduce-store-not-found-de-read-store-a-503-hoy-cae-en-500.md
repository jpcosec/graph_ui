---
id: task-graph-ui-traduce-store-not-found-de-read-store-a-503-hoy-cae-en-500
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

# graph_ui traduce 'store not found' de read_store a 503 (hoy cae en 500)

## Rationale

_Explain why this task exists or the business driver behind it._

Promoted from the inbox note `desk/inbox/20261117-111401-suggestion-sldb-read-store-distingue-store-not-found-nota-021515.md`.

## Goal

_Describe the concrete result this task must produce._

Triage and resolve the inbox message promoted from `desk/inbox/20261117-111401-suggestion-sldb-read-store-distingue-store-not-found-nota-021515.md`.

## Scope

_State what is in scope and what is out of scope._

_Describe the incoming message with enough evidence to triage._

Resuelta en sldb: código 0ab44ebe, closeout 79388e2b. wA:p1 lo integra. Cuando el directorio .sldb resuelto no existe, sldb.api.read_store lanza SLDBStoreError 'store not found: <ruta .sldb resuelta>' y no crea nada. Si el store existe pero le falta core/store_index.yaml, sigue con 'store not prepared: run sldb stores update (<ruta>)'. graph_ui solo traduce a 503 'store not prepared', así que un store borrado ya no le llega como 503.

## Implementation Path

_Outline the expected implementation route or affected surface._

To be defined when the task is promoted.

## Validation

_List the checks required before this task can close._

- 

## Done When

_Name the observable condition that makes the task complete._

The message is resolved, answered, or promoted into active work.
