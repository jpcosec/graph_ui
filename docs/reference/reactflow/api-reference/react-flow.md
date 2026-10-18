---
source: https://reactflow.dev/api-reference/react-flow
title: The ReactFlow component
---

# <ReactFlow />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/container/ReactFlow/index.tsx/#L47">Source on GitHub </a>

The `<ReactFlow />` component is the heart of your React Flow
application. It renders your nodes and edges, handles user interaction,
and can manage its own state if used as an
<a href="/learn/advanced-use/uncontrolled-flow">uncontrolled flow</a>.

```tsx
import { ReactFlow } from '@xyflow/react'
 
export default function Flow() {
  return <ReactFlow
    nodes={...}
    edges={...}
    onNodesChange={...}
    ...
  />
}
```

</div>

This component takes a lot of different props, most of which are
optional. We’ve tried to document them in groups that make sense to help
you find your way.

## Common props

These are the props you will most commonly use when working with React
Flow. If you are working with a controlled flow with custom nodes, you
will likely use almost all of these!

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
<td><code dir="ltr">number</code>
<div>
<p>Sets a fixed width for the flow.</p>
</div></td>
<td></td>
</tr>
<tr id="height">
<td><code dir="ltr">height</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Sets a fixed height for the flow.</p>
</div></td>
<td></td>
</tr>
<tr id="nodes">
<td><code dir="ltr">nodes</code></td>
<td><code dir="ltr">Node[]</code>
<div>
<p>An array of nodes to render in a controlled flow.</p>
</div></td>
<td><code dir="ltr">[]</code></td>
</tr>
<tr id="edges">
<td><code dir="ltr">edges</code></td>
<td><code dir="ltr">Edge[]</code>
<div>
<p>An array of edges to render in a controlled flow.</p>
</div></td>
<td><code dir="ltr">[]</code></td>
</tr>
<tr id="defaultnodes">
<td><code dir="ltr">defaultNodes</code></td>
<td><code dir="ltr">Node[]</code>
<div>
<p>The initial nodes to render in an uncontrolled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="defaultedges">
<td><code dir="ltr">defaultEdges</code></td>
<td><code dir="ltr">Edge[]</code>
<div>
<p>The initial edges to render in an uncontrolled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="paneclickdistance">
<td><code dir="ltr">paneClickDistance</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Distance that the mouse can move between mousedown/up that will trigger a click.</p>
</div></td>
<td><code dir="ltr">0</code></td>
</tr>
<tr id="nodeclickdistance">
<td><code dir="ltr">nodeClickDistance</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Distance that the mouse can move between mousedown/up that will trigger a click.</p>
</div></td>
<td><code dir="ltr">0</code></td>
</tr>
<tr id="nodetypes">
<td><code dir="ltr">nodeTypes</code></td>
<td><code dir="ltr">NodeTypes</code>
<div>
<p>Custom node types to be available in a flow. React Flow matches a node’s type to a component in the <code dir="ltr">nodeTypes</code> object.</p>
</div></td>
<td><code dir="ltr">{ input: InputNode, default: DefaultNode, output: OutputNode, group: GroupNode }</code></td>
</tr>
<tr id="edgetypes">
<td><code dir="ltr">edgeTypes</code></td>
<td><code dir="ltr">EdgeTypes</code>
<div>
<p>Custom edge types to be available in a flow. React Flow matches an edge’s type to a component in the <code dir="ltr">edgeTypes</code> object.</p>
</div></td>
<td><code dir="ltr">{ default: BezierEdge, straight: StraightEdge, step: StepEdge, smoothstep: SmoothStepEdge, simplebezier: SimpleBezier }</code></td>
</tr>
<tr id="autopanonnodefocus">
<td><code dir="ltr">autoPanOnNodeFocus</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the viewport will pan when a node is focused.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="nodeorigin">
<td><code dir="ltr">nodeOrigin</code></td>
<td><code dir="ltr">NodeOrigin</code>
<div>
<p>The origin of the node to use when placing it in the flow or looking up its <code dir="ltr">x</code> and <code dir="ltr">y</code> position. An origin of <code dir="ltr">[0, 0]</code> means that a node’s top left corner will be placed at the <code dir="ltr">x</code> and <code dir="ltr">y</code> position.</p>
</div></td>
<td><code dir="ltr">[0, 0]</code></td>
</tr>
<tr id="prooptions">
<td><code dir="ltr">proOptions</code></td>
<td><code dir="ltr">ProOptions</code>
<div>
<p>By default, we render a small attribution in the corner of your flows that links back to the project.</p>
<p>Anyone is free to remove this attribution whether they’re a Pro subscriber or not but we ask that you take a quick look at our <a href="https://reactflow.dev/learn/troubleshooting/remove-attribution">https://reactflow.dev/learn/troubleshooting/remove-attribution </a> removing attribution guide before doing so.</p>
</div></td>
<td></td>
</tr>
<tr id="nodedragthreshold">
<td><code dir="ltr">nodeDragThreshold</code></td>
<td><code dir="ltr">number</code>
<div>
<p>With a threshold greater than zero you can delay node drag events. If threshold equals 1, you need to drag the node 1 pixel before a drag event is fired. 1 is the default value, so that clicks don’t trigger drag events.</p>
</div></td>
<td><code dir="ltr">1</code></td>
</tr>
<tr id="connectiondragthreshold">
<td><code dir="ltr">connectionDragThreshold</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The threshold in pixels that the mouse must move before a connection line starts to drag. This is useful to prevent accidental connections when clicking on a handle.</p>
</div></td>
<td><code dir="ltr">1</code></td>
</tr>
<tr id="colormode">
<td><code dir="ltr">colorMode</code></td>
<td><code dir="ltr">ColorMode</code>
<div>
<p>Controls color scheme used for styling the flow.</p>
</div></td>
<td><code dir="ltr">'light'</code></td>
</tr>
<tr id="debug">
<td><code dir="ltr">debug</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>If set <code dir="ltr">true</code>, some debug information will be logged to the console like which events are fired.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="arialabelconfig">
<td><code dir="ltr">ariaLabelConfig</code></td>
<td><code dir="ltr">Partial<AriaLabelConfig></code>
<div>
<p>Configuration for customizable labels, descriptions, and UI text. Provided keys will override the corresponding defaults. Allows localization, customization of ARIA descriptions, control labels, minimap labels, and other UI strings.</p>
</div></td>
<td></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "onError"></code></td>
<td></td>
</tr>
</tbody>
</table>

