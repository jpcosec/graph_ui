---
source: https://reactflow.dev/api-reference/components/panel
title: The Panel component
---

# <Panel />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Panel/index.tsx">Source on GitHub </a>

The `<Panel />` component helps you position content above the viewport.
It is used internally by the
<a href="/api-reference/components/minimap"><code dir="ltr"><MiniMap /></code></a>
and
<a href="/api-reference/components/controls"><code dir="ltr"><Controls /></code></a>
components.

```tsx
import { ReactFlow, Panel } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]} fitView>
      <Panel position="top-left">top-left</Panel>
      <Panel position="top-center">top-center</Panel>
      <Panel position="top-right">top-right</Panel>
      <Panel position="bottom-left">bottom-left</Panel>
      <Panel position="bottom-center">bottom-center</Panel>
      <Panel position="bottom-right">bottom-right</Panel>
      <Panel position="center-left">center-left</Panel>
      <Panel position="center-right">center-right</Panel>
    </ReactFlow>
  );
}
```

</div>

## Props

For TypeScript users, the props type for the `<Panel />` component is
exported as `PanelProps`. Additionally, the `<Panel />` component
accepts all props of the HTML `<div />` element.

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
<tr id="position">
<td><code dir="ltr">position</code></td>
<td><code dir="ltr">PanelPosition</code>
<div>
<p>The position of the panel.</p>
</div></td>
<td><code dir="ltr">"top-left"</code></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement></code></td>
<td></td>
</tr>
</tbody>
</table>
