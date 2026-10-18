---
source: https://reactflow.dev/api-reference/components/edge-toolbar
title: The EdgeToolbar component
---

# <EdgeToolbar />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/EdgeToolbar/EdgeToolbar.tsx">Source on GitHub </a>

This component can render a toolbar to one side of a custom edge. This
toolbar doesn’t scale with the viewport so that the content doesn’t get
too small when zooming out.

```tsx
import { memo } from 'react';
import { EdgeToolbar, BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
 
function CustomEdge(props: EdgeProps) {
  const [edgePath, centerX, centerY] = getBezierPath(props);
 
  return (
    <>
      <BaseEdge id={props.id} path={edgePath} />
      <EdgeToolbar
        edgeId={props.id}
        x={centerX}
        y={centerY}
        isVisible
      >
        <button>
          some button
        </button>
      </EdgeToolbar>
    </>
  );
}
 
export default memo(CustomEdge);
```

</div>

## Props

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
<tr id="x">
<td><code dir="ltr">x</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">x</code> position of the edge toolbar.</p>
</div></td>
<td></td>
</tr>
<tr id="y">
<td><code dir="ltr">y</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">y</code> position of the edge toolbar.</p>
</div></td>
<td></td>
</tr>
<tr id="isvisible">
<td><code dir="ltr">isVisible</code></td>
<td><code dir="ltr">boolean</code>
<div>
<p>If <code dir="ltr">true</code>, edge toolbar is visible even if edge is not selected.</p>
</div></td>
<td><code dir="ltr">false</code></td>
</tr>
<tr id="alignx">
<td><code dir="ltr">alignX</code></td>
<td><code dir="ltr">"left" | "center" | "right"</code>
<div>
<p>Align the vertical toolbar position relative to the passed x position.</p>
</div></td>
<td><code dir="ltr">"center"</code></td>
</tr>
<tr id="aligny">
<td><code dir="ltr">alignY</code></td>
<td><code dir="ltr">"center" | "top" | "bottom"</code>
<div>
<p>Align the horizontal toolbar position relative to the passed y position.</p>
</div></td>
<td><code dir="ltr">"center"</code></td>
</tr>
<tr id="edgeid">
<td><code dir="ltr">edgeId</code></td>
<td><code dir="ltr">string</code>
<div>
<p>An edge toolbar must be attached to an edge.</p>
</div></td>
<td></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">HTMLAttributes<HTMLDivElement></code></td>
<td></td>
</tr>
</tbody>
</table>

## Notes

-   By default, the toolbar is only visible when the edge is selected.
    You can override this behavior by setting the `isVisible` prop to
    `true`.