## Viewport props

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
<tr id="defaultviewport">
<td><code dir="ltr">defaultViewport</code></td>
<td><code dir="ltr">Viewport</code>
<div>
<p>Sets the initial position and zoom of the viewport. If a default viewport is provided but <code dir="ltr">fitView</code> is enabled, the default viewport will be ignored.</p>
</div></td>
<td><code dir="ltr">{ x: 0, y: 0, zoom: 1 }</code></td>
</tr>
<tr id="viewport">
<td><code dir="ltr">viewport</code></td>
<td><code dir="ltr">Viewport</code>
<div>
<p>When you pass a <code dir="ltr">viewport</code> prop, it’s controlled, and you also need to pass <code dir="ltr">onViewportChange</code> to handle internal changes.</p>
</div></td>
<td></td>
</tr>
<tr id="onviewportchange">
<td><code dir="ltr">onViewportChange</code></td>
<td><code dir="ltr">(viewport: Viewport) => void</code>
<div>
<p>Used when working with a controlled viewport for updating the user viewport state.</p>
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
<tr id="fitviewoptions">
<td><code dir="ltr">fitViewOptions</code></td>
<td><code dir="ltr">FitViewOptionsBase<NodeType></code>
<div>
<p>When you typically call <code dir="ltr">fitView</code> on a <code dir="ltr">ReactFlowInstance</code>, you can provide an object of options to customize its behavior. This prop lets you do the same for the initial <code dir="ltr">fitView</code> call.</p>
</div></td>
<td></td>
</tr>
<tr id="minzoom">
<td><code dir="ltr">minZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum zoom level.</p>
</div></td>
<td><code dir="ltr">0.5</code></td>
</tr>
<tr id="maxzoom">
<td><code dir="ltr">maxZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum zoom level.</p>
</div></td>
<td><code dir="ltr">2</code></td>
</tr>
<tr id="snaptogrid">
<td><code dir="ltr">snapToGrid</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When enabled, nodes will snap to the grid when dragged.</p>
</div></td>
<td></td>
</tr>
<tr id="snapgrid">
<td><code dir="ltr">snapGrid</code></td>
<td><code dir="ltr">SnapGrid</code>
<div>
<p>If <code dir="ltr">snapToGrid</code> is enabled, this prop configures the grid that nodes will snap to.</p>
</div></td>
<td></td>
</tr>
<tr id="onlyrendervisibleelements">
<td><code dir="ltr">onlyRenderVisibleElements</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>You can enable this optimisation to instruct React Flow to only render nodes and edges that would be visible in the viewport.</p>
<p>This might improve performance when you have a large number of nodes and edges but also adds an overhead.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="translateextent">
<td><code dir="ltr">translateExtent</code></td>
<td><code dir="ltr">CoordinateExtent</code>
<div>
<p>By default, the viewport extends infinitely. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right.</p>
</div></td>
<td><code dir="ltr">[[-∞, -∞], [+∞, +∞]]</code></td>
</tr>
<tr id="nodeextent">
<td><code dir="ltr">nodeExtent</code></td>
<td><code dir="ltr">CoordinateExtent</code>
<div>
<p>By default, nodes can be placed on an infinite flow. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right.</p>
</div></td>
<td></td>
</tr>
<tr id="preventscrolling">
<td><code dir="ltr">preventScrolling</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Disabling this prop will allow the user to scroll the page even when their pointer is over the flow.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="attributionposition">
<td><code dir="ltr">attributionPosition</code></td>
<td><code dir="ltr">PanelPosition</code>
<div>
<p>By default, React Flow will render a small attribution in the bottom right corner of the flow.</p>
<p>You can use this prop to change its position in case you want to place something else there.</p>
</div></td>
<td><code dir="ltr">'bottom-right'</code></td>
</tr>
</tbody>
</table>

