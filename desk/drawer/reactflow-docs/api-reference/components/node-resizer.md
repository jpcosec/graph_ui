---
source: https://reactflow.dev/api-reference/components/node-resizer
title: The NodeResizer component
---

# <NodeResizer />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeResizer/NodeResizer.tsx">Source on GitHub </a>

The `<NodeResizer />` component can be used to add a resize
functionality to your nodes. It renders draggable controls around the
node to resize in all directions.

```tsx
import { memo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
 
const ResizableNode = ({ data }) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={30} />
      <Handle type="target" position={Position.Left} />
      <div style={{ padding: 10 }}>{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};
 
export default memo(ResizableNode);
```

</div>

## Props

For TypeScript users, the props type for the `<NodeResizer />` component
is exported as `NodeResizerProps`.

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Default</th>
</tr>
</thead>
<tbody>
<tr id="nodeid">
<td><code dir="ltr">nodeId</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Id of the node it is resizing.</p>
</div></td>
<td></td>
</tr>
<tr id="color">
<td><code dir="ltr">color</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Color of the resize handle.</p>
</div></td>
<td></td>
</tr>
<tr id="handleclassname">
<td><code dir="ltr">handleClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Class name applied to handle.</p>
</div></td>
<td></td>
</tr>
<tr id="handlestyle">
<td><code dir="ltr">handleStyle</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Style applied to handle.</p>
</div></td>
<td></td>
</tr>
<tr id="lineclassname">
<td><code dir="ltr">lineClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Class name applied to line.</p>
</div></td>
<td></td>
</tr>
<tr id="linestyle">
<td><code dir="ltr">lineStyle</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Style applied to line.</p>
</div></td>
<td></td>
</tr>
<tr id="isvisible">
<td><code dir="ltr">isVisible</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Are the controls visible.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="minwidth">
<td><code dir="ltr">minWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum width of node.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="minheight">
<td><code dir="ltr">minHeight</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum height of node.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="maxwidth">
<td><code dir="ltr">maxWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum width of node.</p>
</div></td>
<td><code dir="ltr">Number.MAX_VALUE</code></td>
</tr>
<tr id="maxheight">
<td><code dir="ltr">maxHeight</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum height of node.</p>
</div></td>
<td><code dir="ltr">Number.MAX_VALUE</code></td>
</tr>
<tr id="keepaspectratio">
<td><code dir="ltr">keepAspectRatio</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Keep aspect ratio when resizing.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="autoscale">
<td><code dir="ltr">autoScale</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Scale the controls with the zoom level.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="shouldresize">
<td><code dir="ltr">shouldResize</code></td>
<td><code dir="ltr">(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean</code>
<div>
<p>Callback to determine if node should resize.</p>
</div></td>
<td></td>
</tr>
<tr id="onresizestart">
<td><code dir="ltr">onResizeStart</code></td>
<td><code dir="ltr">OnResizeStart</code>
<div>
<p>Callback called when resizing starts.</p>
</div></td>
<td></td>
</tr>
<tr id="onresize">
<td><code dir="ltr">onResize</code></td>
<td><code dir="ltr">OnResize</code>
<div>
<p>Callback called when resizing.</p>
</div></td>
<td></td>
</tr>
<tr id="onresizeend">
<td><code dir="ltr">onResizeEnd</code></td>
<td><code dir="ltr">OnResizeEnd</code>
<div>
<p>Callback called when resizing ends.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

## Examples

Head over to the
<a href="/examples/nodes/node-resizer">example page</a>
to see how this is done.

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

CustomResizerNode.jsx

ResizableNode.jsx

ResizableNodeSelected.jsx

xy-theme.css

index.css

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_kst5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
} from '@xyflow/react';
import './index.css';
 
import ResizableNode from './ResizableNode';
import ResizableNodeSelected from './ResizableNodeSelected';
import CustomResizerNode from './CustomResizerNode';
 
 
const nodeTypes = {
  ResizableNode,
  ResizableNodeSelected,
  CustomResizerNode,
};
 
const initialNodes = [
  {
    id: '1',
    type: 'ResizableNode',
    data: { label: 'NodeResizer' },
    position: { x: 0, y: 50 },
  },
  {
    id: '2',
    type: 'ResizableNodeSelected',
    data: { label: 'NodeResizer when selected' },
    position: { x: -100, y: 150 },
  },
  {
    id: '3',
    type: 'CustomResizerNode',
    data: { label: 'Custom Resize Icon' },
    position: { x: 150, y: 150 },
    style: {
      height: 100,
    },
  },
];
 
const initialEdges = [];
 
export default function NodeToolbarExample() {
  return (
    <ReactFlow
      defaultNodes={initialNodes}
      defaultEdges={initialEdges}
      minZoom={0.2}
      maxZoom={4}
      fitView
      nodeTypes={nodeTypes}
      fitViewOptions={{ padding: 0.5 }}
      colorMode="system"
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_kst5fiv5tlqlb_-content-CustomResizerNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-CustomResizerNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_kst5fiv5tlqlb_-content-ResizableNode.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-ResizableNode.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_kst5fiv5tlqlb_-content-ResizableNodeSelected.jsx"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-ResizableNodeSelected.jsx"
hidden="" tabindex="0">

</div>

<div id="radix-_R_kst5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-xy-theme.css" hidden=""
tabindex="0">

</div>

<div id="radix-_R_kst5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_kst5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

### Custom Resize Controls

To build custom resize controls, you can use the
<a href="/api-reference/components/node-resize-control">NodeResizeControl</a>
component and customize it.

## Notes

-   Take a look at the docs for the
    <a href="/api-reference/types/node-props"><code dir="ltr">NodeProps</code></a>
    type or the guide on
    <a href="/learn/customization/custom-nodes">custom nodes</a>
    to see how to implement your own nodes.
