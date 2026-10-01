---
references:
- graph_ui/desk/tasks/Board.md
- graph_ui
- cd84c13
id: '003'
domain: fixtures
status: resolved
priority: p1
depends_on:
- '001'
created: ''
---

# Create real graph fixture

## Rationale

_Explain why this task exists or the business driver behind it._

## Goal

_Describe the concrete result this task must produce._

Create a real graph fixture that complies with the `GraphData` contract.

## Scope

_State what is in scope and what is out of scope._

## Implementation Path

_Outline the expected implementation route or affected surface._

- Created the ecosystem-slice fixture under desk fixtures.
- Represents core ecosystem modules (repopackage, kgdb, ontology, graph_ui, sldb).

## Validation

_List the checks required before this task can close._

- Fixture loads against the `GraphData` contract and feeds the wired editor (task 004).

## Done When

_Name the observable condition that makes the task complete._
