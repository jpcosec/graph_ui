---
source: https://reactflow.dev/examples/edges/edge-intersection
title: Edge Intersection
---

# Edge Intersection

This example shows how you can detect an intersection between a dragged
node and an edge.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

The default
<a href="/api-reference/types/default-edge-options#interactionwidth"><code dir="ltr">interactionWidth</code></a>
of the edges is set to `75` via the
<a href="/api-reference/react-flow#defaultedgeoptions"><code dir="ltr">defaultEdgeOptions</code></a>.
We set a wider interaction area so that we can easily find the edge and
node intersections.

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

App.tsx

xy-theme.css

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback, useRef } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type OnNodeDrag,
  useReactFlow,
  type Node,
  type Edge,
  type DefaultEdgeOptions,
} from '@xyflow/react';
import './index.css';
 
const defaultEdgeOptions: DefaultEdgeOptions = {
  interactionWidth: 75,
};
 
const initialNodes: Node[] = [
  {
    id: 'a',
    type: 'input',
    position: { x: 200, y: 0 },
    data: { label: 'Node A' },
  },
  {
    id: 'b',
    position: { x: 0, y: 200 },
    data: { label: 'Node B' },
  },
  { id: 'c', position: { x: 0, y: 0 }, data: { label: 'Node C' } },
];
const initialEdges: Edge[] = [{ id: 'a->b', source: 'a', target: 'b' }];
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );
 
  const { updateEdge, getEdge, addEdges } = useReactFlow();
 
  const overlappedEdgeRef = useRef<string | null>(null);
 
  const onNodeDragStop: OnNodeDrag = useCallback(
    (event, node) => {
      const edgeId = overlappedEdgeRef.current;
      if (!edgeId) return;
      const edge = getEdge(edgeId);
      if (!edge) return;
 
      updateEdge(edgeId, { source: edge.source, target: node.id, style: {} });
 
      addEdges({
        id: `${node.id}->${edge.target}`,
        source: node.id,
        target: edge.target,
      });
 
      overlappedEdgeRef.current = null;
    },
    [getEdge, addEdges, updateEdge],
  );
 
  const onNodeDrag: OnNodeDrag = useCallback(
    (e, node) => {
      const nodeDiv = document.querySelector(`.react-flow__node[data-id=${node.id}]`);
 
      if (!nodeDiv) return;
 
      const rect = nodeDiv.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
 
      const edgeFound = document
        .elementsFromPoint(centerX, centerY)
        .find((el) =>
          el.classList.contains('react-flow__edge-interaction'),
        )?.parentElement;
 
      const edgeId = edgeFound?.dataset.id;
 
      if (edgeId) updateEdge(edgeId, { style: { stroke: 'black' } });
      else if (overlappedEdgeRef.current)
        updateEdge(overlappedEdgeRef.current, { style: {} });
 
      overlappedEdgeRef.current = edgeId || null;
    },
    [updateEdge],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      onNodeDrag={onNodeDrag}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      colorMode="system"
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_lkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
