---
# routine-xxx
id: routine-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-execution-ready
- operator-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-activate
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-testing-ready
- operator-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-ready-for-testing
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-closeout-ready
- operator-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-close
# Edge identifiers composing the graph
edges:
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-execution-to-activate
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-activate-to-testing
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-testing-to-ready
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-ready-to-closeout
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-closeout-to-close
- edge-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Feed hum-body from sldb serve (remove hardcoded content)

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Feed hum-body from sldb serve (remove hardcoded content).
