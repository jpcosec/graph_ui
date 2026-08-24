---
source: https://reactflow.dev/api-reference/types/connection-line-component-props
title: ConnectionLineComponentProps
---

# ConnectionLineComponentProps

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L193">Source on GitHub </a>

If you want to render a custom component for connection lines, you can
set the `connectionLineComponent` prop on the
<a href="/api-reference/react-flow#connection-connectionLineComponent"><code dir="ltr"><ReactFlow /></code></a>
component. The `ConnectionLineComponentProps` are passed to your custom
component.

## Props

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
<tr id="connectionlinestyle">
<td><code dir="ltr">connectionLineStyle</code></td>
<td><code dir="ltr">CSSProperties</code></td>
<td></td>
</tr>
<tr id="connectionlinetype">
<td><code dir="ltr">connectionLineType</code></td>
<td><code dir="ltr">ConnectionLineType</code></td>
<td></td>
</tr>
<tr id="fromnode">
<td><code dir="ltr">fromNode</code></td>
<td><code dir="ltr">InternalNode<NodeType></code>
<div>
<p>The node the connection line originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="fromhandle">
<td><code dir="ltr">fromHandle</code></td>
<td><code dir="ltr">Handle</code>
<div>
<p>The handle on the <code dir="ltr">fromNode</code> that the connection line originates from.</p>
</div></td>
<td></td>
</tr>
<tr id="fromx">
<td><code dir="ltr">fromX</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="fromy">
<td><code dir="ltr">fromY</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="tox">
<td><code dir="ltr">toX</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="toy">
<td><code dir="ltr">toY</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="fromposition">
<td><code dir="ltr">fromPosition</code></td>
<td><code dir="ltr">Position</code></td>
<td></td>
</tr>
<tr id="toposition">
<td><code dir="ltr">toPosition</code></td>
<td><code dir="ltr">Position</code></td>
<td></td>
</tr>
<tr id="connectionstatus">
<td><code dir="ltr">connectionStatus</code></td>
<td><code dir="ltr">"valid" | "invalid" | null</code>
<div>
<p>If there is an <code dir="ltr">isValidConnection</code> callback, this prop will be set to <code dir="ltr">"valid"</code> or <code dir="ltr">"invalid"</code> based on the return value of that callback. Otherwise, it will be <code dir="ltr">null</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="tonode">
<td><code dir="ltr">toNode</code></td>
<td><code dir="ltr">InternalNode<NodeType> | null</code></td>
<td></td>
</tr>
<tr id="tohandle">
<td><code dir="ltr">toHandle</code></td>
<td><code dir="ltr">Handle | null</code></td>
<td></td>
</tr>
<tr id="pointer">
<td><code dir="ltr">pointer</code></td>
<td><code dir="ltr">XYPosition</code></td>
<td></td>
</tr>
</tbody>
</table>
