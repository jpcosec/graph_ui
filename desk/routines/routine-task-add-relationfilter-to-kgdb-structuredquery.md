---
# routine-xxx
id: routine-task-add-relationfilter-to-kgdb-structuredquery
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-add-relationfilter-to-kgdb-structuredquery-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-add-relationfilter-to-kgdb-structuredquery-execution-ready
- operator-task-add-relationfilter-to-kgdb-structuredquery-activate
- checklist-task-add-relationfilter-to-kgdb-structuredquery-testing-ready
- operator-task-add-relationfilter-to-kgdb-structuredquery-ready-for-testing
- checklist-task-add-relationfilter-to-kgdb-structuredquery-closeout-ready
- operator-task-add-relationfilter-to-kgdb-structuredquery-close
# Edge identifiers composing the graph
edges:
- edge-task-add-relationfilter-to-kgdb-structuredquery-execution-to-activate
- edge-task-add-relationfilter-to-kgdb-structuredquery-activate-to-testing
- edge-task-add-relationfilter-to-kgdb-structuredquery-testing-to-ready
- edge-task-add-relationfilter-to-kgdb-structuredquery-ready-to-closeout
- edge-task-add-relationfilter-to-kgdb-structuredquery-closeout-to-close
- edge-task-add-relationfilter-to-kgdb-structuredquery-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Add RelationFilter to kgdb StructuredQuery

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Add RelationFilter to kgdb StructuredQuery.
