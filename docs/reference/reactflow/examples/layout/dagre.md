---
source: https://reactflow.dev/examples/layout/dagre
title: Dagre Tree
---

# Dagre Tree

This example shows how you can integrate
<a href="https://github.com/dagrejs/dagre">dagre.js </a>
with React Flow to create simple tree layouts. Good alternatives to
dagre are
<a href="https://github.com/d3/d3-hierarchy">d3-hierarchy </a>
or
<a href="https://github.com/kieler/elkjs">elkjs </a>
if you are looking for a more advanced layouting library.

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

initialElements.ts

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-App.tsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-App.tsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  Background,
  ReactFlow,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import './index.css';
 
import { initialNodes, initialEdges } from './initialElements';
 
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
 
const nodeWidth = 172;
const nodeHeight = 36;
 
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });
 
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
 
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
 
  dagre.layout(dagreGraph);
 
  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
 
    return newNode;
  });
 
  return { nodes: newNodes, edges };
};
 
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges,
);
 
const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
 
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds),
      ),
    [],
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction,
      );
 
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      colorMode="system"
    >
      <Panel position="top-right">
        <button className="xy-theme__button" onClick={() => onLayout('TB')}>
          vertical layout
        </button>
        <button className="xy-theme__button" onClick={() => onLayout('LR')}>
          horizontal layout
        </button>
      </Panel>
      <Background />
    </ReactFlow>
  );
};
 
export function App() {
  return <Flow />;
}
```

</div>

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-index.tsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-index.tsx" hidden=""
tabindex="0">

</div>

<div id="radix-_R_jkt5fiv5tlqlb_-content-initialElements.ts"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_jkt5fiv5tlqlb_-trigger-initialElements.ts"
hidden="" tabindex="0">

</div>

</div>

</div>

</div>

</div>

This example is a demonstration of *static* layouting. If the nodes or
edges in the graph change, the layout *won’t* recalculate! It is
possible to do dynamic layouting with dagre (and other libraries),
though: see the
<a href="/examples/layout/auto-layout">auto layout</a>
pro example for an example of this.