## Edge props

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
<tr id="elevateedgesonselect">
<td><code dir="ltr">elevateEdgesOnSelect</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Enabling this option will raise the z-index of edges when they are selected.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="defaultmarkercolor">
<td><code dir="ltr">defaultMarkerColor</code></td>
<td><code dir="ltr">string | null</code>
<div>
<p>Color of edge markers. You can pass <code dir="ltr">null</code> to use the CSS variable <code dir="ltr">--xy-edge-stroke</code> for the marker color.</p>
</div></td>
<td><code dir="ltr">'#b1b1b7'</code></td>
</tr>
<tr id="defaultedgeoptions">
<td><code dir="ltr">defaultEdgeOptions</code></td>
<td><code dir="ltr">DefaultEdgeOptions</code>
<div>
<p>Defaults to be applied to all new edges that are added to the flow. Properties on a new edge will override these defaults if they exist.</p>
</div></td>
<td></td>
</tr>
<tr id="reconnectradius">
<td><code dir="ltr">reconnectRadius</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The radius around an edge connection that can trigger an edge reconnection.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="edgesreconnectable">
<td><code dir="ltr">edgesReconnectable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether edges can be updated once they are created. When both this prop is <code dir="ltr">true</code> and an <code dir="ltr">onReconnect</code> handler is provided, the user can drag an existing edge to a new source or target. Individual edges can override this value with their reconnectable property.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
</tbody>
</table>

## Event handlers

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-yellow-50 x:dark:bg-yellow-700/30 x:text-yellow-700 x:dark:text-yellow-500 x:border-yellow-700">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Warning**

It’s important to remember to define any event handlers outside of your
component or using React’s `useCallback` hook. If you don’t, this can
cause React Flow to enter an infinite re-render loop!

</div>

</div>

