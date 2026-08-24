---
source: https://reactflow.dev/examples/styling/turbo-flow
title: Turbo Flow
---

# Turbo Flow

Every part of the React Flow UI is customizable. As the name implies the
look is taken from the beautiful
<a href="https://turbo.build/pack/docs/core-concepts#function-level-caching">turbo.build </a>
website. You can find more information about custom styles in the
<a href="/learn/customization/theming">theming guide</a>.
(React Flow uses Turborepo and we love it 💜)

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

FunctionIcon.tsx

TurboEdge.tsx

TurboNode.tsx

index.css

index.tsx

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
} from '@xyflow/react';
import { FiFile } from 'react-icons/fi';
import './index.css';
 
import TurboNode, { type TurboNodeData } from './TurboNode';
import TurboEdge from './TurboEdge';
import FunctionIcon from './FunctionIcon';
 
const initialNodes: Node<TurboNodeData>[] = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { icon: <FunctionIcon />, title: 'readFile', subtitle: 'api.ts' },
    type: 'turbo',
  },
  {
    id: '2',
    position: { x: 250, y: 0 },
    data: { icon: <FunctionIcon />, title: 'bundle', subtitle: 'apiContents' },
    type: 'turbo',
  },
  {
    id: '3',
    position: { x: 0, y: 250 },
    data: { icon: <FunctionIcon />, title: 'readFile', subtitle: 'sdk.ts' },
    type: 'turbo',
  },
  {
    id: '4',
    position: { x: 250, y: 250 },
    data: { icon: <FunctionIcon />, title: 'bundle', subtitle: 'sdkContents' },
    type: 'turbo',
  },
  {
    id: '5',
    position: { x: 500, y: 125 },
    data: { icon: <FunctionIcon />, title: 'concat', subtitle: 'api, sdk' },
    type: 'turbo',
  },
  {
    id: '6',
    position: { x: 750, y: 125 },
    data: { icon: <FiFile />, title: 'fullBundle' },
    type: 'turbo',
  },
];
 
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
  },
];
 
const nodeTypes = {
  turbo: TurboNode,
};
 
const edgeTypes = {
  turbo: TurboEdge,
};
 
const defaultEdgeOptions = {
  type: 'turbo',
  markerEnd: 'edge-circle',
};
 
const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      colorMode="system"
    >
      <Controls showInteractive={false} />
      <svg>
        <defs>
          <linearGradient id="edge-gradient">
            <stop offset="0%" stopColor="#ae53ba" />
            <stop offset="100%" stopColor="#2a8af6" />
          </linearGradient>
 
          <marker
            id="edge-circle"
            viewBox="-5 -5 10 10"
            refX="0"
            refY="0"
            markerUnits="strokeWidth"
            markerWidth="10"
            markerHeight="10"
            orient="auto"
          >
            <circle stroke="#2a8af6" strokeOpacity="0.75" r="2" cx="0" cy="0" />
          </marker>
        </defs>
      </svg>
    </ReactFlow>
  );
};
 
export default Flow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-FunctionIcon.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-FunctionIcon.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-TurboEdge.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-TurboEdge.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-TurboNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-TurboNode.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
