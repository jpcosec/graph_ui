# Graph UI Tasks Board

## Current State Summary

- Objective: reconstruct the reusable graph editor against a real ecosystem graph contract
- Current blocker: architecture exists, but the reusable editor is not yet integrated back into a real graph workflow

## Delivery Phases

### Phase 1 - Lock the interface contract
- `desk/tasks/001-define-graph-ui-data-contract.md`
- `desk/tasks/002-define-minimal-editing-surface.md`

### Phase 2 - Reconstruct against real data
- `desk/tasks/003-create-real-graph-fixture.md`
- `desk/tasks/004-wire-reusable-editor-to-real-fixture.md`

### Phase 3 - Prove operator value
- `desk/tasks/005-surface-semantic-signals.md`
- `desk/tasks/006-prove-one-safe-edit-flow.md`

## Active

| ID | Domain | Task | Priority | Depends On |
|----|--------|------|----------|------------|
| 001 | contract | Define graph UI data contract | p0 | none |
| 002 | editing | Define minimal editing surface | p0 | 001 |
| 003 | fixtures | Create real graph fixture | p1 | 001 |
| 004 | reconstruction | Wire reusable editor to real fixture | p1 | 001, 002, 003 |
| 005 | signals | Surface semantic signals | p1 | 004 |
| 006 | editing | Prove one safe edit flow | p1 | 002, 004 |

## Blocked

| ID | Domain | Task | Priority | Depends On |
|----|--------|------|----------|------------|
| - | - | none | - | - |

## Working Rules

1. Start from `desk/SPEC.md`.
2. Define data contracts before implementation.
3. Prove each phase with fixtures before advancing.