### General Events

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
<tr id="onerror">
<td><code dir="ltr">onError</code></td>
<td><code dir="ltr">OnError</code>
<div>
<p>Occasionally something may happen that causes React Flow to throw an error.</p>
<p>Instead of exploding your application, we log a message to the console and then call this event handler. You might use it for additional logging or to show a message to the user.</p>
</div></td>
<td></td>
</tr>
<tr id="oninit">
<td><code dir="ltr">onInit</code></td>
<td><code dir="ltr">(reactFlowInstance: ReactFlowInstance<Node, Edge>) => void</code>
<div>
<p>The <code dir="ltr">onInit</code> callback is called when the viewport is initialized. At this point you can use the instance to call methods like <code dir="ltr">fitView</code> or <code dir="ltr">zoomTo</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="ondelete">
<td><code dir="ltr">onDelete</code></td>
<td><code dir="ltr">OnDelete<Node, Edge></code>
<div>
<p>This event handler gets called when a node or edge is deleted.</p>
</div></td>
<td></td>
</tr>
<tr id="onbeforedelete">
<td><code dir="ltr">onBeforeDelete</code></td>
<td><code dir="ltr">OnBeforeDelete<Node, Edge></code>
<div>
<p>This handler is called before nodes or edges are deleted, allowing the deletion to be aborted by returning <code dir="ltr">false</code> or modified by returning updated nodes and edges.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Node Events

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
<tr id="onnodeclick">
<td><code dir="ltr">onNodeClick</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when a user clicks on a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodedoubleclick">
<td><code dir="ltr">onNodeDoubleClick</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when a user double-clicks on a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodedragstart">
<td><code dir="ltr">onNodeDragStart</code></td>
<td><code dir="ltr">OnNodeDrag<Node></code>
<div>
<p>This event handler is called when a user starts to drag a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodedrag">
<td><code dir="ltr">onNodeDrag</code></td>
<td><code dir="ltr">OnNodeDrag<Node></code>
<div>
<p>This event handler is called when a user drags a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodedragstop">
<td><code dir="ltr">onNodeDragStop</code></td>
<td><code dir="ltr">OnNodeDrag<Node></code>
<div>
<p>This event handler is called when a user stops dragging a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodemouseenter">
<td><code dir="ltr">onNodeMouseEnter</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when mouse of a user enters a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodemousemove">
<td><code dir="ltr">onNodeMouseMove</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when mouse of a user moves over a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodemouseleave">
<td><code dir="ltr">onNodeMouseLeave</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when mouse of a user leaves a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodecontextmenu">
<td><code dir="ltr">onNodeContextMenu</code></td>
<td><code dir="ltr">NodeMouseHandler<Node></code>
<div>
<p>This event handler is called when a user right-clicks on a node.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodesdelete">
<td><code dir="ltr">onNodesDelete</code></td>
<td><code dir="ltr">OnNodesDelete<Node></code>
<div>
<p>This event handler gets called when a node is deleted.</p>
</div></td>
<td></td>
</tr>
<tr id="onnodeschange">
<td><code dir="ltr">onNodesChange</code></td>
<td><code dir="ltr">OnNodesChange<Node></code>
<div>
<p>Use this event handler to add interactivity to a controlled flow. It is called on node drag, select, and move.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Edge Events

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
<tr id="onedgeclick">
<td><code dir="ltr">onEdgeClick</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>, edge: Edge) => void</code>
<div>
<p>This event handler is called when a user clicks on an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgedoubleclick">
<td><code dir="ltr">onEdgeDoubleClick</code></td>
<td><code dir="ltr">EdgeMouseHandler<Edge></code>
<div>
<p>This event handler is called when a user double-clicks on an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgemouseenter">
<td><code dir="ltr">onEdgeMouseEnter</code></td>
<td><code dir="ltr">EdgeMouseHandler<Edge></code>
<div>
<p>This event handler is called when mouse of a user enters an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgemousemove">
<td><code dir="ltr">onEdgeMouseMove</code></td>
<td><code dir="ltr">EdgeMouseHandler<Edge></code>
<div>
<p>This event handler is called when mouse of a user moves over an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgemouseleave">
<td><code dir="ltr">onEdgeMouseLeave</code></td>
<td><code dir="ltr">EdgeMouseHandler<Edge></code>
<div>
<p>This event handler is called when mouse of a user leaves an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgecontextmenu">
<td><code dir="ltr">onEdgeContextMenu</code></td>
<td><code dir="ltr">EdgeMouseHandler<Edge></code>
<div>
<p>This event handler is called when a user right-clicks on an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onreconnect">
<td><code dir="ltr">onReconnect</code></td>
<td><code dir="ltr">OnReconnect<Edge></code>
<div>
<p>This handler is called when the source or target of a reconnectable edge is dragged from the current node. It will fire even if the edge’s source or target do not end up changing. You can use the <code dir="ltr">reconnectEdge</code> utility to convert the connection to a new edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onreconnectstart">
<td><code dir="ltr">onReconnectStart</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>, edge: Edge, handleType: HandleType) => void</code>
<div>
<p>This event fires when the user begins dragging the source or target of an editable edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onreconnectend">
<td><code dir="ltr">onReconnectEnd</code></td>
<td><code dir="ltr">(event: MouseEvent | TouchEvent, edge: Edge, handleType: HandleType, connectionState: FinalConnectionState) => void</code>
<div>
<p>This event fires when the user releases the source or target of an editable edge. It is called even if an edge update does not occur.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgesdelete">
<td><code dir="ltr">onEdgesDelete</code></td>
<td><code dir="ltr">OnEdgesDelete<Edge></code>
<div>
<p>This event handler gets called when an edge is deleted.</p>
</div></td>
<td></td>
</tr>
<tr id="onedgeschange">
<td><code dir="ltr">onEdgesChange</code></td>
<td><code dir="ltr">OnEdgesChange<Edge></code>
<div>
<p>Use this event handler to add interactivity to a controlled flow. It is called on edge select and remove.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Connection Events

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
<tr id="onconnect">
<td><code dir="ltr">onConnect</code></td>
<td><code dir="ltr">OnConnect</code>
<div>
<p>When a connection line is completed and two nodes are connected by the user, this event fires with the new connection. You can use the <code dir="ltr">addEdge</code> utility to convert the connection to a complete edge.</p>
</div></td>
<td></td>
</tr>
<tr id="onconnectstart">
<td><code dir="ltr">onConnectStart</code></td>
<td><code dir="ltr">OnConnectStart</code>
<div>
<p>This event handler gets called when a user starts to drag a connection line.</p>
</div></td>
<td></td>
</tr>
<tr id="onconnectend">
<td><code dir="ltr">onConnectEnd</code></td>
<td><code dir="ltr">OnConnectEnd</code>
<div>
<p>This callback will fire regardless of whether a valid connection could be made or not. You can use the second <code dir="ltr">connectionState</code> parameter to have different behavior when a connection was unsuccessful.</p>
</div></td>
<td></td>
</tr>
<tr id="onclickconnectstart">
<td><code dir="ltr">onClickConnectStart</code></td>
<td><code dir="ltr">OnConnectStart</code></td>
<td></td>
</tr>
<tr id="onclickconnectend">
<td><code dir="ltr">onClickConnectEnd</code></td>
<td><code dir="ltr">OnConnectEnd</code></td>
<td></td>
</tr>
<tr id="isvalidconnection">
<td><code dir="ltr">isValidConnection</code></td>
<td><code dir="ltr">IsValidConnection<Edge></code>
<div>
<p>This callback can be used to validate a new connection</p>
<p>If you return <code dir="ltr">false</code>, the edge will not be added to your flow. If you have custom connection logic its preferred to use this callback over the <code dir="ltr">isValidConnection</code> prop on the handle component for performance reasons.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Pane Events

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
<tr id="onmove">
<td><code dir="ltr">onMove</code></td>
<td><code dir="ltr">OnMove</code>
<div>
<p>This event handler is called while the user is either panning or zooming the viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="onmovestart">
<td><code dir="ltr">onMoveStart</code></td>
<td><code dir="ltr">OnMove</code>
<div>
<p>This event handler is called when the user begins to pan or zoom the viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="onmoveend">
<td><code dir="ltr">onMoveEnd</code></td>
<td><code dir="ltr">OnMove</code>
<div>
<p>This event handler is called when panning or zooming viewport movement stops. If the movement is not user-initiated, the event parameter will be <code dir="ltr">null</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="onpaneclick">
<td><code dir="ltr">onPaneClick</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code>
<div>
<p>This event handler gets called when user clicks inside the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="onpanecontextmenu">
<td><code dir="ltr">onPaneContextMenu</code></td>
<td><code dir="ltr">(event: MouseEvent | React.MouseEvent<Element, MouseEvent>) => void</code>
<div>
<p>This event handler gets called when user right clicks inside the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="onpanescroll">
<td><code dir="ltr">onPaneScroll</code></td>
<td><code dir="ltr">(event?: WheelEvent<Element> | undefined) => void</code>
<div>
<p>This event handler gets called when user scroll inside the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="onpanemousemove">
<td><code dir="ltr">onPaneMouseMove</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code>
<div>
<p>This event handler gets called when mouse moves over the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="onpanemouseenter">
<td><code dir="ltr">onPaneMouseEnter</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code>
<div>
<p>This event handler gets called when mouse enters the pane.</p>
</div></td>
<td></td>
</tr>
<tr id="onpanemouseleave">
<td><code dir="ltr">onPaneMouseLeave</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code>
<div>
<p>This event handler gets called when mouse leaves the pane.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Selection Events

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
<tr id="onselectionchange">
<td><code dir="ltr">onSelectionChange</code></td>
<td><code dir="ltr">OnSelectionChangeFunc<Node, Edge></code>
<div>
<p>This event handler gets called when a user changes group of selected elements in the flow.</p>
</div></td>
<td></td>
</tr>
<tr id="onselectiondragstart">
<td><code dir="ltr">onSelectionDragStart</code></td>
<td><code dir="ltr">SelectionDragHandler<Node></code>
<div>
<p>This event handler gets called when a user starts to drag a selection box.</p>
</div></td>
<td></td>
</tr>
<tr id="onselectiondrag">
<td><code dir="ltr">onSelectionDrag</code></td>
<td><code dir="ltr">SelectionDragHandler<Node></code>
<div>
<p>This event handler gets called when a user drags a selection box.</p>
</div></td>
<td></td>
</tr>
<tr id="onselectiondragstop">
<td><code dir="ltr">onSelectionDragStop</code></td>
<td><code dir="ltr">SelectionDragHandler<Node></code>
<div>
<p>This event handler gets called when a user stops dragging a selection box.</p>
</div></td>
<td></td>
</tr>
<tr id="onselectionstart">
<td><code dir="ltr">onSelectionStart</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code></td>
<td></td>
</tr>
<tr id="onselectionend">
<td><code dir="ltr">onSelectionEnd</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>) => void</code></td>
<td></td>
</tr>
<tr id="onselectioncontextmenu">
<td><code dir="ltr">onSelectionContextMenu</code></td>
<td><code dir="ltr">(event: MouseEvent<Element, MouseEvent>, nodes: Node[]) => void</code>
<div>
<p>This event handler is called when a user right-clicks on a node selection.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

