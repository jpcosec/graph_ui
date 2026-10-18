---
source: https://reactflow.dev/api-reference/utils
title: Utils
---

# Utils

<div>

## [addEdge()](/api-reference/utils/add-edge)

This util is a convenience function to add a new Edge to an array of
edges. It also performs some validation to make sure you don't add an
invalid edge or duplicate an existing one.

<a href="/api-reference/utils/add-edge">Read more </a>

## [applyEdgeChanges()](/api-reference/utils/apply-edge-changes)

Various events on the ReactFlow component can produce an EdgeChange that
describes how to update the edges of your flow in some way. If you don't
need any custom behavior, this util can be used to take an array of
these changes and apply them to your edges.

<a href="/api-reference/utils/apply-edge-changes">Read more </a>

## [applyNodeChanges()](/api-reference/utils/apply-node-changes)

Various events on the ReactFlow component can produce a NodeChange that
describes how to update the nodes of your flow in some way. If you don't
need any custom behavior, this util can be used to take an array of
these changes and apply them to your nodes.

<a href="/api-reference/utils/apply-node-changes">Read more </a>

## [getBezierPath()](/api-reference/utils/get-bezier-path)

The getBezierPath util returns everything you need to render a bezier
edge between two nodes.

<a href="/api-reference/utils/get-bezier-path">Read more </a>

## [getConnectedEdges()](/api-reference/utils/get-connected-edges)

Given an array of nodes that may be connected to one another and an
array of all your edges, this util gives you an array of edges that
connect any of the given nodes together.

<a href="/api-reference/utils/get-connected-edges">Read more </a>

## [getIncomers()](/api-reference/utils/get-incomers)

This util is used to tell you what nodes, if any, are connected to the
given node as the source of an edge.

<a href="/api-reference/utils/get-incomers">Read more </a>

## [getNodesBounds()](/api-reference/utils/get-nodes-bounds)

Returns the bounding box that contains all the given nodes in an array.
This can be useful when combined with \`getViewportForBounds\` to
calculate the correct transform to fit the given nodes in a viewport.

<a href="/api-reference/utils/get-nodes-bounds">Read more </a>

## [getOutgoers()](/api-reference/utils/get-outgoers)

This util is used to tell you what nodes, if any, are connected to the
given node as the target of an edge.

<a href="/api-reference/utils/get-outgoers">Read more </a>

## [getSimpleBezierPath()](/api-reference/utils/get-simple-bezier-path)

The getSimpleBezierPath util returns everything you need to render a
simple bezier edge between two nodes.

<a href="/api-reference/utils/get-simple-bezier-path">Read more </a>

## [getSmoothStepPath()](/api-reference/utils/get-smooth-step-path)

The getSmoothStepPath util returns everything you need to render a
stepped path between two nodes. The borderRadius property can be used to
choose how rounded the corners of those steps are.

<a href="/api-reference/utils/get-smooth-step-path">Read more </a>

## [getStraightPath()](/api-reference/utils/get-straight-path)

Calculates the straight line path between two points.

<a href="/api-reference/utils/get-straight-path">Read more </a>

## [getViewportForBounds()](/api-reference/utils/get-viewport-for-bounds)

This util returns the viewport for the given bounds. You might use this
to pre-calculate the viewport for a given set of nodes on the server or
calculate the viewport for the given bounds \_without\_ changing the
viewport directly.

<a href="/api-reference/utils/get-viewport-for-bounds">Read more </a>

## [isEdge()](/api-reference/utils/is-edge)

Test whether an object is usable as an Edge. In TypeScript this is a
type guard that will narrow the type of whatever you pass in to Edge if
it returns true.

<a href="/api-reference/utils/is-edge">Read more </a>

## [isNode()](/api-reference/utils/is-node)

Test whether an object is usable as a Node. In TypeScript this is a type
guard that will narrow the type of whatever you pass in to Node if it
returns true.

<a href="/api-reference/utils/is-node">Read more </a>

## [reconnectEdge()](/api-reference/utils/reconnect-edge)

A handy utility to reconnect an existing Edge with new properties. This
searches your edge array for an edge with a matching id and updates its
properties with the connection you provide.

<a href="/api-reference/utils/reconnect-edge">Read more </a>

</div>
