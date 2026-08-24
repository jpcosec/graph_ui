---
source: https://reactflow.dev/examples/nodes/node-toolbar
title: Node Toolbar
---

# Node Toolbar

For many types of applications, having a toolbar or set of controls
appear when a node is selected can be quite useful. It’s so useful, in
fact, that we’ve built the
<a href="/api-reference/components/node-toolbar"><code dir="ltr"><NodeToolbar /></code></a>
component to make it easy to add this functionality to your custom
nodes!

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

Content in the toolbar is not scaled as you zoom your flow in and out:
this means it should always be visible.

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

<div id="radix-_R_lkt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_lkt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  Panel,
  NodeToolbar,
  Position,
  useNodesState,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    type: 'node-with-toolbar',
    data: { label: 'Select me to show the toolbar' },
  },
];
 
const nodeTypes = {
  'node-with-toolbar': NodeWithToolbar,
};
 
function NodeWithToolbar({ data }) {
  return (
    <>
      <NodeToolbar
        isVisible={data.forceToolbarVisible || undefined}
        position={data.toolbarPosition}
        align={data.align}
      >
        <button className="xy-theme__button">cut</button>
        <button className="xy-theme__button">copy</button>
        <button className="xy-theme__button">paste</button>
      </NodeToolbar>
      <div>{data?.label}</div>
    </>
  );
}
 
function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const setPosition = useCallback(
    (pos) =>
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: { ...node.data, toolbarPosition: pos },
        })),
      ),
    [setNodes],
  );
  const setAlignment = useCallback(
    (align) =>
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: { ...node.data, align },
        })),
      ),
    [setNodes],
  );
  const forceToolbarVisible = useCallback((enabled) =>
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, forceToolbarVisible: enabled },
      })),
    ),
  );
 
  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        preventScrolling={false}
        colorMode="system"
      >
        <Panel
          style={{
            color: 'var(--xy-node-color, var(--xy-node-color-default))',
          }}
        >
          <h3>Node Toolbar position:</h3>
          <button className="xy-theme__button" onClick={() => setPosition(Position.Top)}>
            top
          </button>
          <button
            className="xy-theme__button"
            onClick={() => setPosition(Position.Right)}
          >
            right
          </button>
          <button
            className="xy-theme__button"
            onClick={() => setPosition(Position.Bottom)}
          >
            bottom
          </button>
          <button className="xy-theme__button" onClick={() => setPosition(Position.Left)}>
            left
          </button>
          <h3>Node Toolbar Alignment:</h3>
          <button className="xy-theme__button" onClick={() => setAlignment('start')}>
            start
          </button>
          <button className="xy-theme__button" onClick={() => setAlignment('center')}>
            center
          </button>
          <button className="xy-theme__button" onClick={() => setAlignment('end')}>
            end
          </button>
          <h3>Override Node Toolbar visibility</h3>
          <label>
            <input
              type="checkbox"
              onChange={(e) => forceToolbarVisible(e.target.checked)}
              className="xy-theme__checkbox"
            />
            <span>Always show toolbar</span>
          </label>
        </Panel>
        <Background />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
 
export default Flow;
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

</div>

</div>

</div>

</div>

For more information on the `<NodeToolbar />` component and its props,
check out the
<a href="/api-reference/components/node-toolbar">API reference</a>.
