---
source: https://reactflow.dev/api-reference/components
title: Components
---

# Components

<div>

## [<Background />](/api-reference/components/background)

The Background component makes it convenient to render different types
of backgrounds common in node-based UIs. It comes with three variants:
lines, dots and cross.

<a href="/api-reference/components/background">Read more </a>

## [<BaseEdge />](/api-reference/components/base-edge)

The BaseEdge component gets used internally for all the edges. It can be
used inside a custom edge and handles the invisible helper edge and the
edge label for you.

<a href="/api-reference/components/base-edge">Read more </a>

## [<ControlButton />](/api-reference/components/control-button)

You can add buttons to the control panel by using the ControlButton
component and pass it as a child to the Controls component.

<a href="/api-reference/components/control-button">Read more </a>

## [<Controls />](/api-reference/components/controls)

The Controls component renders a small panel that contains convenient
buttons to zoom in, zoom out, fit the view, and lock the viewport.

<a href="/api-reference/components/controls">Read more </a>

## [<EdgeLabelRenderer />](/api-reference/components/edge-label-renderer)

Edges are SVG-based. If you want to render more complex labels you can
use the EdgeLabelRenderer component to access a div based renderer. This
component is a portal that renders the label in a div that is positioned
on top of the edges. You can see an example usage of the component in
the edge label renderer example.

<a href="/api-reference/components/edge-label-renderer">Read more </a>

## [<EdgeText />](/api-reference/components/edge-text)

You can use the EdgeText component as a helper component to display text
within your custom edges.

<a href="/api-reference/components/edge-text">Read more </a>

## [<EdgeToolbar />](/api-reference/components/edge-toolbar)

The EdgeToolbar component can render a toolbar or tooltip to one side of
a custom edge. This toolbar doesn't scale with the viewport so that the
content doesn't get too small when zooming out.

<a href="/api-reference/components/edge-toolbar">Read more </a>

## [<Handle />](/api-reference/components/handle)

The Handle component is used in your custom nodes to define connection
points.

<a href="/api-reference/components/handle">Read more </a>

## [<MiniMap />](/api-reference/components/minimap)

The MiniMap component can be used to render an overview of your flow. It
renders each node as an SVG element and visualizes where the current
viewport is in relation to the rest of the flow.

<a href="/api-reference/components/minimap">Read more </a>

## [<NodeResizeControl />](/api-reference/components/node-resize-control)

To create your own resizing UI, you can use the NodeResizeControl
component where you can pass children (such as icons).

<a href="/api-reference/components/node-resize-control">Read more </a>

## [<NodeResizer />](/api-reference/components/node-resizer)

The NodeResizer component can be used to add a resize functionality to
your nodes. It renders draggable controls around the node to resize in
all directions.

<a href="/api-reference/components/node-resizer">Read more </a>

## [<NodeToolbar />](/api-reference/components/node-toolbar)

The NodeToolbar component can render a toolbar or tooltip to one side of
a custom node. This toolbar doesn't scale with the viewport so that the
content is always visible.

<a href="/api-reference/components/node-toolbar">Read more </a>

## [<Panel />](/api-reference/components/panel)

The Panel component helps you position content above the viewport. It is
used internally by the MiniMap and Controls components.

<a href="/api-reference/components/panel">Read more </a>

## [<ViewportPortal />](/api-reference/components/viewport-portal)

The ViewportPortal component can be used to add components to the same
viewport of the flow where nodes and edges are rendered. This is useful
when you want to render your own components that are adhere to the same
coordinate system as the nodes & edges and are also affected by zooming
and panning

<a href="/api-reference/components/viewport-portal">Read more </a>

</div>
