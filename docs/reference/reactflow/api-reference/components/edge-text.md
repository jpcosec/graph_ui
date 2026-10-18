---
source: https://reactflow.dev/api-reference/components/edge-text
title: The EdgeText component
---

# <EdgeText />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/EdgeText.tsx">Source on GitHub </a>

You can use the `<EdgeText />` component as a helper component to
display text within your custom edges.

```tsx
import { EdgeText } from '@xyflow/react';
 
export function CustomEdgeLabel({ label }) {
  return (
    <EdgeText
      x={100}
      y={100}
      label={label}
      labelStyle={{ fill: 'white' }}
      labelShowBg
      labelBgStyle={{ fill: 'red' }}
      labelBgPadding={[2, 4]}
      labelBgBorderRadius={2}
    />
  );
}
```

</div>

## Props

For TypeScript users, the props type for the `<EdgeText />` component is
exported as `EdgeTextProps`.

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
<p>The x position where the label should be rendered.</p>
</div></td>
<td></td>
</tr>
<tr id="y">
<td><code dir="ltr">y</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The y position where the label should be rendered.</p>
</div></td>
<td></td>
</tr>
<tr id="label">
<td><code dir="ltr">label</code></td>
<td><code dir="ltr">ReactNode</code>
<div>
<p>The label or custom element to render along the edge. This is commonly a text label or some custom controls.</p>
</div></td>
<td></td>
</tr>
<tr id="labelstyle">
<td><code dir="ltr">labelStyle</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Custom styles to apply to the label.</p>
</div></td>
<td></td>
</tr>
<tr id="labelshowbg">
<td><code dir="ltr">labelShowBg</code></td>
<td><code dir="ltr">boolean</code></td>
<td></td>
</tr>
<tr id="labelbgstyle">
<td><code dir="ltr">labelBgStyle</code></td>
<td><code dir="ltr">CSSProperties</code></td>
<td></td>
</tr>
<tr id="labelbgpadding">
<td><code dir="ltr">labelBgPadding</code></td>
<td><code dir="ltr">[number, number]</code></td>
<td></td>
</tr>
<tr id="labelbgborderradius">
<td><code dir="ltr">labelBgBorderRadius</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">Omit<SVGAttributes<SVGElement>, "x" | "y"></code></td>
<td></td>
</tr>
</tbody>
</table>

Additionally, you may also pass any standard React HTML attributes such
as `onClick`, `className` and so on.
