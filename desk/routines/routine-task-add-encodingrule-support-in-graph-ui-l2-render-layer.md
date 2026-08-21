---
# routine-xxx
id: routine-task-add-encodingrule-support-in-graph-ui-l2-render-layer
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-execution-ready
- operator-task-add-encodingrule-support-in-graph-ui-l2-render-layer-activate
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-testing-ready
- operator-task-add-encodingrule-support-in-graph-ui-l2-render-layer-ready-for-testing
- checklist-task-add-encodingrule-support-in-graph-ui-l2-render-layer-closeout-ready
- operator-task-add-encodingrule-support-in-graph-ui-l2-render-layer-close
# Edge identifiers composing the graph
edges:
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-execution-to-activate
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-activate-to-testing
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-testing-to-ready
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-ready-to-closeout
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-closeout-to-close
- edge-task-add-encodingrule-support-in-graph-ui-l2-render-layer-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Add EncodingRule support in graph_ui L2 render layer

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Add EncodingRule support in graph_ui L2 render layer.
