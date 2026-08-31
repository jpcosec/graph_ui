---
id: '001'
domain: contract
status: resolved
priority: p0
depends_on: []
created: ''
---

# Define graph UI data contract

## Objective

Define the canonical graph UI data contract that every render and edit path consumes.

## Reference

- Board: `graph_ui/desk/tasks/Board.md`
- Desk: `graph_ui`
- Closed by: `3900ad4`

## What Was Done

- Added `UINode`, `UIEdge`, and `GraphData` Pydantic models in `src/contracts/graph_data.py`.
- Included 3D positioning, compliance signals, and rich metadata.

## Validation

Contract models exercised by downstream fixture, auditor, and editor tasks; repo tests green.

## Status

resolved
