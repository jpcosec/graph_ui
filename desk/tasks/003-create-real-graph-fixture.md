---
id: '003'
domain: fixtures
status: resolved
priority: p1
depends_on:
- '001'
created: ''
---

# Create real graph fixture

## Objective

Create a real graph fixture that complies with the `GraphData` contract.

## Reference

- Board: `graph_ui/desk/tasks/Board.md`
- Desk: `graph_ui`
- Closed by: `cd84c13`

## What Was Done

- Created the ecosystem-slice fixture under desk fixtures.
- Represents core ecosystem modules (repopackage, kgdb, ontology, graph_ui, sldb).

## Validation

Fixture loads against the `GraphData` contract and feeds the wired editor (task 004).

## Status

resolved
