---
source: https://reactflow.dev/api-reference/types/internal-node
title: InternalNode
---

# InternalNode

<a href="https://github.com/xyflow/xyflow/blob/99985b52026cf4ac65a1033178cf8c2bea4e14fa/packages/system/src/types/nodes.ts#L68">Source on GitHub </a>

The `InternalNode` type is identical to the base
<a href="/api-reference/types/node"><code dir="ltr">Node</code></a>
type but is extended with some additional properties used internally by
React Flow. Some functions and callbacks that return nodes may return an
`InternalNode`.

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
<tr id="width">
<td><code dir="ltr">width</code></td>
<td><code dir="ltr">NodeType["width"]</code></td>
<td></td>
</tr>
<tr id="height">
<td><code dir="ltr">height</code></td>
<td><code dir="ltr">NodeType["height"]</code></td>
<td></td>
</tr>
<tr id="id">
<td><code dir="ltr">id</code></td>
<td><code dir="ltr">NodeType["id"]</code>
<div>
<p>Unique id of a node.</p>
</div></td>
<td></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">NodeType["position"]</code>
<div>
<p>Position of a node on the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">NodeType["type"]</code>
<div>
<p>Type of node defined in nodeTypes</p>
</div></td>
<td></td>
</tr>
<tr id="data">
<td><code dir="ltr">data</code></td>
<td><code dir="ltr">NodeType["data"]</code></td>
<td></td>
</tr>
<tr id="sourceposition">
<td><code dir="ltr">sourcePosition</code></td>
<td><code dir="ltr">NodeType["sourcePosition"]</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls source position.</p>
</div></td>
<td></td>
</tr>
<tr id="targetposition">
<td><code dir="ltr">targetPosition</code></td>
<td><code dir="ltr">NodeType["targetPosition"]</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls target position.</p>
</div></td>
<td></td>
</tr>
<tr id="hidden">
<td><code dir="ltr">hidden</code></td>
<td><code dir="ltr">NodeType["hidden"]</code></td>
<td></td>
</tr>
<tr id="selected">
<td><code dir="ltr">selected</code></td>
<td><code dir="ltr">NodeType["selected"]</code></td>
<td></td>
</tr>
<tr id="dragging">
<td><code dir="ltr">dragging</code></td>
<td><code dir="ltr">NodeType["dragging"]</code></td>
<td></td>
</tr>
<tr id="draggable">
<td><code dir="ltr">draggable</code></td>
<td><code dir="ltr">NodeType["draggable"]</code></td>
<td></td>
</tr>
<tr id="selectable">
<td><code dir="ltr">selectable</code></td>
<td><code dir="ltr">NodeType["selectable"]</code></td>
<td></td>
</tr>
<tr id="connectable">
<td><code dir="ltr">connectable</code></td>
<td><code dir="ltr">NodeType["connectable"]</code></td>
<td></td>
</tr>
<tr id="deletable">
<td><code dir="ltr">deletable</code></td>
<td><code dir="ltr">NodeType["deletable"]</code></td>
<td></td>
</tr>
<tr id="draghandle">
<td><code dir="ltr">dragHandle</code></td>
<td><code dir="ltr">NodeType["dragHandle"]</code>
<div>
<p>A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements.</p>
</div></td>
<td></td>
</tr>
<tr id="initialwidth">
<td><code dir="ltr">initialWidth</code></td>
<td><code dir="ltr">NodeType["initialWidth"]</code></td>
<td></td>
</tr>
<tr id="initialheight">
<td><code dir="ltr">initialHeight</code></td>
<td><code dir="ltr">NodeType["initialHeight"]</code></td>
<td></td>
</tr>
<tr id="parentid">
<td><code dir="ltr">parentId</code></td>
<td><code dir="ltr">NodeType["parentId"]</code></td>
<td></td>
</tr>
<tr id="zindex">
<td><code dir="ltr">zIndex</code></td>
<td><code dir="ltr">NodeType["zIndex"]</code></td>
<td></td>
</tr>
<tr id="extent">
<td><code dir="ltr">extent</code></td>
<td><code dir="ltr">NodeType["extent"]</code>
<div>
<p>Boundary a node can be moved in.</p>
</div></td>
<td></td>
</tr>
<tr id="expandparent">
<td><code dir="ltr">expandParent</code></td>
<td><code dir="ltr">NodeType["expandParent"]</code>
<div>
<p>When <code dir="ltr">true</code>, the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds.</p>
</div></td>
<td></td>
</tr>
<tr id="arialabel">
<td><code dir="ltr">ariaLabel</code></td>
<td><code dir="ltr">NodeType["ariaLabel"]</code></td>
<td></td>
</tr>
<tr id="origin">
<td><code dir="ltr">origin</code></td>
<td><code dir="ltr">NodeType["origin"]</code>
<div>
<p>Origin of the node relative to its position.</p>
</div></td>
<td></td>
</tr>
<tr id="handles">
<td><code dir="ltr">handles</code></td>
<td><code dir="ltr">NodeType["handles"]</code></td>
<td></td>
</tr>
<tr id="measured">
<td><code dir="ltr">measured</code></td>
<td><code dir="ltr">{ width?: number; height?: number; }</code></td>
<td></td>
</tr>
<tr id="internals">
<td><code dir="ltr">internals</code></td>
<td><code dir="ltr">{ positionAbsolute: XYPosition; z: number; rootParentIndex?: number; userNode: NodeType; handleBounds?: NodeHandleBounds; bounds?: NodeBounds; }</code></td>
<td></td>
</tr>
</tbody>
</table>
