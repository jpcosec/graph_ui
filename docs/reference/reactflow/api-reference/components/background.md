---
source: https://reactflow.dev/api-reference/components/background
title: The Background component
---

# <Background />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Background/Background.tsx">Source on GitHub </a>

The `<Background />` component makes it convenient to render different
types of backgrounds common in node-based UIs. It comes with three
variants: `lines`, `dots` and `cross`.

```tsx
import { useState } from 'react';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
 
export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background color="#ccc" variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
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
<tr id="id">
<td><code dir="ltr">id</code></td>
<td><code dir="ltr">string</code>
<div>
<p>When multiple backgrounds are present on the page, each one should have a unique id.</p>
</div></td>
<td></td>
</tr>
<tr id="color">
<td><code dir="ltr">color</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Color of the pattern.</p>
</div></td>
<td></td>
</tr>
<tr id="bgcolor">
<td><code dir="ltr">bgColor</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Color of the background.</p>
</div></td>
<td></td>
</tr>
<tr id="classname">
<td><code dir="ltr">className</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Class applied to the container.</p>
</div></td>
<td></td>
</tr>
<tr id="patternclassname">
<td><code dir="ltr">patternClassName</code></td>
<td><code dir="ltr">string</code>
<div>
<p>Class applied to the pattern.</p>
</div></td>
<td></td>
</tr>
<tr id="gap">
<td><code dir="ltr">gap</code></td>
<td><code dir="ltr">number | [number, number]</code>
<div>
<p>The gap between patterns. Passing in a tuple allows you to control the x and y gap independently.</p>
</div></td>
<td><code dir="ltr">20</code></td>
</tr>
<tr id="size">
<td><code dir="ltr">size</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The radius of each dot or the size of each rectangle if <code dir="ltr">BackgroundVariant.Dots</code> or <code dir="ltr">BackgroundVariant.Cross</code> is used. This defaults to 1 or 6 respectively, or ignored if <code dir="ltr">BackgroundVariant.Lines</code> is used.</p>
</div></td>
<td></td>
</tr>
<tr id="offset">
<td><code dir="ltr">offset</code></td>
<td><code dir="ltr">number | [number, number]</code>
<div>
<p>Offset of the pattern.</p>
</div></td>
<td><code dir="ltr">0</code></td>
</tr>
<tr id="linewidth">
<td><code dir="ltr">lineWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The stroke thickness used when drawing the pattern.</p>
</div></td>
<td><code dir="ltr">1</code></td>
</tr>
<tr id="variant">
<td><code dir="ltr">variant</code></td>
<td><code dir="ltr">BackgroundVariant</code>
<div>
<p>Variant of the pattern.</p>
</div></td>
<td><code dir="ltr">BackgroundVariant.Dots</code></td>
</tr>
<tr id="style">
<td><code dir="ltr">style</code></td>
<td><code dir="ltr">CSSProperties</code>
<div>
<p>Style applied to the container.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

## Examples

### Combining multiple backgrounds

It is possible to layer multiple `<Background />` components on top of
one another to create something more interesting. The following example
shows how to render a square grid accented every 10th line.

```tsx
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
 
export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background
        id="1"
        gap={10}
        color="#f1f1f1"
        variant={BackgroundVariant.Lines}
      />
 
      <Background
        id="2"
        gap={100}
        color="#ccc"
        variant={BackgroundVariant.Lines}
      />
    </ReactFlow>
  );
}
```

</div>

## Notes

-   When combining multiple `<Background />` components it’s important
    to give each of them a unique `id` prop!
