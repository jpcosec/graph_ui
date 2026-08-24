---
source: https://reactflow.dev/examples/edges/reconnect-edge
title: Reconnect Edge
---

# Reconnect Edge

An edge is reconnectable by dragging it to another handle if you are
using the
<a href="/api-reference/react-flow#edges"><code dir="ltr">onReconnect</code> handler prop</a>.
The handler gets called after the edge gets dropped to a new handle. You
can use the
<a href="/api-reference/utils/reconnect-edge"><code dir="ltr">reconnectEdge</code></a>
helper function to update your edges state accordingly.

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

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  Controls,
  reconnectEdge,
  addEdge,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: {
      label: (
        <>
          Node <strong>A</strong>
        </>
      ),
    },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: {
      label: (
        <>
          Node <strong>B</strong>
        </>
      ),
    },
    position: { x: 75, y: 0 },
  },
  {
    id: '3',
    data: {
      label: (
        <>
          Node <strong>C</strong>
        </>
      ),
    },
    position: { x: 400, y: 100 },
    style: {
      width: 180,
    },
  },
  {
    id: '4',
    data: {
      label: (
        <>
          Node <strong>D</strong>
        </>
      ),
    },
    position: { x: -75, y: 100 },
  },
  {
    id: '5',
    data: {
      label: (
        <>
          Node <strong>E</strong>
        </>
      ),
    },
    position: { x: 150, y: 100 },
  },
  {
    id: '6',
    data: {
      label: (
        <>
          Node <strong>F</strong>
        </>
      ),
    },
    position: { x: 150, y: 250 },
  },
];
 
const initialEdges = [
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    label: 'This edge can only be updated from source',
    reconnectable: 'source',
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    label: 'This edge can only be updated from target',
    reconnectable: 'target',
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    label: 'This edge can be updated from both sides',
  },
];
 
const EdgeReconnect = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  // gets called after end of edge gets dragged to another source or target
  const onReconnect = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [],
  );
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      snapToGrid
      onReconnect={onReconnect}
      onConnect={onConnect}
      fitView
      attributionPosition="top-right"
      colorMode="system"
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};
 
export default EdgeReconnect;
```

</div>

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

A couple of properties interact with one another to determine whether an
edge is reconnectable or not:

-   By default the
    <a href="/api-reference/react-flow#edgesreconnectable"><code dir="ltr">edgesReconnectable</code></a>
    is set to `true`.

-   For edges to actually be draggable, though, it is also necessary to
    define a
    <a href="/api-reference/react-flow#onreconnect"><code dir="ltr">onReconnect</code></a>
    handler.

-   Individual edges can refine or override the
    <a href="/api-reference/react-flow#edgesreconnectable"><code dir="ltr">edgesReconnectable</code></a>
    prop by setting their
    <a href="/api-reference/types/edge#reconnectable"><code dir="ltr">reconnectable</code></a>
    property.

    -   `true` means the edge is reconnectable even if
        <a href="/api-reference/react-flow#edgesreconnectable"><code dir="ltr">edgesReconnectable</code></a>

    -   `"source"` or `"target"` means the edge is reconnectable only
        from the source or target handle regardless of the
        <a href="/api-reference/react-flow#edgesreconnectable"><code dir="ltr">edgesReconnectable</code></a>
        prop.

    -   `false` means the edge is not reconnectable even if
        <a href="/api-reference/react-flow#edgesreconnectable"><code dir="ltr">edgesReconnectable</code></a>
        is set to `true`.
