---
source: https://reactflow.dev/api-reference/react-flow-provider
title: The ReactFlowProvider component
---

# <ReactFlowProvider />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/ReactFlowProvider/index.tsx/#L9">Source on GitHub </a>

The `<ReactFlowProvider />` component is a
<a href="https://react.dev/learn/passing-data-deeply-with-context#">context provider </a>
that makes it possible to access a flow’s internal state outside of the
<a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
component. Many of the hooks we provide rely on this component to work.

```tsx
import { ReactFlow, ReactFlowProvider, useNodes } from '@xyflow/react'
 
export default function Flow() {
  return (
    <ReactFlowProvider>
      <ReactFlow nodes={...} edges={...} />
      <Sidebar />
    </ReactFlowProvider>
  )
}
 
function Sidebar() {
  // This hook will only work if the component it's used in is a child of a
  // <ReactFlowProvider />.
  const nodes = useNodes()
 
  return (
    <aside>
      {nodes.map((node) => (
        <div key={node.id}>
          Node {node.id} -
            x: {node.position.x.toFixed(2)},
            y: {node.position.y.toFixed(2)}
        </div>
      ))}
    </aside>
  )
}
```

</div>

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
<tr id="initialnodes">
<td><code dir="ltr">initialNodes</code></td>
<td><code dir="ltr">Node[]</code>
<div>
<p>These nodes are used to initialize the flow. They are not dynamic.</p>
</div></td>
<td></td>
</tr>
<tr id="initialedges">
<td><code dir="ltr">initialEdges</code></td>
<td><code dir="ltr">Edge[]</code>
<div>
<p>These edges are used to initialize the flow. They are not dynamic.</p>
</div></td>
<td></td>
</tr>
<tr id="defaultnodes">
<td><code dir="ltr">defaultNodes</code></td>
<td><code dir="ltr">Node[]</code>
<div>
<p>These nodes are used to initialize the flow. They are not dynamic.</p>
</div></td>
<td></td>
</tr>
<tr id="defaultedges">
<td><code dir="ltr">defaultEdges</code></td>
<td><code dir="ltr">Edge[]</code>
<div>
<p>These edges are used to initialize the flow. They are not dynamic.</p>
</div></td>
<td></td>
</tr>
<tr id="initialwidth">
<td><code dir="ltr">initialWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The initial width is necessary to be able to use fitView on the server</p>
</div></td>
<td></td>
</tr>
<tr id="initialheight">
<td><code dir="ltr">initialHeight</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The initial height is necessary to be able to use fitView on the server</p>
</div></td>
<td></td>
</tr>
<tr id="fitview">
<td><code dir="ltr">fitView</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the flow will be zoomed and panned to fit all the nodes initially provided.</p>
</div></td>
<td></td>
</tr>
<tr id="initialfitviewoptions">
<td><code dir="ltr">initialFitViewOptions</code></td>
<td><code dir="ltr">FitViewOptionsBase<NodeType></code>
<div>
<p>You can provide an object of options to customize the initial fitView behavior.</p>
</div></td>
<td></td>
</tr>
<tr id="initialminzoom">
<td><code dir="ltr">initialMinZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Initial minimum zoom level</p>
</div></td>
<td></td>
</tr>
<tr id="initialmaxzoom">
<td><code dir="ltr">initialMaxZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Initial maximum zoom level</p>
</div></td>
<td></td>
</tr>
<tr id="nodeorigin">
<td><code dir="ltr">nodeOrigin</code></td>
<td><code dir="ltr">NodeOrigin</code>
<div>
<p>The origin of the node to use when placing it in the flow or looking up its <code dir="ltr">x</code> and <code dir="ltr">y</code> position. An origin of <code dir="ltr">[0, 0]</code> means that a node’s top left corner will be placed at the <code dir="ltr">x</code> and <code dir="ltr">y</code> position.</p>
</div></td>
<td><code dir="ltr">[0, 0]</code></td>
</tr>
<tr id="nodeextent">
<td><code dir="ltr">nodeExtent</code></td>
<td><code dir="ltr">CoordinateExtent</code>
<div>
<p>By default, nodes can be placed on an infinite flow. You can use this prop to set a boundary.</p>
<p>The first pair of coordinates is the top left boundary and the second pair is the bottom right.</p>
</div></td>
<td></td>
</tr>
<tr id="children">
<td><code dir="ltr">children</code></td>
<td><code dir="ltr">ReactNode</code></td>
<td></td>
</tr>
<tr id="zindexmode">
<td><code dir="ltr">zIndexMode</code></td>
<td><code dir="ltr">ZIndexMode</code></td>
<td></td>
</tr>
</tbody>
</table>

## Notes

-   If you’re using a router and want your flow’s state to persist
    across routes, it’s vital that you place the `<ReactFlowProvider />`
    component *outside* of your router.
-   If you have multiple flows on the same page you will need to use a
    separate `<ReactFlowProvider />` for each flow.
