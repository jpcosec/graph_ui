---
source: https://reactflow.dev/api-reference/types/on-delete
title: OnDelete
---

# OnDelete

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L59">Source on GitHub </a>

The `OnDelete` type defines the callback function that is called when
nodes or edges are deleted. This callback receives an object containing
the deleted nodes and edges.

```tsx
type OnDelete = (params: { nodes: Node[]; edges: Edge[] }) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                            | Type                                        | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|---------|
| `params` | `{ nodes: NodeType[]; edges: EdgeType[]; }` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
