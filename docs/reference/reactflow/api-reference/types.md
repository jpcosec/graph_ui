---
source: https://reactflow.dev/api-reference/types
title: Types
---

# Types

<div>

## [Align](/api-reference/types/align)

The Align type contains the values expected by the align prop of the
NodeToolbar component

<a href="/api-reference/types/align">Read more </a>

## [AriaLabelConfig](/api-reference/types/aria-label-config)

With the AriaLabelConfig you can customize the aria labels and
descriptions used by React Flow.

<a href="/api-reference/types/aria-label-config">Read more </a>

## [BackgroundVariant](/api-reference/types/background-variant)

The three variants are exported as an enum for convenience. You can
either import the enum and use it like BackgroundVariant.Lines or you
can use the raw string value directly.

<a href="/api-reference/types/background-variant">Read more </a>

## [ColorMode](/api-reference/types/color-mode)

The ColorMode type defines the available color modes for the ReactFlow
component.

<a href="/api-reference/types/color-mode">Read more </a>

## [Connection](/api-reference/types/connection)

The Connection type is the basic minimal description of an Edge between
two nodes. The addEdge util can be used to upgrade a Connection to an
Edge.

<a href="/api-reference/types/connection">Read more </a>

## [ConnectionLineComponent](/api-reference/types/connection-line-component)

Custom React component for rendering the connection line during edge
creation.

<a href="/api-reference/types/connection-line-component">Read more </a>

## [ConnectionLineComponentProps](/api-reference/types/connection-line-component-props)

If you want to render a custom component for connection lines, you can
set the connectionLineComponent prop on the ReactFlow component. The
ConnectionLineComponentProps are passed to your custom component.

<a href="/api-reference/types/connection-line-component-props">Read more </a>

## [ConnectionLineType](/api-reference/types/connection-line-type)

If you set the connectionLineType prop on your ReactFlow component, it
will dictate the style of connection line rendered when creating new
edges.

<a href="/api-reference/types/connection-line-type">Read more </a>

## [ConnectionMode](/api-reference/types/connection-mode)

Specifies the rules for how connections between nodes are established.

<a href="/api-reference/types/connection-mode">Read more </a>

## [ConnectionState](/api-reference/types/connection-state)

Data about an ongoing connection.

<a href="/api-reference/types/connection-state">Read more </a>

## [CoordinateExtent](/api-reference/types/coordinate-extent)

A coordinate extent represents two points in a coordinate system: one in
the top left corner and one in the bottom right corner. It is used to
represent the bounds of nodes in the flow or the bounds of the viewport.

<a href="/api-reference/types/coordinate-extent">Read more </a>

## [DefaultEdgeOptions](/api-reference/types/default-edge-options)

Many properties on an Edge are optional. When a new edge is created, the
properties that are not provided will be filled in with the default
values passed to the defaultEdgeOptions prop of the ReactFlow component.

<a href="/api-reference/types/default-edge-options">Read more </a>

## [DeleteElements](/api-reference/types/delete-elements)

DeleteElements deletes nodes and edges from the flow and return the
deleted edges and nodes asynchronously.

<a href="/api-reference/types/delete-elements">Read more </a>

## [Edge](/api-reference/types/edge)

