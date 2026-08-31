---
id: ritual-phase
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
steps: []
---

# Phase ritual

## Purpose

_Explain why this ritual exists._

Run this when every task in a ready dependency layer (a whole phase) has closed, before starting the next layer for graph_ui.

## Trigger

_State when this ritual should start._

When all tasks in the closing dependency layer are resolved.

## Preconditions

_List the conditions that must hold before running the ritual._

- All tasks in the closing layer are resolved on `desk/tasks/Board.md`.
- The full validation gate is available to run.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes, plus `npm run test` when the frontend changed.
- The board reconciles closed tasks to Resolved and surfaces the next layer as Active.

## Failure Modes

_List common mistakes this ritual prevents._

- Starting the next layer before the current one is fully closed.
- Leaving durable architecture truth un-reflected in atoms.

## Completion

_Describe what completion looks like._

The phase transition is committed as its own atomic commit before the next layer is promoted.
