---
source: https://reactflow.dev/examples/nodes/update-node
title: Updating Nodes
---

# Updating Nodes

You can update properties of nodes and edges freely as long as you pass
a newly created `nodes` or `edges` array to `ReactFlow`.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

You have to create a new `data` object on a node to notify React Flow
about data changes.

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
import { useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Panel,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  { id: '1', data: { label: '-' }, position: { x: 100, y: 100 } },
  { id: '2', data: { label: 'Node 2' }, position: { x: 100, y: 200 } },
];
 
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
 
const UpdateNode = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const [nodeName, setNodeName] = useState('Node 1');
  const [nodeBg, setNodeBg] = useState('#ff0071');
  const [nodeHidden, setNodeHidden] = useState(false);
 
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new node object
          // in order to notify react flow about the change
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeName,
            },
          };
        }
 
        return node;
      }),
    );
  }, [nodeName, setNodes]);
 
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new node object
          // in order to notify react flow about the change
          return {
            ...node,
            style: {
              ...node.style,
              backgroundColor: nodeBg,
            },
          };
        }
 
        return node;
      }),
    );
  }, [nodeBg, setNodes]);
 
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          // it's important that you create a new node object
          // in order to notify react flow about the change
          return {
            ...node,
            hidden: nodeHidden,
          };
        }
 
        return node;
      }),
    );
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === 'e1-2') {
          return {
            ...edge,
            hidden: nodeHidden,
          };
        }
 
        return edge;
      }),
    );
  }, [nodeHidden, setNodes, setEdges]);
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      defaultViewport={defaultViewport}
      minZoom={0.2}
      maxZoom={4}
      attributionPosition="bottom-left"
      fitView
      fitViewOptions={{ padding: 0.5 }}
      colorMode="system"
    >
      <Panel position="top-left" style={{ width: 200 }}>
        <label className="xy-theme__label">Label: </label>
        <input
          value={nodeName}
          onChange={(evt) => setNodeName(evt.target.value)}
          className="xy-theme__input"
        />
 
        <label className="xy-theme__label">Background: </label>
        <input
          value={nodeBg}
          onChange={(evt) => setNodeBg(evt.target.value)}
          className="xy-theme__input"
        />
 
        <label className="xy-theme__label">Hidden:</label>
        <input
          type="checkbox"
          checked={nodeHidden}
          onChange={(evt) => setNodeHidden(evt.target.checked)}
          className="xy-theme__checkbox"
        />
      </Panel>
      <Background />
    </ReactFlow>
  );
};
 
export default UpdateNode;
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

</div>

</div>

</div>

</div>
