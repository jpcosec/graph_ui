---
source: https://reactflow.dev/examples/nodes/proximity-connect
title: Proximity Connect
---

# Proximity Connect

This example shows how to automatically create edges when a node is
dropped in close proximity to another one. While dragging, a dotted
connection line is displayed to show which edge will be created if you
drop the node.

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

initialElements.js

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  ReactFlowProvider,
  useStoreApi,
  useReactFlow,
} from '@xyflow/react';
import './index.css';
 
import { initialEdges, initialNodes } from './initialElements';
 
const MIN_DISTANCE = 150;
 
const Flow = () => {
  const store = useStoreApi();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { getInternalNode } = useReactFlow();
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
 
  const getClosestEdge = useCallback((node) => {
    const { nodeLookup } = store.getState();
    const internalNode = getInternalNode(node.id);
 
    const closestNode = Array.from(nodeLookup.values()).reduce(
      (res, n) => {
        if (n.id !== internalNode.id) {
          const dx =
            n.internals.positionAbsolute.x - internalNode.internals.positionAbsolute.x;
          const dy =
            n.internals.positionAbsolute.y - internalNode.internals.positionAbsolute.y;
          const d = Math.sqrt(dx * dx + dy * dy);
 
          if (d < res.distance && d < MIN_DISTANCE) {
            res.distance = d;
            res.node = n;
          }
        }
 
        return res;
      },
      {
        distance: Number.MAX_VALUE,
        node: null,
      },
    );
 
    if (!closestNode.node) {
      return null;
    }
 
    const closeNodeIsSource =
      closestNode.node.internals.positionAbsolute.x <
      internalNode.internals.positionAbsolute.x;
 
    return {
      id: closeNodeIsSource
        ? `${closestNode.node.id}-${node.id}`
        : `${node.id}-${closestNode.node.id}`,
      source: closeNodeIsSource ? closestNode.node.id : node.id,
      target: closeNodeIsSource ? node.id : closestNode.node.id,
    };
  }, []);
 
  const onNodeDrag = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);
 
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');
 
        if (
          closeEdge &&
          !nextEdges.find(
            (ne) => ne.source === closeEdge.source && ne.target === closeEdge.target,
          )
        ) {
          closeEdge.className = 'temp';
          nextEdges.push(closeEdge);
        }
 
        return nextEdges;
      });
    },
    [getClosestEdge, setEdges],
  );
 
  const onNodeDragStop = useCallback(
    (_, node) => {
      const closeEdge = getClosestEdge(node);
 
      setEdges((es) => {
        const nextEdges = es.filter((e) => e.className !== 'temp');
 
        if (
          closeEdge &&
          !nextEdges.find(
            (ne) => ne.source === closeEdge.source && ne.target === closeEdge.target,
          )
        ) {
          nextEdges.push(closeEdge);
        }
 
        return nextEdges;
      });
    },
    [getClosestEdge],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onConnect={onConnect}
      fitView
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default () => (
  <ReactFlowProvider>
    <Flow />
  </ReactFlowProvider>
);
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-initialElements.js"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-initialElements.js"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
