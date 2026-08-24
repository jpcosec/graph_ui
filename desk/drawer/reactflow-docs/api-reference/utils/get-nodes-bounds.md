---
source: https://reactflow.dev/api-reference/utils/get-nodes-bounds
title: getNodesBounds()
---

# getNodesBounds()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L133">Source on GitHub </a>

Returns the bounding box that contains all the given nodes in an array.
This can be useful when combined with
<a href="/api-reference/utils/get-viewport-for-bounds"><code dir="ltr">getViewportForBounds</code></a>
to calculate the correct transform to fit the given nodes in a viewport.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Note**

This function was previously called `getRectOfNodes`

</div>

</div>

```tsx
import { getNodesBounds } from '@xyflow/react';
 
const nodes = [
  {
    id: 'a',
    position: { x: 0, y: 0 },
    data: { label: 'a' },
    width: 50,
    height: 25,
  },
  {
    id: 'b',
    position: { x: 100, y: 100 },
    data: { label: 'b' },
    width: 50,
    height: 25,
  },
];
 
const bounds = getNodesBounds(nodes);
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
<td><code dir="ltr">(string | NodeType | InternalNodeBase<NodeType>)[]</code>
<div>
<p>Nodes to calculate the bounds for.</p>
</div></td>
<td></td>
</tr>
<tr id="paramsnodeorigin">
<td><code dir="ltr">params.nodeOrigin</code></td>
<td><code dir="ltr">NodeOrigin</code>
<div>
<p>Origin of the nodes: <code dir="ltr">[0, 0]</code> for top-left, <code dir="ltr">[0.5, 0.5]</code> for center.</p>
</div></td>
<td><code dir="ltr">[0, 0]</code></td>
</tr>
<tr id="paramsnodelookup">
<td><code dir="ltr">params.nodeLookup</code></td>
<td><code dir="ltr">NodeLookup<InternalNodeBase<NodeType>></code></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`Rect`

</div>
