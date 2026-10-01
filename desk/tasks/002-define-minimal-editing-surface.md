---
references:
- graph_ui/desk/tasks/Board.md
- graph_ui
- ff85428
id: '002'
domain: editing
status: resolved
priority: p0
depends_on:
- '001'
created: ''
---

# Define minimal editing surface

## Rationale

_Explain why this task exists or the business driver behind it._

## Goal

_Describe the concrete result this task must produce._

Define the minimal graph editing surface over the data contract.

## Scope

_State what is in scope and what is out of scope._

## Implementation Path

_Outline the expected implementation route or affected surface._

- Added `GraphEdit` base model with `EditMetadata` (author, timestamp, reason) in `src/contracts/editing.py`.
- Implemented `NodeEdit` and `EdgeEdit` for CREATE, UPDATE, and DELETE operations.

## Validation

_List the checks required before this task can close._

- Editing contract consumed by the editor engine (task 006); repo tests green.

## Done When

_Name the observable condition that makes the task complete._
