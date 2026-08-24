---
source: https://reactflow.dev/api-reference/types/on-nodes-delete
title: OnNodesDelete
---

# OnNodesDelete

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L51">Source on GitHub </a>

The `OnNodesDelete` type defines the callback function that is called
when nodes are deleted. This callback receives an array of the deleted
nodes.

```tsx
type OnNodesDelete = (nodes: Node[]) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type         | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `nodes` | `NodeType[]` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
