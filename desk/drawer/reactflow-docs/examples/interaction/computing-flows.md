---
source: https://reactflow.dev/examples/interaction/computing-flows
title: Computing Flows
---

# Computing Flows

This example shows how to use the computing flow helpers `useNodesData`,
`useNodeConnections` and `updateNode`. You can find more detailed
information about this in the
<a href="/learn/advanced-use/computing-flows">Computing Flows Guide</a>.

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

ResultNode.tsx

TextNode.tsx

UppercaseNode.tsx

xy-theme.css

index.css

index.tsx

initialElements.ts

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
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  type Edge,
  type OnConnect,
} from '@xyflow/react';
import './index.css';
 
import TextNode from './TextNode';
import ResultNode from './ResultNode';
import UppercaseNode from './UppercaseNode';
import { type MyNode } from './initialElements';
 
const nodeTypes = {
  text: TextNode,
  result: ResultNode,
  uppercase: UppercaseNode,
};
 
const initNodes: MyNode[] = [
  {
    id: '1',
    type: 'text',
    data: {
      text: 'hello',
    },
    position: { x: -100, y: -50 },
  },
  {
    id: '2',
    type: 'text',
    data: {
      text: 'world',
    },
    position: { x: 0, y: 100 },
  },
  {
    id: '3',
    type: 'uppercase',
    data: { text: '' },
    position: { x: 100, y: -100 },
  },
  {
    id: '4',
    type: 'result',
    data: {},
    position: { x: 300, y: -75 },
  },
];
 
const initEdges: Edge[] = [
  {
    id: 'e1-3',
    source: '1',
    target: '3',
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
  },
];
 
const CustomNodeFlow = () => {
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);
 
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      colorMode="system"
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
};
 
export default CustomNodeFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ResultNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ResultNode.tsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-TextNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-TextNode.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-UppercaseNode.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-UppercaseNode.tsx"
hidden="" tabindex="0">

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

<div id="radix-_R_bkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-initialElements.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-initialElements.ts"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>
