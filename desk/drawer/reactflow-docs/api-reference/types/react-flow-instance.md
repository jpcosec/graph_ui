---
source: https://reactflow.dev/api-reference/types/react-flow-instance
title: ReactFlowInstance
---

# ReactFlowInstance

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/instance.ts/#L178-L179">Source on GitHub </a>

The `ReactFlowInstance` provides a collection of methods to query and
manipulate the internal state of your flow. You can get an instance by
using the
<a href="/api-reference/hooks/use-react-flow"><code dir="ltr">useReactFlow</code></a>
hook or attaching a listener to the
<a href="/api-reference/react-flow#event-oninit"><code dir="ltr">onInit</code></a>
event.

## Fields

### Nodes and edges

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
<tr id="getnodes">
<td><code dir="ltr">getNodes</code></td>
<td><code dir="ltr">() => Node[]</code>
<div>
<p>Returns nodes.</p>
</div></td>
<td></td>
</tr>
<tr id="setnodes">
<td><code dir="ltr">setNodes</code></td>
<td><code dir="ltr">(payload: Node[] | ((nodes: Node[]) => Node[])) => void</code>
<div>
<p>Set your nodes array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the <code dir="ltr">onNodesChange</code> handler in a controlled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="addnodes">
<td><code dir="ltr">addNodes</code></td>
<td><code dir="ltr">(payload: Node | Node[]) => void</code>
<div>
<p>Add one or many nodes to your existing nodes array. Calling this function will trigger the <code dir="ltr">onNodesChange</code> handler in a controlled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="getnode">
<td><code dir="ltr">getNode</code></td>
<td><code dir="ltr">(id: string) => Node | undefined</code>
<div>
<p>Returns a node by id.</p>
</div></td>
<td></td>
</tr>
<tr id="getinternalnode">
<td><code dir="ltr">getInternalNode</code></td>
<td><code dir="ltr">(id: string) => InternalNode<Node> | undefined</code>
<div>
<p>Returns an internal node by id.</p>
</div></td>
<td></td>
</tr>
<tr id="getedges">
<td><code dir="ltr">getEdges</code></td>
<td><code dir="ltr">() => Edge[]</code>
<div>
<p>Returns edges.</p>
</div></td>
<td></td>
</tr>
<tr id="setedges">
<td><code dir="ltr">setEdges</code></td>
<td><code dir="ltr">(payload: Edge[] | ((edges: Edge[]) => Edge[])) => void</code>
<div>
<p>Set your edges array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the <code dir="ltr">onEdgesChange</code> handler in a controlled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="addedges">
<td><code dir="ltr">addEdges</code></td>
<td><code dir="ltr">(payload: Edge | Edge[]) => void</code>
<div>
<p>Add one or many edges to your existing edges array. Calling this function will trigger the <code dir="ltr">onEdgesChange</code> handler in a controlled flow.</p>
</div></td>
<td></td>
</tr>
<tr id="getedge">
<td><code dir="ltr">getEdge</code></td>
<td><code dir="ltr">(id: string) => Edge | undefined</code>
<div>
<p>Returns an edge by id.</p>
</div></td>
<td></td>
</tr>
<tr id="toobject">
<td><code dir="ltr">toObject</code></td>
<td><code dir="ltr">() => ReactFlowJsonObject<Node, Edge></code>
<div>
<p>Returns the nodes, edges and the viewport as a JSON object.</p>
</div></td>
<td></td>
</tr>
<tr id="deleteelements">
<td><code dir="ltr">deleteElements</code></td>
<td><code dir="ltr">(params: DeleteElementsOptions) => Promise<{ deletedNodes: Node[]; deletedEdges: Edge[]; }></code>
<div>
<p>Deletes nodes and edges.</p>
</div></td>
<td></td>
</tr>
<tr id="updatenode">
<td><code dir="ltr">updateNode</code></td>
<td><code dir="ltr">(id: string, nodeUpdate: Partial<Node> | ((node: Node) => Partial<Node>), options?: { replace: boolean; } | undefined) => void</code>
<div>
<p>Updates a node.</p>
</div></td>
<td></td>
</tr>
<tr id="updatenodedata">
<td><code dir="ltr">updateNodeData</code></td>
<td><code dir="ltr">(id: string, dataUpdate: Partial<Record<string, unknown>> | ((node: Node) => Partial<Record<string, unknown>>), options?: { replace: boolean; } | undefined) => void</code>
<div>
<p>Updates the data attribute of a node.</p>
</div></td>
<td></td>
</tr>
<tr id="updateedge">
<td><code dir="ltr">updateEdge</code></td>
<td><code dir="ltr">(id: string, edgeUpdate: Partial<Edge> | ((edge: Edge) => Partial<Edge>), options?: { replace: boolean; } | undefined) => void</code>
<div>
<p>Updates an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="updateedgedata">
<td><code dir="ltr">updateEdgeData</code></td>
<td><code dir="ltr">(id: string, dataUpdate: Partial<Record<string, unknown> | undefined> | ((edge: Edge) => Partial<Record<string, unknown> | undefined>), options?: { ...; } | undefined) => void</code>
<div>
<p>Updates the data attribute of a edge.</p>
</div></td>
<td></td>
</tr>
<tr id="getnodesbounds">
<td><code dir="ltr">getNodesBounds</code></td>
<td><code dir="ltr">(nodes: (string | Node | InternalNode)[]) => Rect</code>
<div>
<p>Returns the bounds of the given nodes or node ids.</p>
</div></td>
<td></td>
</tr>
<tr id="gethandleconnections">
<td><code dir="ltr">getHandleConnections</code></td>
<td><code dir="ltr">({ type, id, nodeId, }: { type: HandleType; nodeId: string; id?: string | null; }) => HandleConnection[]</code>
<div>
<p>Get all the connections of a handle belonging to a specific node. The type parameter be either <code dir="ltr">'source'</code> or <code dir="ltr">'target'</code>.</p>
</div></td>
<td></td>
</tr>
<tr id="getnodeconnections">
<td><code dir="ltr">getNodeConnections</code></td>
<td><code dir="ltr">({ type, handleId, nodeId, }: { type?: HandleType; nodeId: string; handleId?: string | null; }) => NodeConnection[]</code>
<div>
<p>Gets all connections to a node. Can be filtered by handle type and id.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Intersections

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
<tr id="getintersectingnodes">
<td><code dir="ltr">getIntersectingNodes</code></td>
<td><code dir="ltr">(node: Node | Rect | { id: string; }, partially?: boolean | undefined, nodes?: Node[] | undefined) => Node[]</code>
<div>
<p>Find all the nodes currently intersecting with a given node or rectangle. The <code dir="ltr">partially</code> parameter can be set to <code dir="ltr">true</code> to include nodes that are only partially intersecting.</p>
</div></td>
<td></td>
</tr>
<tr id="isnodeintersecting">
<td><code dir="ltr">isNodeIntersecting</code></td>
<td><code dir="ltr">(node: Node | Rect | { id: string; }, area: Rect, partially?: boolean | undefined) => boolean</code>
<div>
<p>Determine if a given node or rectangle is intersecting with another rectangle. The <code dir="ltr">partially</code> parameter can be set to true return <code dir="ltr">true</code> even if the node is only partially intersecting.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

