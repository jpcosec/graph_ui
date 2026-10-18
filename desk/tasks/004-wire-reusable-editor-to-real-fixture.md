---
id: '004'
status: resolved
summary: ''
tags:
- domain:reconstruction
- priority:p1
current_node: ''
history: []
references:
- graph_ui/desk/tasks/Board.md
- graph_ui
- 4fd4c1e
depends_on:
- 001-define-graph-ui-data-contract
- 002-define-minimal-editing-surface
- 003-create-real-graph-fixture
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Wire reusable editor to real fixture

## Rationale

_Explain why this task exists or the business driver behind it._



## Goal

_Describe the concrete result this task must produce._

Wire the reusable editor architecture to the real fixture.

## Scope

_State what is in scope and what is out of scope._



## Implementation Path

_Outline the expected implementation route or affected surface._

- Connected the editor render path to the ecosystem-slice fixture via the data contract.
- Established the reusable provider path later evolved into the live `sldb serve` provider.

## Validation

_List the checks required before this task can close._

- Editor renders the real fixture; superseded live by the Antonia flow (`11ba23f`, `050a35e`).

## Done When

_Name the observable condition that makes the task complete._
