---
id: board-graph-ui
title: Graph UI Tasks Board
scope: graph_ui
tasks:
- desk/tasks/001-define-graph-ui-data-contract.md
- desk/tasks/002-define-minimal-editing-surface.md
- desk/tasks/003-create-real-graph-fixture.md
- desk/tasks/004-wire-reusable-editor-to-real-fixture.md
- desk/tasks/005-surface-semantic-signals.md
- desk/tasks/006-prove-one-safe-edit-flow.md
pills: []
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
tags:
- system:graph_ui
- workspace:desk
---

# Graph UI Tasks Board

## Current State Summary

- Objective: build the sidebar-driven, savable, cross-database projection grammar on top of the reconstructed editor
- Current state: delivery tasks 001-006 resolved (closed via ritual, see git history)
- Next work: projection-grammar feature decomposed into 7 drawer tasks in `desk/drawer/tasks/`, ready to promote

## Delivery Phases

### Phase A (done) - Reconstruct the reusable editor
- `desk/tasks/001-define-graph-ui-data-contract.md`
- `desk/tasks/002-define-minimal-editing-surface.md`
- `desk/tasks/003-create-real-graph-fixture.md`
- `desk/tasks/004-wire-reusable-editor-to-real-fixture.md`
- `desk/tasks/005-surface-semantic-signals.md`
- `desk/tasks/006-prove-one-safe-edit-flow.md`

### Phase B - Projection grammar (drawer, ready to promote)
Data layer first, then presentation, then UI, then end-to-end proof. See `desk/drawer/features/` and `desk/drawer/PROJECTION_GRAMMAR_SPEC.md`.

- `desk/drawer/tasks/task-kgdb-to-ui-graph-adapter.md` (no deps)
- `desk/drawer/tasks/task-relationfilter-in-kgdb-query.md` (no deps)
- `desk/drawer/tasks/task-projectionview-store.md` (after RelationFilter)
- `desk/drawer/tasks/task-encoding-rules-l2.md` (after adapter)
- `desk/drawer/tasks/task-layout-strategy-registry.md` (after encoding)
- `desk/drawer/tasks/task-projection-sidebar-ui.md` (after store + encoding + layout)
- `desk/drawer/tasks/task-sldb-end-to-end-proof.md` (after sidebar + adapter)

## Active

| ID | Domain | Task | Priority | Depends On |
|----|--------|------|----------|------------|
| - | - | none | - | - |

## Resolved

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
