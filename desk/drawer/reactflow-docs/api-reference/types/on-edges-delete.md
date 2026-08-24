---
source: https://reactflow.dev/api-reference/types/on-edges-delete
title: OnEdgesDelete
---

# OnEdgesDelete

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L52">Source on GitHub </a>

The `OnEdgesDelete` type defines the callback function that is called
when edges are deleted. This callback receives an array of the deleted
edges.

```tsx
type OnEdgesDelete = (edges: Edge[]) => void;
```

</div>

**Parameters:**

| Name                                                                                                                                                                                                                                                                          | Type         | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------|
| `edges` | `EdgeType[]` |         |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>
