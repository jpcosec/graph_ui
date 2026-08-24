---
source: https://reactflow.dev/api-reference/types/node-props
title: NodeProps
---

# NodeProps<T>

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L89">Source on GitHub </a>

When you implement a
<a href="/learn/customization/custom-nodes">custom node</a>
it is wrapped in a component that enables basic functionality like
selection and dragging.

## Usage

```tsx
import { useState } from 'react';
import { NodeProps, Node } from '@xyflow/react';
 
export type CounterNode = Node<
  {
    initialCount?: number;
  },
  'counter'
>;
 
export default function CounterNode(props: NodeProps<CounterNode>) {
  const [count, setCount] = useState(props.data?.initialCount ?? 0);
 
  return (
    <div>
      <p>Count: {count}</p>
      <button className="nodrag" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

</div>

Remember to register your custom node by adding it to the
<a href="/api-reference/react-flow#nodetypes"><code dir="ltr">nodeTypes</code></a>
prop of your `<ReactFlow />` component.

```tsx
import { ReactFlow } from '@xyflow/react';
import CounterNode from './CounterNode';
 
const nodeTypes = {
  counterNode: CounterNode,
};
 
export default function App() {
  return <ReactFlow nodeTypes={nodeTypes} ... />
}
```

</div>

You can read more in our
<a href="/learn/customization/custom-nodes">custom node guide</a>.

## Fields

Your custom node receives the following props:

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
<tr id="id">
<td><code dir="ltr">id</code></td>
<td><code dir="ltr">NodeType["id"]</code>
<div>
<p>Unique id of a node.</p>
</div></td>
<td></td>
</tr>
<tr id="data">
<td><code dir="ltr">data</code></td>
<td><code dir="ltr">NodeType["data"]</code>
<div>
<p>Arbitrary data passed to a node.</p>
</div></td>
<td></td>
</tr>
<tr id="width">
<td><code dir="ltr">width</code></td>
<td><code dir="ltr">NodeType["width"]</code></td>
<td></td>
</tr>
<tr id="height">
<td><code dir="ltr">height</code></td>
<td><code dir="ltr">NodeType["height"]</code></td>
<td></td>
</tr>
<tr id="sourceposition">
<td><code dir="ltr">sourcePosition</code></td>
<td><code dir="ltr">NodeType["sourcePosition"]</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls source position.</p>
</div></td>
<td></td>
</tr>
<tr id="targetposition">
<td><code dir="ltr">targetPosition</code></td>
<td><code dir="ltr">NodeType["targetPosition"]</code>
<div>
<p>Only relevant for default, source, target nodeType. Controls target position.</p>
</div></td>
<td></td>
</tr>
<tr id="draghandle">
<td><code dir="ltr">dragHandle</code></td>
<td><code dir="ltr">NodeType["dragHandle"]</code>
<div>
<p>A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements.</p>
</div></td>
<td></td>
</tr>
<tr id="parentid">
<td><code dir="ltr">parentId</code></td>
<td><code dir="ltr">NodeType["parentId"]</code>
<div>
<p>Parent node id, used for creating sub-flows.</p>
</div></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">NodeType["type"]</code>
<div>
<p>Type of node defined in nodeTypes</p>
</div></td>
<td></td>
</tr>
<tr id="dragging">
<td><code dir="ltr">dragging</code></td>
<td><code dir="ltr">NodeType["dragging"]</code>
<div>
<p>Whether or not the node is currently being dragged.</p>
</div></td>
<td></td>
</tr>
<tr id="zindex">
<td><code dir="ltr">zIndex</code></td>
<td><code dir="ltr">NodeType["zIndex"]</code></td>
<td></td>
</tr>
<tr id="selectable">
<td><code dir="ltr">selectable</code></td>
<td><code dir="ltr">NodeType["selectable"]</code></td>
<td></td>
</tr>
<tr id="deletable">
<td><code dir="ltr">deletable</code></td>
<td><code dir="ltr">NodeType["deletable"]</code></td>
<td></td>
</tr>
<tr id="selected">
<td><code dir="ltr">selected</code></td>
<td><code dir="ltr">NodeType["selected"]</code></td>
<td></td>
</tr>
<tr id="draggable">
<td><code dir="ltr">draggable</code></td>
<td><code dir="ltr">NodeType["draggable"]</code>
<div>
<p>Whether or not the node is able to be dragged.</p>
</div></td>
<td></td>
</tr>
<tr id="isconnectable">
<td><code dir="ltr">isConnectable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Whether a node is connectable or not.</p>
</div></td>
<td></td>
</tr>
<tr id="positionabsolutex">
<td><code dir="ltr">positionAbsoluteX</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Position absolute x value.</p>
</div></td>
<td></td>
</tr>
<tr id="positionabsolutey">
<td><code dir="ltr">positionAbsoluteY</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Position absolute y value.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>
