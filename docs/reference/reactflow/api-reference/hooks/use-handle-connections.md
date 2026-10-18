---
source: https://reactflow.dev/api-reference/hooks/use-handle-connections
title: useHandleConnections()
---

# useHandleConnections()

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-yellow-50 x:dark:bg-yellow-700/30 x:text-yellow-700 x:dark:text-yellow-500 x:border-yellow-700">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Warning**

`useHandleConnections` is deprecated in favor of the more capable
<a href="/api-reference/hooks/use-node-connections">useNodeConnections</a>.

</div>

</div>

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useHandleConnections.ts">Source on GitHub </a>

This hook returns an array connections on a specific handle or handle
type.

```tsx
import { useHandleConnections } from '@xyflow/react';
 
export default function () {
  const connections = useHandleConnections({ type: 'target', id: 'my-handle' });
 
  return (
    <div>There are currently {connections.length} incoming connections!</div>
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
<tr id="0type">
<td><code dir="ltr">[0].type</code></td>
<td><code dir="ltr">'source' | 'target'</code>
<div>
<p>What type of handle connections do you want to observe?</p>
</div></td>
<td></td>
</tr>
<tr id="0id">
<td><code dir="ltr">[0].id</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>The handle id (this is only needed if the node has multiple handles of the same type).</p>
</div></td>
<td></td>
</tr>
<tr id="0nodeid">
<td><code dir="ltr">[0].nodeId</code></td>
<td><code dir="ltr">string</code>
<div>
<p>If node id is not provided, the node id from the <code dir="ltr">NodeIdContext</code> is used.</p>
</div></td>
<td></td>
</tr>
<tr id="0onconnect">
<td><code dir="ltr">[0].onConnect</code></td>
<td><code dir="ltr">(connections: Connection[]) => void</code>
<div>
<p>Gets called when a connection is established.</p>
</div></td>
<td></td>
</tr>
<tr id="0ondisconnect">
<td><code dir="ltr">[0].onDisconnect</code></td>
<td><code dir="ltr">(connections: Connection[]) => void</code>
<div>
<p>Gets called when a connection is removed.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`HandleConnection[]`

</div>