Where a Connection is the minimal description of an edge between two
nodes, an \`Edge\` is the complete description with everything React
Flow needs to know in order to render it.

<a href="/api-reference/types/edge">Read more </a>

## [EdgeChange](/api-reference/types/edge-change)

The onEdgesChange callback takes an array of EdgeChange objects that you
should use to update your flow's state. The EdgeChange type is a union
of four different object types that represent that various ways an edge
can change in a flow.

<a href="/api-reference/types/edge-change">Read more </a>

## [EdgeMarker](/api-reference/types/edge-marker)

Edges can optionally have markers at the start and end of an edge. The
EdgeMarker type is used to configure those markers! Check the docs for
MarkerType for details on what types of edge marker are available.

<a href="/api-reference/types/edge-marker">Read more </a>

## [EdgeMouseHandler](/api-reference/types/edge-mouse-handler)

The EdgeMouseHandler type defines the callback function that is called
when mouse events occur on an edge.

<a href="/api-reference/types/edge-mouse-handler">Read more </a>

## [EdgeProps](/api-reference/types/edge-props)

When you implement a custom edge it is wrapped in a component that
enables some basic functionality. Your custom edge component receives
the following props:

<a href="/api-reference/types/edge-props">Read more </a>

## [EdgeTypes](/api-reference/types/edge-types)

The EdgeTypes type is used to define custom edge types.

<a href="/api-reference/types/edge-types">Read more </a>

## [FitViewOptions](/api-reference/types/fit-view-options)

When calling fitView these options can be used to customize the
behavior. For example, the duration option can be used to transform the
viewport smoothly over a given amount of time.

<a href="/api-reference/types/fit-view-options">Read more </a>

## [Handle](/api-reference/types/handle)

Handle attributes like id, position, and type.

<a href="/api-reference/types/handle">Read more </a>

## [HandleConnection](/api-reference/types/handle-connection)

The HandleConnection type is a Connection that includes the edgeId.

<a href="/api-reference/types/handle-connection">Read more </a>

## [InternalNode](/api-reference/types/internal-node)

The InternalNode is an extension of the base Node type with additional
properties React Flow uses internally for rendering.

<a href="/api-reference/types/internal-node">Read more </a>

## [IsValidConnection](/api-reference/types/is-valid-connection)

Function type that determines whether a connection between nodes is
valid.

<a href="/api-reference/types/is-valid-connection">Read more </a>

## [KeyCode](/api-reference/types/key-code)

Represents keyboard key codes or combinations.

<a href="/api-reference/types/key-code">Read more </a>

## [MarkerType](/api-reference/types/marker-type)

Edges may optionally have a marker on either end. The MarkerType type
enumerates the options available to you when configuring a given marker.

<a href="/api-reference/types/marker-type">Read more </a>

## [MiniMapNodeProps](/api-reference/types/mini-map-node-props)

The MiniMapNodeProps type defines the properties for nodes in a minimap
component.

<a href="/api-reference/types/mini-map-node-props">Read more </a>

## [Node](/api-reference/types/node)

The Node type represents everything React Flow needs to know about a
given node. Many of these properties can be manipulated both by React
Flow or by you, but some such as width and height should be considered
read-only.

<a href="/api-reference/types/node">Read more </a>

## [NodeChange](/api-reference/types/node-change)

The onNodesChange callback takes an array of NodeChange objects that you
should use to update your flow's state. The NodeChange type is a union
of six different object types that represent that various ways an node
can change in a flow.

<a href="/api-reference/types/node-change">Read more </a>

## [NodeConnection](/api-reference/types/node-connection)

The NodeConnection type is a Connection that includes the edgeId.

<a href="/api-reference/types/node-connection">Read more </a>

## [NodeHandle](/api-reference/types/node-handle)

The NodeHandle type is used to define a handle for a node if server side
rendering is used.

<a href="/api-reference/types/node-handle">Read more </a>

## [NodeMouseHandler](/api-reference/types/node-mouse-handler)

The NodeMouseHandler type defines the callback function that is called
when mouse events occur on a node.

<a href="/api-reference/types/node-mouse-handler">Read more </a>

## [NodeOrigin](/api-reference/types/node-origin)

The origin of a Node determines how it is placed relative to its own
coordinates.

<a href="/api-reference/types/node-origin">Read more </a>

## [NodeProps](/api-reference/types/node-props)

When you implement a custom node it is wrapped in a component that
enables basic functionality like selection and dragging. Your custom
node receives the following props:

<a href="/api-reference/types/node-props">Read more </a>

## [NodeTypes](/api-reference/types/node-types)

The NodeTypes type is used to define custom node types.

<a href="/api-reference/types/node-types">Read more </a>

## [OnBeforeDelete](/api-reference/types/on-before-delete)

The OnBeforeDelete type defines the callback function that is called
before nodes or edges are deleted.

<a href="/api-reference/types/on-before-delete">Read more </a>

## [OnConnect](/api-reference/types/on-connect)

Callback function triggered when a new connection is created between
nodes.

<a href="/api-reference/types/on-connect">Read more </a>

## [OnConnectEnd](/api-reference/types/on-connect-end)

Callback function triggered when finishing or canceling a connection
attempt between nodes.

<a href="/api-reference/types/on-connect-end">Read more </a>

## [OnConnectStart](/api-reference/types/on-connect-start)

Callback function triggered when starting to create a connection between
nodes.

<a href="/api-reference/types/on-connect-start">Read more </a>

## [OnDelete](/api-reference/types/on-delete)

The OnDelete type defines the callback function that is called when
nodes or edges are deleted.

<a href="/api-reference/types/on-delete">Read more </a>

## [OnEdgesChange](/api-reference/types/on-edges-change)

<a href="/api-reference/types/on-edges-change">Read more </a>

## [OnEdgesDelete](/api-reference/types/on-edges-delete)

The OnEdgesDelete type defines the callback function that is called when
edges are deleted.

<a href="/api-reference/types/on-edges-delete">Read more </a>

## [OnError](/api-reference/types/on-error)

The OnError type defines the callback function that is called when an
error occurs.

<a href="/api-reference/types/on-error">Read more </a>

## [OnInit](/api-reference/types/on-init)

The OnInit type defines the callback function that is called when the
ReactFlow instance is initialized.

<a href="/api-reference/types/on-init">Read more </a>

## [OnMove](/api-reference/types/on-move)

Invoked when the viewport is moved, such as by panning or zooming.

<a href="/api-reference/types/on-move">Read more </a>

## [OnNodeDrag](/api-reference/types/on-node-drag)

The OnNodeDrag type defines the callback function that is called when a
node is being dragged.

<a href="/api-reference/types/on-node-drag">Read more </a>

## [OnNodesChange](/api-reference/types/on-nodes-change)

<a href="/api-reference/types/on-nodes-change">Read more </a>

## [OnNodesDelete](/api-reference/types/on-nodes-delete)

The OnNodesDelete type defines the callback function that is called when
nodes are deleted.

<a href="/api-reference/types/on-nodes-delete">Read more </a>

## [OnReconnect](/api-reference/types/on-reconnect)

Callback function triggered when an existing edge is reconnected to a
different node or handle.

<a href="/api-reference/types/on-reconnect">Read more </a>

## [OnSelectionChangeFunc](/api-reference/types/on-selection-change-func)

Called whenever the selection of nodes or edges changes in the flow
diagram.

<a href="/api-reference/types/on-selection-change-func">Read more </a>

## [PanOnScrollMode](/api-reference/types/pan-on-scroll-mode)

Configures how the viewport responds to scroll events, allowing free,
vertical, or horizontal panning.

<a href="/api-reference/types/pan-on-scroll-mode">Read more </a>

## [PanelPosition](/api-reference/types/panel-position)

This type is mostly used to help position things on top of the flow
viewport. For example both the MiniMap and Controls components take a
position prop of this type.

<a href="/api-reference/types/panel-position">Read more </a>

## [Position](/api-reference/types/position)

While PanelPosition can be used to place a component in the corners of a
container, the Position enum is less precise and used primarily in
relation to edges and handles.

<a href="/api-reference/types/position">Read more </a>

## [ProOptions](/api-reference/types/pro-options)

By default, we render a small attribution in the corner of your flows
that links back to the project.

<a href="/api-reference/types/pro-options">Read more </a>

## [ReactFlowInstance](/api-reference/types/react-flow-instance)

The ReactFlowInstance provides a collection of methods to query and
manipulate the internal state of your flow. You can get an instance by
using the useReactFlow hook or attaching a listener to the onInit event.

<a href="/api-reference/types/react-flow-instance">Read more </a>

## [ReactFlowJsonObject](/api-reference/types/react-flow-json-object)

A JSON-compatible representation of your flow. You can use this to save
the flow to a database for example and load it back in later.

<a href="/api-reference/types/react-flow-json-object">Read more </a>

## [Rect](/api-reference/types/rect)

The Rect type defines a rectangle with dimensions and a position.

<a href="/api-reference/types/rect">Read more </a>

## [ResizeParams](/api-reference/types/resize-params)

The ResizeParams type is used to type the various events that are
emitted by the NodeResizer component. You'll sometimes see this type
extended with an additional direction field too.

<a href="/api-reference/types/resize-params">Read more </a>

## [SelectionDragHandler](/api-reference/types/selection-drag-handler)

Handles drag events for selected nodes during interactive operations.

<a href="/api-reference/types/selection-drag-handler">Read more </a>

## [SelectionMode](/api-reference/types/selection-mode)

Controls how nodes are selected in the flow diagram, offering either
full or partial selection behavior.

<a href="/api-reference/types/selection-mode">Read more </a>

## [SnapGrid](/api-reference/types/snap-grid)

The SnapGrid type defines the grid size for snapping nodes on the pane.

<a href="/api-reference/types/snap-grid">Read more </a>

## [Viewport](/api-reference/types/viewport)

Internally, React Flow maintains a coordinate system that is independent
of the rest of the page. The Viewport type tells you where in that
system your flow is currently being display at and how zoomed in or out
it is.

<a href="/api-reference/types/viewport">Read more </a>

## [XYPosition](/api-reference/types/xy-position)

All positions are stored in an object with x and y coordinates.

<a href="/api-reference/types/xy-position">Read more </a>

## [ZIndexMode](/api-reference/types/z-index-mode)

The ZIndexMode type is used to define how z-indexing is calculated for
nodes and edges.

<a href="/api-reference/types/z-index-mode">Read more </a>

</div>
