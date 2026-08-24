---
source: https://reactflow.dev/api-reference/utils/get-connected-edges
title: getConnectedEdges()
---

# getConnectedEdges()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L224">Source on GitHub </a>

This utility filters an array of edges, keeping only those where either
the source or target node is present in the given array of nodes.

```tsx
import { getConnectedEdges } from '@xyflow/react';
 
const nodes = [
  { id: 'a', position: { x: 0, y: 0 } },
  { id: 'b', position: { x: 100, y: 0 } },
];
const edges = [
  { id: 'a->c', source: 'a', target: 'c' },
  { id: 'c->d', source: 'c', target: 'd' },
];
 
const connectedEdges = getConnectedEdges(nodes, edges);
// => [{ id: 'a->c', source: 'a', target: 'c' }]
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
<tr id="nodes">
<td><code dir="ltr">nodes</code></td>
<td><code dir="ltr">NodeType[]</code>
<div>
<p>Nodes you want to get the connected edges for.</p>
</div></td>
<td></td>
</tr>
<tr id="edges">
<td><code dir="ltr">edges</code></td>
<td><code dir="ltr">EdgeType[]</code>
<div>
<p>All edges.</p>
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
