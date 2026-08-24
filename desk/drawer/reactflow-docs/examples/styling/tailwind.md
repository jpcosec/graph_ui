---
source: https://reactflow.dev/examples/styling/tailwind
title: Tailwind
---

# Tailwind

In this example we are using
<a href="https://tailwindcss.com/">Tailwind </a>
for styling the flow.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-yellow-50 x:dark:bg-yellow-700/30 x:text-yellow-700 x:dark:text-yellow-500 x:border-yellow-700">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

Import the React Flow stylesheet into the base layer so that Tailwind
can override the default styles.

</div>

</div>

<div
class="x:px-4 x:text-xs x:text-gray-700 x:dark:text-gray-200 x:bg-gray-100 x:dark:bg-neutral-900 x:flex x:items-center x:h-12 x:gap-2 x:rounded-t-md x:border x:border-gray-300 x:dark:border-neutral-700 x:contrast-more:border-gray-900 x:contrast-more:dark:border-gray-50 x:border-b-0">

<span
class="x:truncate">index.css</span>

</div>

```tsx
@import '@xyflow/react/dist/style.css' layer(base);
@import 'tailwindcss';
```

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

CustomNode.jsx

index.css

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
  addEdge,
  MiniMap,
  Controls,
} from '@xyflow/react';
import './index.css';
 
import CustomNode from './CustomNode';
 
const nodeTypes = {
  custom: CustomNode,
};
 
const initNodes = [
  {
    id: '1',
    type: 'custom',
    data: { name: 'Jane Doe', job: 'CEO', emoji: '😎' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'custom',
    data: { name: 'Tyler Weary', job: 'Designer', emoji: '🤓' },
 
    position: { x: -200, y: 200 },
  },
  {
    id: '3',
    type: 'custom',
    data: { name: 'Kristi Price', job: 'Developer', emoji: '🤩' },
    position: { x: 200, y: 200 },
  },
];
 
const initEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
];
 
const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
 
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      className="bg-teal-50 dark:bg-gray-900"
      colorMode="system"
    >
      <MiniMap />
      <Controls />
    </ReactFlow>
  );
};
 
export default Flow;
```

</div>

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-CustomNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-CustomNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_nkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_nkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>