## Interaction props

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
<tr id="nodesdraggable">
<td><code dir="ltr">nodesDraggable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls whether all nodes should be draggable or not. Individual nodes can override this setting by setting their <code dir="ltr">draggable</code> prop. If you want to use the mouse handlers on non-draggable nodes, you need to add the <code dir="ltr">"nopan"</code> class to those nodes.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="nodesconnectable">
<td><code dir="ltr">nodesConnectable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls whether all nodes should be connectable or not. Individual nodes can override this setting by setting their <code dir="ltr">connectable</code> prop.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="nodesfocusable">
<td><code dir="ltr">nodesFocusable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, focus between nodes can be cycled with the <code dir="ltr">Tab</code> key and selected with the <code dir="ltr">Enter</code> key. This option can be overridden by individual nodes by setting their <code dir="ltr">focusable</code> prop.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="edgesfocusable">
<td><code dir="ltr">edgesFocusable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, focus between edges can be cycled with the <code dir="ltr">Tab</code> key and selected with the <code dir="ltr">Enter</code> key. This option can be overridden by individual edges by setting their <code dir="ltr">focusable</code> prop.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="elementsselectable">
<td><code dir="ltr">elementsSelectable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, elements (nodes and edges) can be selected by clicking on them. This option can be overridden by individual elements by setting their <code dir="ltr">selectable</code> prop.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="autopanonconnect">
<td><code dir="ltr">autoPanOnConnect</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the viewport will pan automatically when the cursor moves to the edge of the viewport while creating a connection.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="autopanonnodedrag">
<td><code dir="ltr">autoPanOnNodeDrag</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the viewport will pan automatically when the cursor moves to the edge of the viewport while dragging a node.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="autopanonselection">
<td><code dir="ltr">autoPanOnSelection</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>When <code dir="ltr">true</code>, the viewport will pan automatically when the cursor moves to the edge of the viewport while creating a selection box.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="autopanspeed">
<td><code dir="ltr">autoPanSpeed</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The speed at which the viewport pans while dragging a node or a selection box.</p>
</div></td>
<td><code dir="ltr">15</code></td>
</tr>
<tr id="panondrag">
<td><code dir="ltr">panOnDrag</code></td>
<td><code dir="ltr">boolean | number[]</code>
<div>
<p>Enabling this prop allows users to pan the viewport by clicking and dragging. You can also set this prop to an array of numbers to limit which mouse buttons can activate panning. Mouse button arrays do not disable touch panning; set this prop to <code dir="ltr">false</code> to disable all drag panning.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="selectionondrag">
<td><code dir="ltr">selectionOnDrag</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Select multiple elements with a selection box, without pressing down <code dir="ltr">selectionKey</code>.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="selectionmode">
<td><code dir="ltr">selectionMode</code></td>
<td><code dir="ltr">SelectionMode</code>
<div>
<p>When set to <code dir="ltr">"partial"</code>, when the user creates a selection box by click and dragging nodes that are only partially in the box are still selected.</p>
</div></td>
<td><code dir="ltr">'full'</code></td>
</tr>
<tr id="panonscroll">
<td><code dir="ltr">panOnScroll</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls if the viewport should pan by scrolling inside the container. Can be limited to a specific direction with <code dir="ltr">panOnScrollMode</code>.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="panonscrollspeed">
<td><code dir="ltr">panOnScrollSpeed</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Controls how fast viewport should be panned on scroll. Use together with <code dir="ltr">panOnScroll</code> prop.</p>
</div></td>
<td><code dir="ltr">0.5</code></td>
</tr>
<tr id="panonscrollmode">
<td><code dir="ltr">panOnScrollMode</code></td>
<td><code dir="ltr">PanOnScrollMode</code>
<div>
<p>This prop is used to limit the direction of panning when <code dir="ltr">panOnScroll</code> is enabled. The <code dir="ltr">"free"</code> option allows panning in any direction.</p>
</div></td>
<td><code dir="ltr">"free"</code></td>
</tr>
<tr id="zoomonscroll">
<td><code dir="ltr">zoomOnScroll</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls if the viewport should zoom by scrolling inside the container.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="zoomonpinch">
<td><code dir="ltr">zoomOnPinch</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls if the viewport should zoom by pinching on a touch screen.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="zoomondoubleclick">
<td><code dir="ltr">zoomOnDoubleClick</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Controls if the viewport should zoom by double-clicking somewhere on the flow.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="selectnodesondrag">
<td><code dir="ltr">selectNodesOnDrag</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>If <code dir="ltr">true</code>, nodes get selected on drag.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="elevatenodesonselect">
<td><code dir="ltr">elevateNodesOnSelect</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Enabling this option will raise the z-index of nodes when they are selected.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="connectonclick">
<td><code dir="ltr">connectOnClick</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>The <code dir="ltr">connectOnClick</code> option lets you click or tap on a source handle to start a connection and then click on a target handle to complete the connection.</p>
<p>If you set this option to <code dir="ltr">false</code>, users will need to drag the connection line to the target handle to create a connection.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="connectionmode">
<td><code dir="ltr">connectionMode</code></td>
<td><code dir="ltr">ConnectionMode</code>
<div>
<p>A loose connection mode will allow you to connect handles with differing types, including source-to-source connections. However, it does not support target-to-target connections. Strict mode allows only connections between source handles and target handles.</p>
</div></td>
<td><code dir="ltr">'strict'</code></td>
</tr>
<tr id="zindexmode">
<td><code dir="ltr">zIndexMode</code></td>
<td><code dir="ltr">ZIndexMode</code>
<div>
<p>Used to define how z-indexing is calculated for nodes and edges. ‘auto’ is for selections and sub flows, ‘basic’ for selections only, and ‘manual’ for no auto z-indexing.</p>
</div></td>
<td><code dir="ltr">'basic'</code></td>
</tr>
</tbody>
</table>

