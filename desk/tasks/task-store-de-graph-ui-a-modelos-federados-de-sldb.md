---
id: task-store-de-graph-ui-a-modelos-federados-de-sldb
status: ready_for_testing
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-closeout
history:
- task_activates
- task_hands_to_closeout
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Store de graph_ui a modelos federados de sldb

## Rationale

_Explain why this task exists or the business driver behind it._

sldb stores check marca un falso 'contract moved' en TaskDoc; sldb-04 (w34:p6) lo está viendo y propone migrar a modelos federados.

## Goal

_Describe the concrete result this task must produce._

El store .sldb de graph_ui sobre modelos federados, con sldb stores check en PASS.

## Scope

_State what is in scope and what is out of scope._

Solo el store .sldb de graph_ui, coordinado con sldb-04; sin tocar código de sldb.

## Implementation Path

_Outline the expected implementation route or affected surface._

Acordar con sldb-04 el procedimiento, aplicarlo y verificar con stores check, deskops doctor y la suite.

## Validation

_List the checks required before this task can close._

- sldb stores check --store .sldb
- deskops doctor --root .
- python3 -m pytest tests -q

## Done When

_Name the observable condition that makes the task complete._

sldb stores check --store .sldb da PASS, deskops doctor no reporta problemas y la suite está verde.
