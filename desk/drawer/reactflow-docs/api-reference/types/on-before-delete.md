---
source: https://reactflow.dev/api-reference/types/on-before-delete
title: OnBeforeDelete
---

# OnBeforeDelete

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L207">Source on GitHub </a>

The `OnBeforeDelete` type defines the callback function that is called
before nodes or edges are deleted. This callback receives an object
containing the nodes and edges that are about to be deleted.

```tsx
type OnBeforeDelete = (params: {
  nodes: Node[];
  edges: Edge[];
}) => Promise<boolean | {
  nodes: Node[];
  edges: Edge[];
})>;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                      | Type                                        | Default |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|---------|
| `__0` | `{ nodes: NodeType[]; edges: EdgeType[]; }` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`Promise<boolean | { nodes: NodeType[]; edges: EdgeType[]; }>`

</div>