## Connection line props

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
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Styles to be applied to the connection line.</p>
</div></td>
<td></td>
</tr>
<tr id="connectionlinetype">
<td><code dir="ltr">connectionLineType</code></td>
<td><code dir="ltr">ConnectionLineType</code>
<div>
<p>The type of edge path to use for connection lines. Although created edges can be of any type, React Flow needs to know what type of path to render for the connection line before the edge is created!</p>
</div></td>
<td><code dir="ltr">ConnectionLineType.Bezier</code></td>
</tr>
<tr id="connectionradius">
<td><code dir="ltr">connectionRadius</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The radius around a handle where you drop a connection line to create a new edge.</p>
</div></td>
<td><code dir="ltr">20</code></td>
</tr>
<tr id="connectionlinecomponent">
<td><code dir="ltr">connectionLineComponent</code></td>
<td><code dir="ltr">ConnectionLineComponent<Node></code>
<div>
<p>React Component to be used as a connection line.</p>
</div></td>
<td></td>
</tr>
<tr id="connectionlinecontainerstyle">
<td><code dir="ltr">connectionLineContainerStyle</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Styles to be applied to the container of the connection line.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

## Keyboard props

React Flow let’s you pass in a few different keyboard shortcuts as
another way to interact with your flow. We’ve tried to set up sensible
defaults like using backspace to delete any selected nodes or edges, but
you can use these props to set your own.

