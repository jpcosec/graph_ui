---
source: https://reactflow.dev/api-reference/types/edge
title: Edge
---

# Edge

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353">Source on GitHub </a>

Where a
<a href="/api-reference/types/connection"><code dir="ltr">Connection</code></a>
is the minimal description of an edge between two nodes, an `Edge` is
the complete description with everything React Flow needs to know in
order to render it.

```tsx
export type Edge<T> = DefaultEdge<T> | SmoothStepEdge<T> | BezierEdge<T>;
```

</div>

## Variants

### Edge

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L34-L353">Source on GitHub </a>

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
<p>Unique id of an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">EdgeType</code>
<div>
<p>Type of edge defined in <code dir="ltr">edgeTypes</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="source">
<td><code dir="ltr">source</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Id of source node.</p>
</div></td>
<td></td>
</tr>
<tr id="target">
<td><code dir="ltr">target</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Id of target node.</p>
</div></td>
<td></td>
</tr>
<tr id="sourcehandle">
<td><code dir="ltr">sourceHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>Id of source handle, only needed if there are multiple handles per node.</p>
</div></td>
<td></td>
</tr>
<tr id="targethandle">
<td><code dir="ltr">targetHandle</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>Id of target handle, only needed if there are multiple handles per node.</p>
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
<td><code dir="ltr">EdgeData</code>
<div>
<p>Arbitrary data passed to an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="selected">
<td><code dir="ltr">selected</code></td>
<td><code dir="ltr">boolean</code></td>
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

### SmoothStepEdge

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L45-L46">Source on GitHub </a>

The `SmoothStepEdge` variant has all the same fields as an `Edge`, but
it also has the following additional fields:

| Name                                                                                                                                                                                                                                                                                      | Type                                          | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|---------|
| `type`               | `"smoothstep"`                                |         |
| `pathOptions` | `{ offset?: number; borderRadius?: number; }` |         |

### BezierEdge

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L52-L53">Source on GitHub </a>

The `BezierEdge` variant has all the same fields as an `Edge`, but it
also has the following additional fields:

| Name                                                                                                                                                                                                                                                                                      | Type                      | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------|---------|
| `type`               | `"default"`               |         |
| `pathOptions` | `{ curvature?: number; }` |         |

## Default edge types

You can create any of React Flow’s default edges by setting the `type`
property to one of the following values:

-   `"default"`
-   `"straight"`
-   `"step"`
-   `"smoothstep"`
-   `"simplebezier"`

If you don’t set the `type` property at all, React Flow will fallback to
the `"default"` bezier curve edge type.

These default edges are available even if you set the
<a href="/api-reference/react-flow#edge-types"><code dir="ltr">edgeTypes</code></a>
prop to something else, unless you override any of these keys directly.
