---
source: https://reactflow.dev/api-reference/types/node
title: Node
---

# Node

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L10">Source on GitHub </a>

The `Node` type represents everything React Flow needs to know about a
given node. Many of these properties can be manipulated both by React
Flow or by you, but some such as `width` and `height` should be
considered read-only.

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
<tr id="id">
<td><code dir="ltr">id</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Unique id of a node.</p>
</div></td>
<td></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">XYPosition</code>
<div>
<p>Position of a node on the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="data">
<td><code dir="ltr">data</code></td>
<td><code dir="ltr">NodeData</code>
<div>
<p>Arbitrary data passed to a node.</p>
</div></td>
<td></td>
</tr>
<tr id="sourceposition">
<td><code dir="ltr">sourcePosition</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls source position.</p>
</div></td>
<td></td>
</tr>
<tr id="targetposition">
<td><code dir="ltr">targetPosition</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls target position.</p>
</div></td>
<td></td>
</tr>
<tr id="hidden">
<td><code dir="ltr">hidden</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether or not the node should be visible on the canvas.</p>
</div></td>
<td></td>
</tr>
<tr id="selected">
<td><code dir="ltr">selected</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="dragging">
<td><code dir="ltr">dragging</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether or not the node is currently being dragged.</p>
</div></td>
<td></td>
</tr>
<tr id="draggable">
<td><code dir="ltr">draggable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether or not the node is able to be dragged.</p>
</div></td>
<td></td>
</tr>
<tr id="selectable">
<td><code dir="ltr">selectable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="connectable">
<td><code dir="ltr">connectable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="deletable">
<td><code dir="ltr">deletable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="draghandle">
<td><code dir="ltr">dragHandle</code></td>
<td><code dir="ltr">string</code>
<div>
<p>A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements.</p>
</div></td>
<td></td>
</tr>
<tr id="width">
<td><code dir="ltr">width</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="height">
<td><code dir="ltr">height</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="initialwidth">
<td><code dir="ltr">initialWidth</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="initialheight">
<td><code dir="ltr">initialHeight</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="parentid">
<td><code dir="ltr">parentId</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Parent node id, used for creating sub-flows.</p>
</div></td>
<td></td>
</tr>
<tr id="zindex">
<td><code dir="ltr">zIndex</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="extent">
<td><code dir="ltr">extent</code></td>
<td><code dir="ltr">CoordinateExtent | "parent" | null</code>
<div>
<p>Boundary a node can be moved in.</p>
</div></td>
<td></td>
</tr>
<tr id="expandparent">
<td><code dir="ltr">expandParent</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds.</p>
</div></td>
<td></td>
</tr>
<tr id="arialabel">
<td><code dir="ltr">ariaLabel</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="origin">
<td><code dir="ltr">origin</code></td>
<td><code dir="ltr">NodeOrigin</code>
<div>
<p>Origin of the node relative to its position.</p>
</div></td>
<td></td>
</tr>
<tr id="handles">
<td><code dir="ltr">handles</code></td>
<td><code dir="ltr">NodeHandle[]</code></td>
<td></td>
</tr>
<tr id="measured">
<td><code dir="ltr">measured</code></td>
<td><code dir="ltr">{ width?: number; height?: number; }</code></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">string | NodeType | (NodeType & undefined)</code>
<div>
<p>Type of node defined in nodeTypes</p>
</div></td>
<td></td>
</tr>
<tr id="style">
<td><code dir="ltr">style</code></td>
<td><code dir="ltr">CSSProperties</code></td>
<td></td>
</tr>
<tr id="classname">
<td><code dir="ltr">className</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="resizing">
<td><code dir="ltr">resizing</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="focusable">
<td><code dir="ltr">focusable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="ariarole">
<td><code dir="ltr">ariaRole</code></td>
<td><code dir="ltr">AriaRole</code>
<div>
<p>The ARIA role attribute for the node element, used for accessibility.</p>
</div></td>
<td><code dir="ltr">"group"</code></td>
</tr>
<tr id="domattributes">
<td><code dir="ltr">domAttributes</code></td>
<td><code dir="ltr">Omit<HTMLAttributes<HTMLDivElement>, "id" | "draggable" | "style" | "className" | "role" | "aria-label" | "defaultValue" | keyof DOMAttributes<HTMLDivElement>></code>
<div>
<p>General escape hatch for adding custom attributes to the node’s DOM element.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

## Default node types

You can create any of React Flow’s default nodes by setting the `type`
property to one of the following values:

-   `"default"`
-   `"input"`
-   `"output"`
-   `"group"`

If you don’t set the `type` property at all, React Flow will fallback to
the `"default"` node with both an input and output port.

These default nodes are available even if you set the
<a href="/api-reference/react-flow#node-types"><code dir="ltr">nodeTypes</code></a>
prop to something else, unless you override any of these keys directly.

## Notes

-   You shouldn’t try to set the `width` or `height` of a node directly.
    It is calculated internally by React Flow and used when rendering
    the node in the viewport. To control a node’s size you should use
    the `style` or `className` props to apply CSS styles instead.
