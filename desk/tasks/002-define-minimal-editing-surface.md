---
id: '002'
domain: editing
status: resolved
priority: p0
depends_on:
- '001'
created: ''
---

# Define minimal editing surface

## Objective

Define the minimal graph editing surface over the data contract.

## Reference

- Board: `graph_ui/desk/tasks/Board.md`
- Desk: `graph_ui`
- Closed by: `ff85428`

## What Was Done

- Added `GraphEdit` base model with `EditMetadata` (author, timestamp, reason) in `src/contracts/editing.py`.
- Implemented `NodeEdit` and `EdgeEdit` for CREATE, UPDATE, and DELETE operations.

## Validation

Editing contract consumed by the editor engine (task 006); repo tests green.

## Status

resolved
