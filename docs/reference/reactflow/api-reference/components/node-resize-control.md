---
source: https://reactflow.dev/api-reference/components/node-resize-control
title: The NodeResizeControl component
---

# <NodeResizeControl />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeResizer/NodeResizeControl.tsx">Source on GitHub </a>

To create your own resizing UI, you can use the `NodeResizeControl`
component where you can pass children (such as icons).

## Props

For TypeScript users, the props type for the `<NodeResizeControl />`
component is exported as `ResizeControlProps`.

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
<p>Id of the node it is resizing.</p>
</div></td>
<td></td>
</tr>
<tr id="color">
<td><code dir="ltr">color</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Color of the resize handle.</p>
</div></td>
<td></td>
</tr>
<tr id="minwidth">
<td><code dir="ltr">minWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum width of node.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="minheight">
<td><code dir="ltr">minHeight</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum height of node.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="maxwidth">
<td><code dir="ltr">maxWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum width of node.</p>
</div></td>
<td><code dir="ltr">Number.MAX_VALUE</code></td>
</tr>
<tr id="maxheight">
<td><code dir="ltr">maxHeight</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum height of node.</p>
</div></td>
<td><code dir="ltr">Number.MAX_VALUE</code></td>
</tr>
<tr id="keepaspectratio">
<td><code dir="ltr">keepAspectRatio</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Keep aspect ratio when resizing.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="shouldresize">
<td><code dir="ltr">shouldResize</code></td>
<td><code dir="ltr">(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean</code>
<div>
<p>Callback to determine if node should resize.</p>
</div></td>
<td></td>
</tr>
<tr id="autoscale">
<td><code dir="ltr">autoScale</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Scale the controls with the zoom level.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="onresizestart">
<td><code dir="ltr">onResizeStart</code></td>
<td><code dir="ltr">OnResizeStart</code>
<div>
<p>Callback called when resizing starts.</p>
</div></td>
<td></td>
</tr>
<tr id="onresize">
<td><code dir="ltr">onResize</code></td>
<td><code dir="ltr">OnResize</code>
<div>
<p>Callback called when resizing.</p>
</div></td>
<td></td>
</tr>
<tr id="onresizeend">
<td><code dir="ltr">onResizeEnd</code></td>
<td><code dir="ltr">OnResizeEnd</code>
<div>
<p>Callback called when resizing ends.</p>
</div></td>
<td></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">ControlLinePosition | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'</code>
<div>
<p>Position of the control.</p>
</div></td>
<td></td>
</tr>
<tr id="variant">
<td><code dir="ltr">variant</code></td>
<td><code dir="ltr">ResizeControlVariant</code>
<div>
<p>Variant of the control.</p>
</div></td>
<td><code dir="ltr">"handle"</code></td>
</tr>
<tr id="resizedirection">
<td><code dir="ltr">resizeDirection</code></td>
<td><code dir="ltr">'horizontal' | 'vertical'</code>
<div>
<p>The direction the user can resize the node. If not provided, the user can resize in any direction.</p>
</div></td>
<td></td>
</tr>
<tr id="classname">
<td><code dir="ltr">className</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="style">
<td><code dir="ltr">style</code></td>
<td><code dir="ltr">CSSProperties</code></td>
<td></td>
</tr>
<tr id="children">
<td><code dir="ltr">children</code></td>
<td><code dir="ltr">ReactNode</code></td>
<td></td>
</tr>
</tbody>
</table>
