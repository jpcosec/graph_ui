---
source: https://reactflow.dev/api-reference/utils/reconnect-edge
title: reconnectEdge()
---

# reconnectEdge()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts">Source on GitHub </a>

A handy utility to update an existing
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>
with new properties. This searches your edge array for an edge with a
matching `id` and updates its properties with the connection you
provide.

```tsx
const onReconnect = useCallback(
  (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
  []
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
<tr id="oldedge">
<td><code dir="ltr">oldEdge</code></td>
<td><code dir="ltr">EdgeType</code></td>
<td></td>
</tr>
<tr id="newconnectionsource">
<td><code dir="ltr">newConnection.source</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the node this connection originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="newconnectiontarget">
<td><code dir="ltr">newConnection.target</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the node this connection terminates at.</p>
</div></td>
<td></td>
</tr>
<tr id="newconnectionsourcehandle">
<td><code dir="ltr">newConnection.sourceHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>When not <code dir="ltr">null</code>, the id of the handle on the source node that this connection originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="newconnectiontargethandle">
<td><code dir="ltr">newConnection.targetHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>When not <code dir="ltr">null</code>, the id of the handle on the target node that this connection terminates at.</p>
</div></td>
<td></td>
</tr>
<tr id="edges">
<td><code dir="ltr">edges</code></td>
<td><code dir="ltr">EdgeType[]</code></td>
<td></td>
</tr>
<tr id="optionsshouldreplaceid">
<td><code dir="ltr">options.shouldReplaceId</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Should the id of the old edge be replaced with the new connection id.</p>
</div></td>
<td><code dir="ltr">true</code></td>
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
