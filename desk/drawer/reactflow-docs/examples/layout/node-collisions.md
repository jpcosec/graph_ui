---
source: https://reactflow.dev/examples/layout/node-collisions
title: Node Collisions
---

# Node Collisions

This example demonstrates how to automatically resolve node overlaps.
When nodes are placed too close together or overlap, the algorithm
detects these collisions and moves the nodes apart to maintain visual
clarity.

For a deep dive into collision detection algorithms check out our
<a href="https://xyflow.com/blog/node-collision-detection-algorithms">blog post on node collisions </a>.

We also created a
<a href="https://github.com/xyflow/node-collision-algorithms">benchmark </a>
to compare the performance of different approaches and you can see them
in action in the
<a href="https://xyflow.com/node-collisions">playground </a>.

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

nodes-and-edges.ts

resolve-collisions.ts

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react';
import './index.css';
 
import { initialEdges, initialNodes } from './nodes-and-edges';
import { resolveCollisions } from './resolve-collisions';
 
function ExampleFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
 
  const onNodeDragStop = useCallback(() => {
    setNodes((nds) =>
      resolveCollisions(nds, {
        maxIterations: Infinity,
        overlapThreshold: 0.5,
        margin: 15,
      }),
    );
  }, [setNodes]);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeDragStop={onNodeDragStop}
      minZoom={0}
      fitView
      colorMode="system"
    >
      <Background />
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
}
 
export default ExampleFlow;
```

</div>

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-nodes-and-edges.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-nodes-and-edges.ts"
hidden="" tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-resolve-collisions.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-resolve-collisions.ts"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
