---
source: https://reactflow.dev/ui/components/data-edge
title: Data Edge
---

# Data Edge

An edge that displays one field from the source node’s `data` object.

<div>

<div>

<div hidden="">

</div>

<div>

<span data-slot="select-value"
style="pointer-events:none"></span>

</div>

<div>

<div testid="rf__wrapper"
style="width:100%;height:100%;overflow:hidden;position:relative;z-index:0"
role="application">

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

<div
style="transform:translate(0px,0px) scale(1)">

<div>

</div>

<div>

</div>

<div
style="position:absolute;width:100%;height:100%;top:0;left:0">

</div>

<div>

</div>

</div>

</div>

</div>

<div
message="Please only hide this attribution when you are subscribed to React Flow Pro: https://reactflow.dev?utm_source=attribution">

[React Flow](https://reactflow.dev?utm_source=attribution)

</div>

<div id="react-flow__node-desc-1" style="display:none">

Press enter or space to select a node. You can then use the arrow keys
to move the node around. Press delete to remove it and escape to cancel.

</div>

<div id="react-flow__edge-desc-1" style="display:none">

Press enter or space to select an edge. You can then press delete to
remove it or escape to cancel.

</div>

<div id="react-flow__aria-live-1" aria-live="assertive"
aria-atomic="true"
style="position:absolute;width:1px;height:1px;margin:-1px;border:0;padding:0;overflow:hidden;clip:rect(0px, 0px, 0px, 0px);clip-path:inset(100%)">

</div>

</div>

</div>

</div>

<div>

<div>

Dependencies:

</div>

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a>

</div>

<div>

## Installation

<div dir="ltr" orientation="horizontal">

<div role="tablist"
aria-orientation="horizontal" tabindex="-1" orientation="horizontal"
style="outline:none">

CLI

Manual

</div>

<div id="radix-_R_2dct5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2dct5fiv5tlqlb_-trigger-shadcn" tabindex="0"
style="animation-duration:0s">

Make sure to follow the
<a href="/components#prerequisites">prerequisites</a>
before installing the component.

<div
class="nextra-scrollbar x:overflow-x-auto x:overscroll-x-contain x:overflow-y-hidden x:mt-4 x:flex x:w-full x:gap-2 x:border-b x:border-gray-200 x:pb-px x:dark:border-neutral-800 x:focus-visible:nextra-focus"
role="tablist" aria-orientation="horizontal">

npm

pnpm

yarn

bun

</div>

<div>

<div id="headlessui-tabs-panel-_R_3amdct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/data-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_5amdct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/data-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_7amdct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/data-edge
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_9amdct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/data-edge
```

</div>

</div>

</div>

</div>

<div id="radix-_R_2dct5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_2dct5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

## 1. Copy the component into your app

```tsx
import { Handle, NodeProps, Position, useReactFlow, Node } from "@xyflow/react";
 
import { memo } from "react";
import { BaseNode, BaseNodeContent } from "@/components/base-node";
import { Slider } from "@/components/ui/slider";
 
export type CounterNodeType = Node<{ value: number }>;
 
export const CounterNode = memo(({ id, data }: NodeProps<CounterNodeType>) => {
  const { updateNodeData } = useReactFlow();
 
  return (
    <BaseNode>
      <BaseNodeContent className="p-5">
        <Slider
          value={[data.value]}
          min={0}
          max={100}
          step={1}
          className="nopan nodrag w-24"
          onValueChange={([value]) => {
            updateNodeData(id, (node) => ({
              ...node.data,
              value,
            }));
          }}
        />
        <Handle type="source" position={Position.Bottom} />
      </BaseNodeContent>
    </BaseNode>
  );
});
 
CounterNode.displayName = "CounterNode";
```

</div>

</div>

## 2. Connect the component with your React Flow application.

```tsx
import { Background, ReactFlow } from "@xyflow/react";
 
import { CounterNode, type CounterNodeType } from "./component-example";
import { DataEdge } from "@/registry/components/data-edge/";
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 100, y: 100 },
    type: "counterNode",
    data: { value: 10 },
  },
  {
    id: "2",
    position: { x: 300, y: 300 },
    data: { label: "Output" },
  },
];
 
const nodeTypes = {
  counterNode: CounterNode,
};
 
const defaultEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    type: "dataEdge",
    data: { key: "value" },
  } satisfies DataEdge<CounterNodeType>,
];
 
const edgeTypes = {
  dataEdge: DataEdge,
};
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        nodeTypes={nodeTypes}
        defaultEdges={defaultEdges}
        edgeTypes={edgeTypes}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
```

</div>

</div>

## Additional type safety

When creating new edges of this type, you can use TypeScript’s
`satisfies` predicate along with the specific type of a node in your
application to ensure the `key` property of the edge’s data is a valid
key of the node’s data.

```tsx
type CounterNode = Node<{ count: number }>;
 
const initialEdges = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'dataEdge',
    data: {
      key: 'count',
    } satisfies DataEdge<CounterNode>,
  },
];
```

</div>

If you try to use a key that is not present in the node’s data,
TypeScript will show an error message like:

> ts: Type ‘“value”’ is not assignable to type ‘“count”’.
