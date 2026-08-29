---
# routine-xxx
id: routine-task-generate-graph-ui-node-types-from-sldb-models-at-build-time
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-execution-ready
- operator-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-activate
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-testing-ready
- operator-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-ready-for-testing
- checklist-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-closeout-ready
- operator-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-close
# Edge identifiers composing the graph
edges:
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-execution-to-activate
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-activate-to-testing
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-testing-to-ready
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-ready-to-closeout
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-closeout-to-close
- edge-task-generate-graph-ui-node-types-from-sldb-models-at-build-time-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Generate graph_ui node types from sldb models at build time

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Generate graph_ui node types from sldb models at build time.
