---
source: https://reactflow.dev/examples/nodes/delete-middle-node
title: Delete Middle Node
---

# Delete Middle Node

This example shows you how to recover deleted edges when you remove a
node from the middle of a chain. In other words, if we have three nodes
connected in sequence - `a->b->c` - and we deleted the middle node `b`,
this example shows you how to end up with the graph `a->c`.

To achieve this, we need to make use of a few bits:

-   The
    <a href="/api-reference/react-flow#onnodesdelete"><code dir="ltr">onNodesDelete</code></a>
    callback lets us know when a node is deleted.
-   <a href="/api-reference/utils/get-connected-edges"><code dir="ltr">getConnectedEdges</code></a>
    gives us all the edges connected to a node, either as source or
    target.
-   <a href="/api-reference/utils/get-incomers"><code dir="ltr">getIncomers</code></a>
    and
    <a href="/api-reference/utils/get-outgoers"><code dir="ltr">getOutgoers</code></a>
    give us the nodes connected to a node as source or target.

All together, this allows us to take all the nodes connected to the
deleted node, and reconnect them to any nodes the deleted node was
connected to.

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

<div id="radix-_R_29kt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_29kt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from '@xyflow/react';
import './index.css';
 
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start here...' },
    position: { x: -150, y: 0 },
  },
  {
    id: '2',
    type: 'input',
    data: { label: '...or here!' },
    position: { x: 150, y: 0 },
  },
  { id: '3', data: { label: 'Delete me.' }, position: { x: 0, y: 100 } },
  { id: '4', data: { label: 'Then me!' }, position: { x: 0, y: 200 } },
  {
    id: '5',
    type: 'output',
    data: { label: 'End here!' },
    position: { x: 0, y: 300 },
  },
];
 
const initialEdges = [
  { id: '1->3', source: '1', target: '3' },
  { id: '2->3', source: '2', target: '3' },
  { id: '3->4', source: '3', target: '4' },
  { id: '4->5', source: '4', target: '5' },
];
 
export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 
  const onConnect = useCallback((params) => setEdges(addEdge(params, edges)), [edges]);
 
  const onNodesDelete = useCallback(
    (deleted) => {
      let remainingNodes = [...nodes];
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, remainingNodes, acc);
          const outgoers = getOutgoers(node, remainingNodes, acc);
          const connectedEdges = getConnectedEdges([node], acc);
 
          const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
 
          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );
 
          remainingNodes = remainingNodes.filter((rn) => rn.id !== node.id);
 
          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );
 
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onNodesDelete={onNodesDelete}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      attributionPosition="top-right"
      colorMode="system"
    >
      <Background />
    </ReactFlow>
  );
}
```

</div>

</div>

<div id="radix-_R_29kt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_29kt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_29kt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_29kt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

Although this example is less than 20 lines of code there’s quite a lot
to digest. Let’s break some of it down:

-   Our `onNodesDelete` callback is called with one argument -
    `deleted` - that is an array of every node that was just deleted. If
    you select an individual node and press the delete key, `deleted`
    will contain just that node, but if you make a selection *all* the
    nodes in that selection will be in `deleted`.

-   We create a new array of edges - `remainingEdges` - that contains
    all the edges in the flow that have nothing to do with the node(s)
    we just deleted.

-   We create another array of edges by *flatMapping* over the array of
    `incomers`. These are nodes that were connected to the deleted node
    as a source. For each of these nodes, we create a new edge that
    connects to each node in the array of `outgoers`. These are nodes
    that were connected to the deleted node as a target.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

For brevity, we’re using object destructuring while at the same time
renaming the variable bound (e.g. `({ id: source }) => ...)`
destructures the `id` property of the object and binds it to a new
variable called `source`) but you don’t need to do this

</div>

</div>

## Quick Reference

<div
style="--rows:2">

<a href="/api-reference/utils/get-connected-edges"><span title="getConnectedEdges"><span>getConnectedEdges</span></span></a><a href="/api-reference/utils/get-incomers"><span title="getIncomers"><span>getIncomers</span></span></a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap"><span title="Array.prototype.flatMap"><span>Array.prototype.flatMap</span></span></a><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#assigning_to_new_variable_names"><span title="Destructuring assignment"><span>Destructuring assignment</span></span></a>

</div>
