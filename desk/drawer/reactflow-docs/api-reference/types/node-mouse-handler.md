---
source: https://reactflow.dev/api-reference/types/node-mouse-handler
title: NodeMouseHandler
---

# NodeMouseHandler

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts">Source on GitHub </a>

The `NodeMouseHandler` type defines the callback function that is called
when mouse events occur on a node. This callback receives the event and
the node that triggered it.

```tsx
export type NodeMouseHandler = (event: React.MouseEvent, node: Node) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type                              | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|---------|
| `event` | `MouseEvent<Element, MouseEvent>` |         |
| `node`   | `NodeType`                        |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
