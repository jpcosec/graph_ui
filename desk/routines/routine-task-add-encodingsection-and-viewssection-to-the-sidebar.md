---
# routine-xxx
id: routine-task-add-encodingsection-and-viewssection-to-the-sidebar
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-execution-ready
- operator-task-add-encodingsection-and-viewssection-to-the-sidebar-activate
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-testing-ready
- operator-task-add-encodingsection-and-viewssection-to-the-sidebar-ready-for-testing
- checklist-task-add-encodingsection-and-viewssection-to-the-sidebar-closeout-ready
- operator-task-add-encodingsection-and-viewssection-to-the-sidebar-close
# Edge identifiers composing the graph
edges:
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-execution-to-activate
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-activate-to-testing
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-testing-to-ready
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-ready-to-closeout
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-closeout-to-close
- edge-task-add-encodingsection-and-viewssection-to-the-sidebar-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Add EncodingSection and ViewsSection to the sidebar

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Add EncodingSection and ViewsSection to the sidebar.