### Viewport

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
<tr id="zoomin">
<td><code dir="ltr">zoomIn</code></td>
<td><code dir="ltr">(options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" | "linear"; }) => Promise<boolean></code>
<div>
<p>Zooms viewport in by 1.2.</p>
</div></td>
<td></td>
</tr>
<tr id="zoomout">
<td><code dir="ltr">zoomOut</code></td>
<td><code dir="ltr">(options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" | "linear"; }) => Promise<boolean></code>
<div>
<p>Zooms viewport out by 1 / 1.2.</p>
</div></td>
<td></td>
</tr>
<tr id="zoomto">
<td><code dir="ltr">zoomTo</code></td>
<td><code dir="ltr">(zoomLevel: number, options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" | "linear"; }) => Promise<boolean></code>
<div>
<p>Zoom the viewport to a given zoom level. Passing in a <code dir="ltr">duration</code> will animate the viewport to the new zoom level.</p>
</div></td>
<td></td>
</tr>
<tr id="getzoom">
<td><code dir="ltr">getZoom</code></td>
<td><code dir="ltr">() => number</code>
<div>
<p>Get the current zoom level of the viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="setviewport">
<td><code dir="ltr">setViewport</code></td>
<td><code dir="ltr">(viewport: Viewport, options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" | "linear"; }) => Promise<boolean></code>
<div>
<p>Sets the current viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="getviewport">
<td><code dir="ltr">getViewport</code></td>
<td><code dir="ltr">() => Viewport</code>
<div>
<p>Returns the current viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="setcenter">
<td><code dir="ltr">setCenter</code></td>
<td><code dir="ltr">(x: number, y: number, options?: ViewportHelperFunctionOptions & { zoom?: number; }) => Promise<boolean></code>
<div>
<p>Center the viewport on a given position. Passing in a <code dir="ltr">duration</code> will animate the viewport to the new position.</p>
</div></td>
<td></td>
</tr>
<tr id="fitbounds">
<td><code dir="ltr">fitBounds</code></td>
<td><code dir="ltr">(bounds: Rect, options?: ViewportHelperFunctionOptions & { padding?: number; }) => Promise<boolean></code>
<div>
<p>A low-level utility function to fit the viewport to a given rectangle. By passing in a <code dir="ltr">duration</code>, the viewport will animate from its current position to the new position. The <code dir="ltr">padding</code> option can be used to add space around the bounds.</p>
</div></td>
<td></td>
</tr>
<tr id="screentoflowposition">
<td><code dir="ltr">screenToFlowPosition</code></td>
<td><code dir="ltr">(clientPosition: XYPosition, options?: { snapToGrid?: boolean; snapGrid?: SnapGrid; } | undefined) => XYPosition</code>
<div>
<p>With this function you can translate a screen pixel position to a flow position. It is useful for implementing drag and drop from a sidebar for example.</p>
</div></td>
<td></td>
</tr>
<tr id="flowtoscreenposition">
<td><code dir="ltr">flowToScreenPosition</code></td>
<td><code dir="ltr">(flowPosition: XYPosition) => XYPosition</code>
<div>
<p>Translate a position inside the flow’s canvas to a screen pixel position.</p>
</div></td>
<td></td>
</tr>
<tr id="viewportinitialized">
<td><code dir="ltr">viewportInitialized</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>React Flow needs to mount the viewport to the DOM and initialize its zoom and pan behavior. This property tells you when viewport is initialized.</p>
</div></td>
<td></td>
</tr>
<tr id="fitview">
<td><code dir="ltr">fitView</code></td>
<td><code dir="ltr">(fitViewOptions?: { padding?: Padding; includeHiddenNodes?: boolean; minZoom?: number; maxZoom?: number; duration?: number; ease?: (t: number) => number; interpolate?: "smooth" | "linear"; nodes?: (NodeType | { id: string; })[]; }) => Promise<boolean></code>
<div>
<p>Fits the view based on the passed params. By default it fits the view to all nodes.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>
