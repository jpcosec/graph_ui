---
id: '004'
domain: reconstruction
status: resolved
priority: p1
depends_on:
- '001'
- '002'
- '003'
created: ''
---

# Wire reusable editor to real fixture

## Objective

Wire the reusable editor architecture to the real fixture.

## Reference

- Board: `graph_ui/desk/tasks/Board.md`
- Desk: `graph_ui`
- Closed by: `4fd4c1e`

## What Was Done

- Connected the editor render path to the ecosystem-slice fixture via the data contract.
- Established the reusable provider path later evolved into the live `sldb serve` provider.

## Validation

Editor renders the real fixture; superseded live by the Antonia flow (`11ba23f`, `050a35e`).

## Status

resolved
