---
source: https://reactflow.dev/api-reference/utils/apply-node-changes
title: applyNodeChanges()
---

# applyNodeChanges()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/utils/changes.ts/#L140">Source on GitHub </a>

Various events on the
<a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
component can produce a
<a href="/api-reference/types/node-change"><code dir="ltr">NodeChange</code></a>
that describes how to update the nodes of your flow in some way. If you
don’t need any custom behavior, this util can be used to take an array
of these changes and apply them to your nodes.

```tsx
import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges } from '@xyflow/react';
 
export default function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
    },
    [setNodes],
  );
 
  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
  );
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
<tr id="changes">
<td><code dir="ltr">changes</code></td>
<td><code dir="ltr">NodeChange<NodeType>[]</code>
<div>
<p>Array of changes to apply.</p>
</div></td>
<td></td>
</tr>
<tr id="nodes">
<td><code dir="ltr">nodes</code></td>
<td><code dir="ltr">NodeType[]</code>
<div>
<p>Array of nodes to apply the changes to.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`NodeType[]`

</div>

## Notes

-   If you don’t need any custom behavior, the
    <a href="/api-reference/hooks/use-nodes-state"><code dir="ltr">useNodesState</code></a>
    hook conveniently wraps this util and React’s `useState` hook for
    you and might be simpler to use.
