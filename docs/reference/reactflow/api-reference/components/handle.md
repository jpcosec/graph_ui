---
source: https://reactflow.dev/api-reference/components/handle
title: The Handle component
---

# <Handle />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Handle/index.tsx">Source on GitHub </a>

The `<Handle />` component is used in your
<a href="/learn/customization/custom-nodes">custom nodes</a>
to define connection points.

```tsx
import { Handle, Position } from '@xyflow/react';
 
export const CustomNode = ({ data }) => {
  return (
    <>
      <div style={{ padding: '10px 20px' }}>
        {data.label}
      </div>
 
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};
```

</div>

## Props

For TypeScript users, the props type for the `<Handle />` component is
exported as `HandleProps`.

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
<td><code dir="ltr">string | null</code>
<div>
<p>Id of the handle.</p>
</div></td>
<td></td>
</tr>
<tr id="type">
<td><code dir="ltr">type</code></td>
<td><code dir="ltr">'source' | 'target'</code>
<div>
<p>Type of the handle.</p>
</div></td>
<td><code dir="ltr">"source"</code></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>The position of the handle relative to the node. In a horizontal flow source handles are typically <code dir="ltr">Position.Right</code> and in a vertical flow they are typically <code dir="ltr">Position.Top</code>.</p>
</div></td>
<td><code dir="ltr">Position.Top</code></td>
</tr>
<tr id="isconnectable">
<td><code dir="ltr">isConnectable</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Should you be able to connect to/from this handle.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="isconnectablestart">
<td><code dir="ltr">isConnectableStart</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Dictates whether a connection can start from this handle.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="isconnectableend">
<td><code dir="ltr">isConnectableEnd</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>Dictates whether a connection can end on this handle.</p>
</div></td>
<td><code dir="ltr">true</code></td>
</tr>
<tr id="isvalidconnection">
<td><code dir="ltr">isValidConnection</code></td>
<td><code dir="ltr">IsValidConnection</code>
<div>
<p>Called when a connection is dragged to this handle. You can use this callback to perform some custom validation logic based on the connection target and source, for example. Where possible, we recommend you move this logic to the <code dir="ltr">isValidConnection</code> prop on the main ReactFlow component for performance reasons.</p>
</div></td>
<td></td>
</tr>
<tr id="onconnect">
<td><code dir="ltr">onConnect</code></td>
<td><code dir="ltr">OnConnect</code>
<div>
<p>Callback called when connection is made</p>
</div></td>
<td></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "id"></code></td>
<td></td>
</tr>
</tbody>
</table>