To disable any of these shortcuts, pass in `null` to the prop you want
to disable.

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
<tr id="deletekeycode">
<td><code dir="ltr">deleteKeyCode</code></td>
<td><code dir="ltr">KeyCode | null</code>
<div>
<p>If set, pressing the key or chord will delete any selected nodes and edges. Passing an array represents multiple keys that can be pressed.</p>
<p>For example, <code dir="ltr">["Delete", "Backspace"]</code> will delete selected elements when either key is pressed.</p>
</div></td>
<td><code dir="ltr">'Backspace'</code></td>
</tr>
<tr id="selectionkeycode">
<td><code dir="ltr">selectionKeyCode</code></td>
<td><code dir="ltr">KeyCode | null</code>
<div>
<p>If set, holding this key will let you click and drag to draw a selection box around multiple nodes and edges. Passing an array represents multiple keys that can be pressed.</p>
<p>For example, <code dir="ltr">["Shift", "Meta"]</code> will allow you to draw a selection box when either key is pressed.</p>
</div></td>
<td><code dir="ltr">'Shift'</code></td>
</tr>
<tr id="multiselectionkeycode">
<td><code dir="ltr">multiSelectionKeyCode</code></td>
<td><code dir="ltr">KeyCode | null</code>
<div>
<p>Pressing down this key you can select multiple elements by clicking.</p>
</div></td>
<td><code dir="ltr">"Meta" for macOS, "Control" for other systems</code></td>
</tr>
<tr id="zoomactivationkeycode">
<td><code dir="ltr">zoomActivationKeyCode</code></td>
<td><code dir="ltr">KeyCode | null</code>
<div>
<p>If a key is set, you can zoom the viewport while that key is held down even if <code dir="ltr">panOnScroll</code> is set to <code dir="ltr">false</code>.</p>
<p>By setting this prop to <code dir="ltr">null</code> you can disable this functionality.</p>
</div></td>
<td><code dir="ltr">"Meta" for macOS, "Control" for other systems</code></td>
</tr>
<tr id="panactivationkeycode">
<td><code dir="ltr">panActivationKeyCode</code></td>
<td><code dir="ltr">KeyCode | null</code>
<div>
<p>If a key is set, you can pan the viewport while that key is held down even if <code dir="ltr">panOnScroll</code> is set to <code dir="ltr">false</code>.</p>
<p>By setting this prop to <code dir="ltr">null</code> you can disable this functionality.</p>
</div></td>
<td><code dir="ltr">'Space'</code></td>
</tr>
<tr id="disablekeyboarda11y">
<td><code dir="ltr">disableKeyboardA11y</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>You can use this prop to disable keyboard accessibility features such as selecting nodes or moving selected nodes with the arrow keys.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
</tbody>
</table>

