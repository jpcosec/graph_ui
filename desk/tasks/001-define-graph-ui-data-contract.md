---
references:
- graph_ui/desk/tasks/Board.md
- graph_ui
- 3900ad4
id: '001'
domain: contract
status: resolved
priority: p0
depends_on: []
created: ''
---

# Define graph UI data contract

## Rationale

_Explain why this task exists or the business driver behind it._

## Goal

_Describe the concrete result this task must produce._

Define the canonical graph UI data contract that every render and edit path consumes.

## Scope

_State what is in scope and what is out of scope._

## Implementation Path

_Outline the expected implementation route or affected surface._

- Added `UINode`, `UIEdge`, and `GraphData` Pydantic models in `src/contracts/graph_data.py`.
- Included 3D positioning, compliance signals, and rich metadata.

## Validation

_List the checks required before this task can close._

- Contract models exercised by downstream fixture, auditor, and editor tasks; repo tests green.

## Done When

_Name the observable condition that makes the task complete._
