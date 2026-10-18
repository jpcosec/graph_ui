---
source: https://reactflow.dev/api-reference/utils/add-edge
title: addEdge()
---

# addEdge()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts/#L100">Source on GitHub </a>

This util is a convenience function to add a new
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>
to an array of edges. It also performs some validation to make sure you
don’t add an invalid edge or duplicate an existing one.

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
 
export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (connection) => {
      setEdges((oldEdges) => addEdge(connection, oldEdges));
    },
    [setEdges],
  );
 
  return <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} />;
}
```

</div>

## Signature

**Parameters:**

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr id="edgeparams">
<td><code dir="ltr">edgeParams</code></td>
<td><code dir="ltr">EdgeType | Connection</code></td>
<td></td>
</tr>
<tr id="edges">
<td><code dir="ltr">edges</code></td>
<td><code dir="ltr">EdgeType[]</code></td>
<td></td>
</tr>
<tr id="optionsgetedgeid">
<td><code dir="ltr">options.getEdgeId</code></td>
<td><code dir="ltr">GetEdgeId</code>
<div>
<p>Custom function to generate edge IDs. If not provided, the default <code dir="ltr">getEdgeId</code> function is used.</p>
</div></td>
<td></td>
</tr>
<tr id="optionsonerror">
<td><code dir="ltr">options.onError</code></td>
<td><code dir="ltr">OnError</code>
<div>
<p>Called when edge validation fails. If not provided, a default dev warning is used.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`EdgeType[]`

</div>

## Notes

-   If an edge with the same `target` and `source` already exists (and
    the same `targetHandle` and `sourceHandle` if those are set), then
    this util won’t add a new edge even if the `id` property is
    different.
