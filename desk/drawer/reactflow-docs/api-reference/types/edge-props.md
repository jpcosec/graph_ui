---
source: https://reactflow.dev/api-reference/types/edge-props
title: EdgeProps
---

# EdgeProps

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L100">Source on GitHub </a>

When you implement a custom edge it is wrapped in a component that
enables some basic functionality. The `EdgeProps` type takes a generic
parameter to specify the type of edges you use in your application:

```tsx
type AppEdgeProps = EdgeProps<MyEdgeType>;
```

</div>

Your custom edge component receives the following props:

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
<td><code dir="ltr">EdgeType["id"]</code>
<div>
<p>Unique id of an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">EdgeType["type"]</code>
<div>
<p>Type of edge defined in <code dir="ltr">edgeTypes</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="animated">
<td><code dir="ltr">animated</code></td>
<td><code dir="ltr">EdgeType["animated"]</code></td>
<td></td>
</tr>
<tr id="data">
<td><code dir="ltr">data</code></td>
<td><code dir="ltr">EdgeType["data"]</code>
<div>
<p>Arbitrary data passed to an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="style">
<td><code dir="ltr">style</code></td>
<td><code dir="ltr">EdgeType["style"]</code></td>
<td></td>
</tr>
<tr id="selected">
<td><code dir="ltr">selected</code></td>
<td><code dir="ltr">EdgeType["selected"]</code></td>
<td></td>
</tr>
<tr id="source">
<td><code dir="ltr">source</code></td>
<td><code dir="ltr">EdgeType["source"]</code>
<div>
<p>Id of source node.</p>
</div></td>
<td></td>
</tr>
<tr id="target">
<td><code dir="ltr">target</code></td>
<td><code dir="ltr">EdgeType["target"]</code>
<div>
<p>Id of target node.</p>
</div></td>
<td></td>
</tr>
<tr id="selectable">
<td><code dir="ltr">selectable</code></td>
<td><code dir="ltr">EdgeType["selectable"]</code></td>
<td></td>
</tr>
<tr id="deletable">
<td><code dir="ltr">deletable</code></td>
<td><code dir="ltr">EdgeType["deletable"]</code></td>
<td></td>
</tr>
<tr id="sourcex">
<td><code dir="ltr">sourceX</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="sourcey">
<td><code dir="ltr">sourceY</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="targetx">
<td><code dir="ltr">targetX</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="targety">
<td><code dir="ltr">targetY</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="sourceposition">
<td><code dir="ltr">sourcePosition</code></td>
<td><code dir="ltr">Position</code></td>
<td></td>
</tr>
<tr id="targetposition">
<td><code dir="ltr">targetPosition</code></td>
<td><code dir="ltr">Position</code></td>
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
<tr id="sourcehandleid">
<td><code dir="ltr">sourceHandleId</code></td>
<td><code dir="ltr">string | null</code></td>
<td></td>
</tr>
<tr id="targethandleid">
<td><code dir="ltr">targetHandleId</code></td>
<td><code dir="ltr">string | null</code></td>
<td></td>
</tr>
<tr id="markerstart">
<td><code dir="ltr">markerStart</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="markerend">
<td><code dir="ltr">markerEnd</code></td>
<td><code dir="ltr">string</code></td>
<td></td>
</tr>
<tr id="pathoptions">
<td><code dir="ltr">pathOptions</code></td>
<td><code dir="ltr">any</code></td>
<td></td>
</tr>
<tr id="interactionwidth">
<td><code dir="ltr">interactionWidth</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
</tbody>
</table>
