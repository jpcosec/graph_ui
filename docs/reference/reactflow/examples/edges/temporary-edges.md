---
source: https://reactflow.dev/examples/edges/temporary-edges
title: Temporary Edges
---

# Temporary Edges

In React Flow, almost everything is built around the concepts of nodes
and edges. Edges are the connections between nodes, but what if we want
to create an edge that is only connected to one node? What about an
“edge” not connected to any nodes at all?

This example shows how to create an “incomplete” edge when a user
releases a connection line without making a connection. A ghost node is
rendered where the connection line was released, and a temporary edge is
added to the flow. Making use of editable edges, the user can pick the
edge back up and complete the connection at which point the ghost node
is removed!

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

Instead of connecting `A` directly to `B` in the flow, try releasing the
connection line in an empty space to create a temporary edge!

</div>

</div>

<div
class="remote-code-viewer border-border mt-5 flex flex-col overflow-hidden rounded-xl border dark:border-gray-700">

<div style="aspect-ratio:16/9">

<div>

<div id="app">

</div>

</div>

</div>

<div>

<div dir="ltr" orientation="horizontal">

<div
class="grid grid-flow-col grid-cols-[1fr_min-content] gap-2 border-t border-b border-border dark:border-gray-700">

<div
class="border-border mb-4 flex gap-x-0 border-b tablist h-full overflow-x-auto overflow-y-hidden text-nowrap border-none"
role="tablist" aria-orientation="horizontal" tabindex="-1"
orientation="horizontal" style="outline:none">

App.jsx

xy-theme.css

index.css

useIncompleteEdge.jsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_17kt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_17kt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import './index.css';
 
import { GhostNode, useIncompleteEdge } from './useIncompleteEdge';
 
const nodeTypes = {
  ghost: GhostNode,
};
 
const initialNodes = [
  { id: '0', type: 'input', data: { label: 'A' }, position: { x: 0, y: -100 } },
  { id: '1', type: 'output', data: { label: 'B' }, position: { x: 0, y: 100 } },
];
 
const IncompleteEdge = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
  const handlers = useIncompleteEdge();
 
  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      {...handlers}
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default () => (
  <ReactFlowProvider>
    <IncompleteEdge />
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_17kt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_17kt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_17kt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_17kt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_17kt5fiv5tlqlb_-content-useIncompleteEdge.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_17kt5fiv5tlqlb_-trigger-useIncompleteEdge.jsx"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>

We’ve defined a `useIncompleteEdge` hook that encapsulates the logic for
creating and managing a “ghost node”. It returns a number of event
handlers intended to be passed to the `<ReactFlow />` component.

-   <a href="/api-reference/react-flow#onconnect"><code dir="ltr">onConnect</code></a>
    is called when a complete connection is made.

-   <a href="/api-reference/react-flow#onconnectend"><code dir="ltr">onConnectEnd</code></a>
    is called when the user releases a connection line. The second
    `connectionState` param can be used to determine if the connection
    was successful or not and where it started (and ended if the
    connection is valid). This callback creates a ghost node and a
    temporary edge from the `connectionState.fromNode.id` to that ghost
    node. The temporary edge is marked as `reconnectable` so that the
    user can pick it back up and complete the connection.

-   <a href="/api-reference/react-flow#onreconnect"><code dir="ltr">onReconnect</code></a>
    is called when a complete reconnection is made.

-   <a href="/api-reference/react-flow#onreconnectstart"><code dir="ltr">onReconnectEnd</code></a>
    is called when the user releases a reconnection line. This callback
    removes the ghost node and temporary edge. A new one may be added
    back when `onConnectEnd` is called.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

This example is an adaptation of our
<a href="/examples/nodes/add-node-on-edge-drop">add node on edge drop</a>
example!

</div>

</div>
