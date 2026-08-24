---
source: https://reactflow.dev/api-reference/types/handle-connection
title: HandleConnection
---

# HandleConnection

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L36-L37">Source on GitHub </a>

The `HandleConnection` type is an extension of a basic
<a href="/api-reference/types/connection">Connection</a>
that includes the `edgeId`.

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
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="sourcehandle">
<td><code dir="ltr">sourceHandle</code></td>
<td><code dir="ltr">string | null</code></td>
<td></td>
</tr>
<tr id="targethandle">
<td><code dir="ltr">targetHandle</code></td>
<td><code dir="ltr">string | null</code></td>
<td></td>
</tr>
<tr id="edgeid">
<td><code dir="ltr">edgeId</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
</tbody>
</table>
