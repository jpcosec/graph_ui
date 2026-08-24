---
source: https://reactflow.dev/api-reference/hooks/use-on-viewport-change
title: useOnViewportChange()
---

# useOnViewportChange()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnViewportChange.ts">Source on GitHub </a>

The `useOnViewportChange` hook lets you listen for changes to the
viewport such as panning and zooming. You can provide a callback for
each phase of a viewport change: `onStart`, `onChange`, and `onEnd`.

```tsx
import { useCallback } from 'react';
import { useOnViewportChange } from '@xyflow/react';
 
function ViewportChangeLogger() {
  useOnViewportChange({
    onStart: (viewport: Viewport) => console.log('start', viewport),
    onChange: (viewport: Viewport) => console.log('change', viewport),
    onEnd: (viewport: Viewport) => console.log('end', viewport),
  });
 
  return null;
}
```

</div>

## Signature

**Parameters:**

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
<tr id="0onstart">
<td><code dir="ltr">[0].onStart</code></td>
<td><code dir="ltr">OnViewportChange</code>
<div>
<p>Gets called when the viewport starts changing.</p>
</div></td>
<td></td>
</tr>
<tr id="0onchange">
<td><code dir="ltr">[0].onChange</code></td>
<td><code dir="ltr">OnViewportChange</code>
<div>
<p>Gets called when the viewport changes.</p>
</div></td>
<td></td>
</tr>
<tr id="0onend">
<td><code dir="ltr">[0].onEnd</code></td>
<td><code dir="ltr">OnViewportChange</code>
<div>
<p>Gets called when the viewport stops changing.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`void`

</div>

## Notes

-   This hook can only be used in a component that is a child of a
    <a href="/api-reference/react-flow-provider"><code dir="ltr"><ReactFlowProvider /></code></a>
    or a
    <a href="/api-reference/react-flow"><code dir="ltr"><ReactFlow /></code></a>
    component.
