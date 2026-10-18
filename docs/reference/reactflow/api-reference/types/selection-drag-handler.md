---
source: https://reactflow.dev/api-reference/types/selection-drag-handler
title: SelectionDragHandler
---

# SelectionDragHandler

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts#L33">Source on GitHub </a>

The `SelectionDragHandler` type is a callback for handling drag events
involving selected nodes. It receives the triggering mouse or touch
event and an array of the affected nodes.

```tsx
type SelectionDragHandler<NodeType extends Node = Node> = (
  event: ReactMouseEvent,
  nodes: NodeType[],
) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type                              | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|---------|
| `event` | `MouseEvent<Element, MouseEvent>` |         |
| `nodes` | `NodeType[]`                      |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
