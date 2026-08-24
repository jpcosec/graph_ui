---
source: https://reactflow.dev/api-reference/components/minimap
title: The MiniMap component
---

# <MiniMap />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/MiniMap/MiniMap.tsx">Source on GitHub </a>

The `<MiniMap />` component can be used to render an overview of your
flow. It renders each node as an SVG element and visualizes where the
current viewport is in relation to the rest of the flow.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeStrokeWidth={3} />
    </ReactFlow>
  );
}
```

</div>

## Props

For TypeScript users, the props type for the `<MiniMap />` component is
exported as `MiniMapProps`.

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
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">PanelPosition</code>
<div>
<p>Position of minimap on pane.</p>
</div></td>
<td><code dir="ltr">PanelPosition.BottomRight</code></td>
</tr>
<tr id="onclick">
<td><code dir="ltr">onClick</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>, position: XYPosition) => void</code>
<div>
<p>Callback called when minimap is clicked.</p>
</div></td>
<td></td>
</tr>
<tr id="nodecolor">
<td><code dir="ltr">nodeColor</code></td>
<td><code dir="ltr">string | GetMiniMapNodeAttribute<Node></code>
<div>
<p>Color of nodes on minimap.</p>
</div></td>
<td><code dir="ltr">"#e2e2e2"</code></td>
</tr>
<tr id="nodestrokecolor">
<td><code dir="ltr">nodeStrokeColor</code></td>
<td><code dir="ltr">string | GetMiniMapNodeAttribute<Node></code>
<div>
<p>Stroke color of nodes on minimap.</p>
</div></td>
<td><code dir="ltr">"transparent"</code></td>
</tr>
<tr id="nodeclassname">
<td><code dir="ltr">nodeClassName</code></td>
<td><code dir="ltr">string | GetMiniMapNodeAttribute<Node></code>
<div>
<p>Class name applied to nodes on minimap.</p>
</div></td>
<td><code dir="ltr">""</code></td>
</tr>
<tr id="nodeborderradius">
<td><code dir="ltr">nodeBorderRadius</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Border radius of nodes on minimap.</p>
</div></td>
<td><code dir="ltr">5</code></td>
</tr>
<tr id="nodestrokewidth">
<td><code dir="ltr">nodeStrokeWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Stroke width of nodes on minimap.</p>
</div></td>
<td><code dir="ltr">2</code></td>
</tr>
<tr id="nodecomponent">
<td><code dir="ltr">nodeComponent</code></td>
<td><code dir="ltr">ComponentType<MiniMapNodeProps></code>
<div>
<p>A custom component to render the nodes in the minimap. This component must render an SVG element!</p>
</div></td>
<td></td>
</tr>
<tr id="bgcolor">
<td><code dir="ltr">bgColor</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Background color of minimap.</p>
</div></td>
<td></td>
</tr>
<tr id="maskcolor">
<td><code dir="ltr">maskColor</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The color of the mask that covers the portion of the minimap not currently visible in the viewport.</p>
</div></td>
<td><code dir="ltr">"rgba(240, 240, 240, 0.6)"</code></td>
</tr>
<tr id="maskstrokecolor">
<td><code dir="ltr">maskStrokeColor</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Stroke color of mask representing viewport.</p>
</div></td>
<td><code dir="ltr">transparent</code></td>
</tr>
<tr id="maskstrokewidth">
<td><code dir="ltr">maskStrokeWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Stroke width of mask representing viewport.</p>
</div></td>
<td><code dir="ltr">1</code></td>
</tr>
<tr id="onnodeclick">
<td><code dir="ltr">onNodeClick</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>, node: Node) => void</code>
<div>
<p>Callback called when node on minimap is clicked.</p>
</div></td>
<td></td>
</tr>
<tr id="pannable">
<td><code dir="ltr">pannable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Determines whether you can pan the viewport by dragging inside the minimap.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="zoomable">
<td><code dir="ltr">zoomable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Determines whether you can zoom the viewport by scrolling inside the minimap.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="arialabel">
<td><code dir="ltr">ariaLabel</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>There is no text inside the minimap for a screen reader to use as an accessible name, so it’s important we provide one to make the minimap accessible. The default is sufficient, but you may want to replace it with something more relevant to your app or product.</p>
</div></td>
<td><code dir="ltr">"Mini Map"</code></td>
</tr>
<tr id="inversepan">
<td><code dir="ltr">inversePan</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Invert direction when panning the minimap viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="zoomstep">
<td><code dir="ltr">zoomStep</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Step size for zooming in/out on minimap.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="offsetscale">
<td><code dir="ltr">offsetScale</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Offset the viewport on the minimap, acts like a padding.</p>
</div></td>
<td><code dir="ltr">5</code></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">Omit<HTMLAttributes<SVGSVGElement>, "onClick"></code></td>
<td></td>
</tr>
</tbody>
</table>

## Examples

### Making the mini map interactive

By default, the mini map is non-interactive. To allow users to interact
with the viewport by panning or zooming the minimap, you can set either
of the `zoomable` or `pannable` (or both!) props to `true`.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}
```

</div>

### Implement a custom mini map node

It is possible to pass a custom component to the `nodeComponent` prop to
change how nodes are rendered in the mini map. If you do this you
**must** use only SVG elements in your component if you want it to work
correctly.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeComponent={MiniMapNode} />
    </ReactFlow>
  );
}
 
function MiniMapNode({ x, y }) {
  return <circle cx={x} cy={y} r="50" />;
}
```

</div>

Check out the documentation for
<a href="/api-reference/types/mini-map-node-props"><code dir="ltr">MiniMapNodeProps</code></a>
to see what props are passed to your custom component.

### Customising mini map node color

The `nodeColor`, `nodeStrokeColor`, and `nodeClassName` props can be a
function that takes a
<a href="/api-reference/types/node"><code dir="ltr">Node</code></a>
and computes a value for the prop. This can be used to customize the
appearance of each mini map node.

This example shows how to color each mini map node based on the node’s
type:

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeColor={nodeColor} />
    </ReactFlow>
  );
}
 
function nodeColor(node) {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
}
```

</div>

## TypeScript

This component accepts a generic type argument of custom node types. See
this
<a href="/learn/advanced-use/typescript#nodetype-edgetype-unions">section in our Typescript guide</a>
for more information.

```tsx
<MiniMap<CustomNodeType> nodeColor={nodeColor} />
```

</div>
