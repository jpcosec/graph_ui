---
id: '005'
status: resolved
summary: ''
tags:
- domain:signals
- priority:p1
current_node: ''
history: []
references:
- graph_ui/desk/tasks/Board.md
- graph_ui
- 8d72965
depends_on:
- 004-wire-reusable-editor-to-real-fixture
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Surface semantic signals

## Rationale

_Explain why this task exists or the business driver behind it._



## Goal

_Describe the concrete result this task must produce._

Surface at least one semantic or structural signal on the graph.

## Scope

_State what is in scope and what is out of scope._



## Implementation Path

_Outline the expected implementation route or affected surface._

- Added `StructuralAuditor` in `src/auditor.py`: analyzes `GraphData`, decorates nodes with compliance signals via in/out adjacency.
- Added `tests/test_auditor.py`.

## Validation

_List the checks required before this task can close._

- `tests/test_auditor.py` green.

## Done When

_Name the observable condition that makes the task complete._
