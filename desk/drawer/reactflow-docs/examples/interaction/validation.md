---
source: https://reactflow.dev/examples/interaction/validation
title: Validation
---

# Validation

Custom nodes need to have at least one
<a href="/api-reference/components/handle"><code dir="ltr">Handle</code> component</a>
to be connectable. You can pass a validation function
<a href="/api-reference/react-flow#isvalidconnection"><code dir="ltr">isValidConnection</code></a>
to the ReactFlow component in order to check if a new connection is
valid and should be added.

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
  Handle,
  Position,
  Background,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  { id: '0', type: 'custominput', position: { x: 0, y: 150 } },
  { id: 'A', type: 'customnode', position: { x: 250, y: 0 } },
  { id: 'B', type: 'customnode', position: { x: 250, y: 150 } },
  { id: 'C', type: 'customnode', position: { x: 250, y: 300 } },
];
 
const isValidConnection = (connection) => connection.target === 'B';
const onConnectStart = (_, { nodeId, handleType }) =>
  console.log('on connect start', { nodeId, handleType });
const onConnectEnd = (event) => console.log('on connect end', event);
 
const CustomInput = () => (
  <>
    <div>Only connectable with B</div>
    <Handle type="source" position={Position.Right} />
  </>
);
 
const CustomNode = ({ id }) => (
  <>
    <Handle type="target" position={Position.Left} />
    <div>{id}</div>
    <Handle type="source" position={Position.Right} />
  </>
);
 
const nodeTypes = {
  custominput: CustomInput,
  customnode: CustomNode,
};
 
const ValidationFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
 
  const onConnect = useCallback((params) => setEdges((els) => addEdge(params, els)), []);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={isValidConnection}
      selectNodesOnDrag={false}
      className="validationflow"
      nodeTypes={nodeTypes}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      fitView
      attributionPosition="bottom-left"
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
};
 
export default ValidationFlow;
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
