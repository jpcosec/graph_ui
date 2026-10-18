---
source: https://reactflow.dev/ui/components/database-schema-node
title: Database Schema Node
---

# Database Schema Node

A node that can be used to visualize a database schema.

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

<a href="https://www.npmjs.com/package/@xyflow/react">@xyflow/react</a><a href="https://ui.shadcn.com/docs/components/table">shadcn/ui/table</a><a href="/ui/components/base-node">BaseNode</a><a href="/ui/components/labeled-handle">LabeledHandle</a>

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

<div id="radix-_R_17ct5fiv5tlqlb_-content-shadcn" state="active"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_17ct5fiv5tlqlb_-trigger-shadcn" tabindex="0"
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

<div id="headlessui-tabs-panel-_R_1lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="0"
headlessui-state="selected" data-selected="">

```tsx
npx shadcn@latest add https://ui.reactflow.dev/database-schema-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_2lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
pnpm dlx shadcn@latest add https://ui.reactflow.dev/database-schema-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_3lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
yarn dlx shadcn@latest add https://ui.reactflow.dev/database-schema-node
```

</div>

</div>

<div id="headlessui-tabs-panel-_R_4lb7ct5fiv5tlqlb_"
class="x:rounded x:mt-[1.25em]" role="tabpanel" tabindex="-1" hidden=""
style="display:none" headlessui-state="">

```tsx
bun x shadcn@latest add https://ui.reactflow.dev/database-schema-node
```

</div>

</div>

</div>

</div>

<div id="radix-_R_17ct5fiv5tlqlb_-content-manual" state="inactive"
orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_17ct5fiv5tlqlb_-trigger-manual" hidden=""
tabindex="0">

</div>

</div>

</div>

<div>

## Usage

## 1. Copy the component into your app

```tsx
import { memo } from "react";
import { Position } from "@xyflow/react";
import { LabeledHandle } from "@/components/labeled-handle";
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/database-schema-node";
 
export type DatabaseSchemaNodeData = {
  data: {
    label: string;
    schema: { title: string; type: string }[];
  };
};
 
const DatabaseSchemaDemo = memo(({ data }: DatabaseSchemaNodeData) => {
  return (
    <DatabaseSchemaNode className="p-0">
      <DatabaseSchemaNodeHeader>{data.label}</DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {data.schema.map((entry) => (
          <DatabaseSchemaTableRow key={entry.title}>
            <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
              <LabeledHandle
                id={entry.title}
                title={entry.title}
                type="target"
                position={Position.Left}
              />
            </DatabaseSchemaTableCell>
            <DatabaseSchemaTableCell className="pr-0 font-thin">
              <LabeledHandle
                id={entry.title}
                title={entry.type}
                type="source"
                position={Position.Right}
                className="p-0"
                handleClassName="p-0"
                labelClassName="p-0 w-full pr-3 text-right"
              />
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>
        ))}
      </DatabaseSchemaNodeBody>
    </DatabaseSchemaNode>
  );
});
 
DatabaseSchemaDemo.displayName = "DatabaseSchemaDemo";
 
export default DatabaseSchemaDemo;
```

</div>

</div>

## 2. Connect the component with your React Flow application.

```tsx
import { Background, Edge, ReactFlow } from "@xyflow/react";
import DatabaseSchemaDemo from "./component-example";
 
const nodeTypes = {
  databaseSchema: DatabaseSchemaDemo,
};
 
const defaultNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "databaseSchema",
    data: {
      label: "Products",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "warehouse_id", type: "uuid" },
        { title: "supplier_id", type: "uuid" },
        { title: "price", type: "money" },
        { title: "quantity", type: "int4" },
      ],
    },
  },
  {
    id: "2",
    position: { x: 350, y: -100 },
    type: "databaseSchema",
    data: {
      label: "Warehouses",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "address", type: "varchar" },
        { title: "capacity", type: "int4" },
      ],
    },
  },
  {
    id: "3",
    position: { x: 350, y: 200 },
    type: "databaseSchema",
    data: {
      label: "Suppliers",
      schema: [
        { title: "id", type: "uuid" },
        { title: "name", type: "varchar" },
        { title: "description", type: "varchar" },
        { title: "country", type: "varchar" },
      ],
    },
  },
];
 
const defaultEdges: Edge[] = [
  {
    id: "products-warehouses",
    source: "1",
    target: "2",
    sourceHandle: "warehouse_id",
    targetHandle: "id",
  },
  {
    id: "products-suppliers",
    source: "1",
    target: "3",
    sourceHandle: "supplier_id",
    targetHandle: "id",
  },
];
 
export default function App() {
  return (
    <div className="h-full w-full">
      <ReactFlow
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        nodeTypes={nodeTypes}
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
