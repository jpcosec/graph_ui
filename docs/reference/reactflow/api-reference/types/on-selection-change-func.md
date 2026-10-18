---
source: https://reactflow.dev/api-reference/types/on-selection-change-func
title: OnSelectionChangeFunc
---

# OnSelectionChangeFunc

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#98">Source on GitHub </a>

The `OnSelectionChangeFunc` type is a callback that is triggered when
the selection of nodes or edges changes. It receives an object
containing the currently selected nodes and edges.

```tsx
type OnSelectionChangeFunc = (params: { nodes: Node[]; edges: Edge[] }) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                            | Type                                          | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|---------|
| `params` | `OnSelectionChangeParams<NodeType, EdgeType>` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
