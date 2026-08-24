---
source: https://reactflow.dev/examples/nodes/custom-node
title: Custom Nodes
---

# Custom Nodes

Creating custom nodes is as easy as building a regular React component
and passing it to `nodeTypes`. Since they’re standard React components,
you can display any content and implement any functionality you need.
Plus, you’ll have access to a range of props that allow you to extend
and customize the default node behavior. For more details, check out our
<a href="/learn/customization/custom-nodes">Custom Nodes guide</a>.

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

ColorSelectorNode.jsx

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
import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  MiniMap,
  Controls,
  Panel,
} from '@xyflow/react';
import './index.css';
 
import ColorSelectorNode from './ColorSelectorNode';
 
const initColor = '#ff0071';
 
const snapGrid = [20, 20];
const nodeTypes = {
  selectorNode: ColorSelectorNode,
};
 
const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
 
const CustomNodeFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedColor, setSelectedColor] = useState(initColor);
 
  useEffect(() => {
    const onChange = (event) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== '2') {
            return node;
          }
 
          const color = event.target.value;
 
          setSelectedColor(color);
 
          return {
            ...node,
            data: {
              ...node.data,
              color,
            },
          };
        }),
      );
    };
 
    setNodes([
      {
        id: '1',
        type: 'input',
        data: { label: 'An input node' },
        position: { x: 0, y: 50 },
        sourcePosition: 'right',
      },
      {
        id: '2',
        type: 'selectorNode',
        data: { onChange: onChange, color: initColor },
        position: { x: 300, y: 50 },
      },
      {
        id: '3',
        type: 'output',
        data: { label: 'Output A' },
        position: { x: 650, y: 25 },
        targetPosition: 'left',
      },
      {
        id: '4',
        type: 'output',
        data: { label: 'Output B' },
        position: { x: 650, y: 100 },
        targetPosition: 'left',
      },
    ]);
 
    setEdges([
      {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
      },
      {
        id: 'e2a-3',
        source: '2',
        target: '3',
        animated: true,
      },
      {
        id: 'e2b-4',
        source: '2',
        target: '4',
        animated: true,
      },
    ]);
  }, []);
 
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [],
  );
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      snapToGrid={true}
      snapGrid={snapGrid}
      defaultViewport={defaultViewport}
      fitView
      attributionPosition="bottom-left"
      colorMode="system"
    >
      <Background />
      <MiniMap />
      <Controls />
      <Panel position="top-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--xy-controls-button-background-color, #fff)',
            border: '1px solid var(--xy-controls-button-border-color, #ddd)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 16,
              height: 16,
              borderRadius: '999px',
              background: selectedColor,
              border: '1px solid rgba(0, 0, 0, 0.2)',
            }}
          />
          <span>
            Selected color:{' '}
            <code style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
              {selectedColor}
            </code>
          </span>
        </div>
      </Panel>
    </ReactFlow>
  );
};
 
export default CustomNodeFlow;
```

</div>

</div>

<div id="radix-_R_bkt5fiv5tlqlb_-content-ColorSelectorNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_bkt5fiv5tlqlb_-trigger-ColorSelectorNode.jsx"
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

</div>

</div>

</div>

</div>
