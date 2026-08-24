---
source: https://reactflow.dev/api-reference/utils/get-incomers
title: getIncomers()
---

# getIncomers()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L91">Source on GitHub </a>

This util is used to tell you what nodes, if any, are connected to the
given node as the *source* of an edge.

```tsx
import { getIncomers } from '@xyflow/react';
 
const nodes = [];
const edges = [];
 
const incomers = getIncomers(
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'node' } },
  nodes,
  edges,
);
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
<tr id="node">
<td><code dir="ltr">node</code></td>
<td><code dir="ltr">NodeType | { id: string; }</code>
<div>
<p>The node to get the connected nodes from.</p>
</div></td>
<td></td>
</tr>
<tr id="nodes">
<td><code dir="ltr">nodes</code></td>
<td><code dir="ltr">NodeType[]</code>
<div>
<p>The array of all nodes.</p>
</div></td>
<td></td>
</tr>
<tr id="edges">
<td><code dir="ltr">edges</code></td>
<td><code dir="ltr">EdgeType[]</code>
<div>
<p>The array of all edges.</p>
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
