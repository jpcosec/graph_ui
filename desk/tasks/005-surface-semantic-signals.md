---
id: '005'
domain: signals
status: resolved
priority: p1
depends_on:
- '004'
created: ''
---

# Surface semantic signals

## Objective

Surface at least one semantic or structural signal on the graph.

## Reference

- Board: `graph_ui/desk/tasks/Board.md`
- Desk: `graph_ui`
- Closed by: `8d72965`

## What Was Done

- Added `StructuralAuditor` in `src/auditor.py`: analyzes `GraphData`, decorates nodes with compliance signals via in/out adjacency.
- Added `tests/test_auditor.py`.

## Validation

`tests/test_auditor.py` green.

## Status

resolved
