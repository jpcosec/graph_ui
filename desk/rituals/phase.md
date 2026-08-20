# Phase ritual

Run this when every task in a ready dependency layer (a whole phase) has closed, before starting the next layer for graph_ui.

Steps:

1. Confirm all tasks in the closing layer are resolved on `desk/tasks/Board.md`.
2. Run the full validation gate: `pytest` (and `npm run test` when the frontend changed).
3. Reconcile the board: move closed tasks to Resolved, surface the next layer's tasks as Active.
4. Update `atom-graph-ui.md` and any affected atoms if the phase changed durable architecture truth.
5. Commit the phase transition as its own atomic commit before promoting the next layer.
