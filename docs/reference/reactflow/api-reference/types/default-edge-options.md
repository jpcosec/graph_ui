---
source: https://reactflow.dev/api-reference/types/default-edge-options
title: DefaultEdgeOptions
---

# DefaultEdgeOptions

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L88-L89">Source on GitHub </a>

Many properties on an
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>
are optional. When a new edge is created, the properties that are not
provided will be filled in with the default values passed to the
`defaultEdgeOptions` prop of the
<a href="/api-reference/react-flow#defaultedgeoptions"><code dir="ltr"><ReactFlow /></code></a>
component.

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
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">string | undefined</code>
<div>
<p>Type of edge defined in <code dir="ltr">edgeTypes</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="animated">
<td><code dir="ltr">animated</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="hidden">
<td><code dir="ltr">hidden</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="deletable">
<td><code dir="ltr">deletable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="selectable">
<td><code dir="ltr">selectable</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="data">
<td><code dir="ltr">data</code></td>
<td><code dir="ltr">Record<string, unknown></code>
<div>
<p>Arbitrary data passed to an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="markerstart">
<td><code dir="ltr">markerStart</code></td>
<td><code dir="ltr">EdgeMarkerType</code>
<div>
<p>Set the marker on the beginning of an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="markerend">
<td><code dir="ltr">markerEnd</code></td>
<td><code dir="ltr">EdgeMarkerType</code>
<div>
<p>Set the marker on the end of an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="zindex">
<td><code dir="ltr">zIndex</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="arialabel">
<td><code dir="ltr">ariaLabel</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="interactionwidth">
<td><code dir="ltr">interactionWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>ReactFlow renders an invisible path around each edge to make them easier to click or tap on. This property sets the width of that invisible path.</p>
</div></td>
<td></td>
</tr>
<tr id="label">
<td><code dir="ltr">label</code></td>
<td><code dir="ltr">ReactNode</code>
<div>
<p>The label or custom element to render along the edge. This is commonly a text label or some custom controls.</p>
</div></td>
<td></td>
</tr>
<tr id="labelstyle">
<td><code dir="ltr">labelStyle</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Custom styles to apply to the label.</p>
</div></td>
<td></td>
</tr>
<tr id="labelshowbg">
<td><code dir="ltr">labelShowBg</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="labelbgstyle">
<td><code dir="ltr">labelBgStyle</code></td>
<td><code dir="ltr">CSSProperties</code></td>
<td></td>
</tr>
<tr id="labelbgpadding">
<td><code dir="ltr">labelBgPadding</code></td>
<td><code dir="ltr">[number, number]</code></td>
<td></td>
</tr>
<tr id="labelbgborderradius">
<td><code dir="ltr">labelBgBorderRadius</code></td>
<td><code dir="ltr">number</code></td>
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
<tr id="reconnectable">
<td><code dir="ltr">reconnectable</code></td>
<td><code dir="ltr">boolean | HandleType</code>
<div>
<p>Determines whether the edge can be updated by dragging the source or target to a new node. This property will override the default set by the <code dir="ltr">edgesReconnectable</code> prop on the <code dir="ltr"><ReactFlow /></code> component.</p>
</div></td>
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
<p>The ARIA role attribute for the edge, used for accessibility.</p>
</div></td>
<td><code dir="ltr">"group"</code></td>
</tr>
<tr id="domattributes">
<td><code dir="ltr">domAttributes</code></td>
<td><code dir="ltr">Omit<SVGAttributes<SVGGElement>, "id" | "style" | "className" | "role" | "aria-label" | "dangerouslySetInnerHTML"></code>
<div>
<p>General escape hatch for adding custom attributes to the edge’s DOM element.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>
