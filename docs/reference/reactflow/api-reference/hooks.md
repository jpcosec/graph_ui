---
source: https://reactflow.dev/api-reference/hooks
title: Hooks
---

# Hooks

<div>

## [useConnection()](/api-reference/hooks/use-connection)

The useConnection hook returns the current connection when there is an
active connection interaction. If no connection interaction is active,
it returns null for every property. A typical use case for this hook is
to colorize handles based on a certain condition (e.g. if the connection
is valid or not).

<a href="/api-reference/hooks/use-connection">Read more </a>

## [useEdges()](/api-reference/hooks/use-edges)

This hook returns an array of the current edges. Components that use
this hook will re-render whenever any edge changes.

<a href="/api-reference/hooks/use-edges">Read more </a>

## [useEdgesState()](/api-reference/hooks/use-edges-state)

This hook makes it easy to prototype a controlled flow where you manage
the state of nodes and edges outside the ReactFlowInstance. You can
think of it like React's \`useState\` hook with an additional helper
callback.

<a href="/api-reference/hooks/use-edges-state">Read more </a>

## [useHandleConnections()](/api-reference/hooks/use-handle-connections)

This hook returns an array of the current edges. Components that use
this hook will re-render whenever any edge changes.

<a href="/api-reference/hooks/use-handle-connections">Read more </a>

## [useInternalNode()](/api-reference/hooks/use-internal-node)

This hook returns an InternalNode object for the given node ID.

<a href="/api-reference/hooks/use-internal-node">Read more </a>

## [useKeyPress()](/api-reference/hooks/use-key-press)

This hook lets you listen for specific key codes and tells you whether
they are currently pressed or not.

<a href="/api-reference/hooks/use-key-press">Read more </a>

## [useNodeConnections()](/api-reference/hooks/use-node-connections)

This hook returns an array of connected edges. Components that use this
hook will re-render whenever any edge changes.

<a href="/api-reference/hooks/use-node-connections">Read more </a>

## [useNodeId()](/api-reference/hooks/use-node-id)

You can use this hook to get the id of the node it is used inside. It is
useful if you need the node's id deeper in the render tree but don't
want to manually drill down the id as a prop.

<a href="/api-reference/hooks/use-node-id">Read more </a>

## [useNodes()](/api-reference/hooks/use-nodes)

This hook returns an array of the current nodes. Components that use
this hook will re-render whenever any node changes, including when a
node is selected or moved.

<a href="/api-reference/hooks/use-nodes">Read more </a>

## [useNodesData()](/api-reference/hooks/use-nodes-data)

With this hook you can subscribe to changes of a node data of a specific
node.

<a href="/api-reference/hooks/use-nodes-data">Read more </a>

## [useNodesInitialized()](/api-reference/hooks/use-nodes-initialized)

This hook tells you whether all the nodes in a flow have been measured
and given a width and height. When you add a node to the flow, this hook
will return false and then true again once the node has been measured.

<a href="/api-reference/hooks/use-nodes-initialized">Read more </a>

## [useNodesState()](/api-reference/hooks/use-nodes-state)

This hook makes it easy to prototype a controlled flow where you manage
the state of nodes and edges outside the ReactFlowInstance. You can
think of it like React's \`useState\` hook with an additional helper
callback.

<a href="/api-reference/hooks/use-nodes-state">Read more </a>

## [useOnSelectionChange()](/api-reference/hooks/use-on-selection-change)

This hook lets you listen for changes to both node and edge selection.
As the name implies, the callback you provide will be called whenever
the selection of either nodes or edges changes.

<a href="/api-reference/hooks/use-on-selection-change">Read more </a>

## [useOnViewportChange()](/api-reference/hooks/use-on-viewport-change)

The useOnViewportChange hook lets you listen for changes to the viewport
such as panning and zooming. You can provide a callback for each phase
of a viewport change: onStart, onChange, and onEnd.

<a href="/api-reference/hooks/use-on-viewport-change">Read more </a>

## [useReactFlow()](/api-reference/hooks/use-react-flow)

This hook returns a ReactFlowInstance that can be used to update nodes
and edges, manipulate the viewport, or query the current state of the
flow.

<a href="/api-reference/hooks/use-react-flow">Read more </a>

## [useStore()](/api-reference/hooks/use-store)

This hook can be used to subscribe to internal state changes of the
React Flow component. The useStore hook is re-exported from the Zustand
state management library, so you should check out their docs for more
details.

<a href="/api-reference/hooks/use-store">Read more </a>

## [useStoreApi()](/api-reference/hooks/use-store-api)

In some cases, you might need to access the store directly. This hook
returns the store object which can be used on demand to access the state
or dispatch actions.

<a href="/api-reference/hooks/use-store-api">Read more </a>

## [useUpdateNodeInternals()](/api-reference/hooks/use-update-node-internals)

When you programmatically add or remove handles to a node or update a
node's handle position, you need to let React Flow know about it using
this hook. This will update the internal dimensions of the node and
properly reposition handles on the canvas if necessary.

<a href="/api-reference/hooks/use-update-node-internals">Read more </a>

## [useViewport()](/api-reference/hooks/use-viewport)

The useViewport hook is a convenient way to read the current state of
the Viewport in a component. Components that use this hook will
re-render whenever the viewport changes.

<a href="/api-reference/hooks/use-viewport">Read more </a>

</div>
