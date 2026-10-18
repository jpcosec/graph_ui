---
source: https://reactflow.dev/api-reference/types/connection
title: Connection
---

# Connection

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L29-L34">Source on GitHub </a>

The `Connection` type is the basic minimal description of an
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>
between two nodes. The
<a href="/api-reference/utils/add-edge"><code dir="ltr">addEdge</code></a>
util can be used to upgrade a `Connection` to an
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>.

## Fields

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
<tr id="source">
<td><code dir="ltr">source</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the node this connection originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="target">
<td><code dir="ltr">target</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the node this connection terminates at.</p>
</div></td>
<td></td>
</tr>
<tr id="sourcehandle">
<td><code dir="ltr">sourceHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>When not <code dir="ltr">null</code>, the id of the handle on the source node that this connection originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="targethandle">
<td><code dir="ltr">targetHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>When not <code dir="ltr">null</code>, the id of the handle on the target node that this connection terminates at.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>