## Style props

Applying certain classes to elements rendered inside the canvas will
change how interactions are handled. These props let you configure those
class names if you need to.

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
<tr id="nopanclassname">
<td><code dir="ltr">noPanClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>If an element in the canvas does not stop mouse events from propagating, clicking and dragging that element will pan the viewport. Adding the <code dir="ltr">"nopan"</code> class prevents this behavior and this prop allows you to change the name of that class.</p>
</div></td>
<td><code dir="ltr">"nopan"</code></td>
</tr>
<tr id="nodragclassname">
<td><code dir="ltr">noDragClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>If a node is draggable, clicking and dragging that node will move it around the canvas. Adding the <code dir="ltr">"nodrag"</code> class prevents this behavior and this prop allows you to change the name of that class.</p>
</div></td>
<td><code dir="ltr">"nodrag"</code></td>
</tr>
<tr id="nowheelclassname">
<td><code dir="ltr">noWheelClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Typically, scrolling the mouse wheel when the mouse is over the canvas will zoom the viewport. Adding the <code dir="ltr">"nowheel"</code> class to an element in the canvas will prevent this behavior and this prop allows you to change the name of that class.</p>
</div></td>
<td><code dir="ltr">"nowheel"</code></td>
</tr>
</tbody>
</table>

## Notes

-   The props of this component get exported as `ReactFlowProps`
