---
source: https://reactflow.dev/api-reference/hooks/use-nodes-data
title: useNodesData()
---

# useNodesData()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesData.ts">Source on GitHub </a>

This hook lets you subscribe to changes of a specific nodes `data`
object.

```tsx
import { useNodesData } from '@xyflow/react';
 
export default function () {
  const nodeData = useNodesData('nodeId-1');
 
  const nodesData = useNodesData(['nodeId-1', 'nodeId-2']);
}
```

</div>

## Signature

<div
class="nextra-scrollbar x:overflow-x-auto x:overscroll-x-contain x:overflow-y-hidden x:mt-4 x:flex x:w-full x:gap-2 x:border-b x:border-gray-200 x:pb-px x:dark:border-neutral-800 x:focus-visible:nextra-focus"
role="tablist" aria-orientation="horizontal">

Function Signature 1

Function Signature 2

</div>

<div>

<div id="headlessui-tabs-panel-_R_6ist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

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
<tr id="nodeid">
<td><code dir="ltr">nodeId</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the node to get the data from.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns1"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`DistributivePick<NodeType, "id" | "type" | "data"> | null`

</div>

</div>

<div id="headlessui-tabs-panel-_R_aist5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

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
<tr id="nodeids">
<td><code dir="ltr">nodeIds</code></td>
<td><code dir="ltr">string[]</code>
<div>
<p>The ids of the nodes to get the data from.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns2"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`DistributivePick<NodeType, "id" | "type" | "data">[]`

</div>

</div>

</div>

## TypeScript

This hook accepts a generic type argument of custom node types. See this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our TypeScript guide</a>
for more information.

```tsx
const nodesData = useNodesData<NodesType>(['nodeId-1', 'nodeId-2']);
```

</div>
