---
source: https://reactflow.dev/api-reference/components/node-toolbar
title: The NodeToolbar component
---

# <NodeToolbar />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeToolbar/NodeToolbar.tsx">Source on GitHub </a>

This component can render a toolbar or tooltip to one side of a custom
node. This toolbar doesn’t scale with the viewport so that the content
is always visible.

```tsx
import { memo } from 'react';
import { Handle, Position, NodeToolbar } from '@xyflow/react';
 
const CustomNode = ({ data }) => {
  return (
    <>
      <NodeToolbar isVisible={data.toolbarVisible} position={data.toolbarPosition}>
        <button>delete</button>
        <button>copy</button>
        <button>expand</button>
      </NodeToolbar>
 
      <div style={{ padding: '10px 20px' }}>
        {data.label}
      </div>
 
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};
 
export default memo(CustomNode);
```

</div>

## Props

For TypeScript users, the props type for the `<NodeToolbar />` component
is exported as `NodeToolbarProps`. Additionally, the `<NodeToolbar />`
component accepts all props of the HTML `<div />` element.

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
<td><code dir="ltr">string | string[]</code>
<div>
<p>By passing in an array of node id’s you can render a single tooltip for a group or collection of nodes.</p>
</div></td>
<td></td>
</tr>
<tr id="isvisible">
<td><code dir="ltr">isVisible</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>If <code dir="ltr">true</code>, node toolbar is visible even if node is not selected.</p>
</div></td>
<td></td>
</tr>
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>Position of the toolbar relative to the node.</p>
</div></td>
<td><code dir="ltr">Position.Top</code></td>
</tr>
<tr id="offset">
<td><code dir="ltr">offset</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The space between the node and the toolbar, measured in pixels.</p>
</div></td>
<td><code dir="ltr">10</code></td>
</tr>
<tr id="align">
<td><code dir="ltr">align</code></td>
<td><code dir="ltr">Align</code>
<div>
<p>Align the toolbar relative to the node.</p>
</div></td>
<td><code dir="ltr">"center"</code></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">HTMLAttributes<HTMLDivElement></code></td>
<td></td>
</tr>
</tbody>
</table>

## Notes

-   By default, the toolbar is only visible when a node is selected. If
    multiple nodes are selected it will not be visible to prevent
    overlapping toolbars or clutter. You can override this behavior by
    setting the `isVisible` prop to `true`.
