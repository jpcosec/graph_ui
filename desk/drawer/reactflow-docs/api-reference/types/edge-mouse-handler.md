---
source: https://reactflow.dev/api-reference/types/edge-mouse-handler
title: EdgeMouseHandler
---

# EdgeMouseHandler

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts#L81">Source on GitHub </a>

The `EdgeMouseHandler` type defines the callback function that is called
when mouse events occur on an edge. This callback receives the event and
the edge that triggered it.

```tsx
type EdgeMouseHandler = (event: React.MouseEvent, edge: Edge) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type                              | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|---------|
| `event` | `MouseEvent<Element, MouseEvent>` |         |
| `edge`   | `EdgeType`                        |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
