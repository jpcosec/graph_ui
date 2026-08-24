---
source: https://reactflow.dev/examples/edges/edge-types
title: Edge Types
---

# Edge Types

You can choose different kinds of
<a href="/api-reference/react-flow#edgeTypes">edge types</a>
in React Flow: `default` (bezier), `straight`, `step` and `smoothstep`.
As you can see, you can define a type for each edge and mix them in one
graph.

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

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  {
    id: '1',
    data: { label: 'choose' },
    position: {
      x: 0,
      y: 0,
    },
  },
  {
    id: '2',
    data: { label: 'your' },
    position: {
      x: 100,
      y: 100,
    },
  },
  {
    id: '3',
    data: { label: 'desired' },
    position: {
      x: 0,
      y: 200,
    },
  },
  {
    id: '4',
    data: { label: 'edge' },
    position: {
      x: 100,
      y: 300,
    },
  },
  {
    id: '5',
    data: { label: 'type' },
    position: {
      x: 0,
      y: 400,
    },
  },
];
 
const initialEdges = [
  {
    id: '1',
    type: 'straight',
    source: '1',
    target: '2',
    label: 'straight',
  },
  {
    type: 'step',
    source: '2',
    target: '3',
    id: '2',
    label: 'step',
  },
  {
    type: 'smoothstep',
    source: '3',
    target: '4',
    id: '3',
    label: 'smoothstep',
  },
  {
    type: 'default',
    source: '4',
    target: '5',
    id: '4',
    label: 'bezier',
  },
];
 
const EdgeTypesFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      minZoom={0.2}
      colorMode="system"
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};
 
export default EdgeTypesFlow;
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

</div>

</div>

</div>

</div>
