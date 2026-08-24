---
source: https://reactflow.dev/api-reference/types/on-node-drag
title: OnNodeDrag
---

# OnNodeDrag

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts#L34">Source on GitHub </a>

The `OnNodeDrag` type defines the callback function that is called when
a node is being dragged. This callback receives the event and the node
that is being dragged.

```tsx
type OnNodeDrag = (event: React.MouseEvent, node: Node) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type                      | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------|
| `event` | `MouseEvent | TouchEvent` |         |
| `node`   | `NodeType`                |         |
| `nodes` | `NodeType[]`              |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
