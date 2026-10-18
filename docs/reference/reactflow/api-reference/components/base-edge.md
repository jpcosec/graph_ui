---
source: https://reactflow.dev/api-reference/components/base-edge
title: The BaseEdge component
---

# <BaseEdge />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/BaseEdge.tsx">Source on GitHub </a>

The `<BaseEdge />` component gets used internally for all the edges. It
can be used inside a custom edge and handles the invisible helper edge
and the edge label for you.

```tsx
import { BaseEdge } from '@xyflow/react';
 
export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
 
  const { label, labelStyle, markerStart, markerEnd, interactionWidth } = props;
 
  return (
    <BaseEdge
      path={edgePath}
      label={label}
      labelStyle={labelStyle}
      markerEnd={markerEnd}
      markerStart={markerStart}
      interactionWidth={interactionWidth}
    />
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
<tr id="path">
<td><code dir="ltr">path</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The SVG path string that defines the edge. This should look something like <code dir="ltr">'M 0 0 L 100 100'</code> for a simple line. The utility functions like <code dir="ltr">getSimpleBezierEdge</code> can be used to generate this string for you.</p>
</div></td>
<td></td>
</tr>
<tr id="markerstart">
<td><code dir="ltr">markerStart</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the SVG marker to use at the start of the edge. This should be defined in a <code dir="ltr"><defs></code> element in a separate SVG document or element. Use the format “url(#markerId)” where markerId is the id of your marker definition.</p>
</div></td>
<td></td>
</tr>
<tr id="markerend">
<td><code dir="ltr">markerEnd</code></td>
<td><code dir="ltr">string</code>
<div>
<p>The id of the SVG marker to use at the end of the edge. This should be defined in a <code dir="ltr"><defs></code> element in a separate SVG document or element. Use the format “url(#markerId)” where markerId is the id of your marker definition.</p>
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
<tr id="interactionwidth">
<td><code dir="ltr">interactionWidth</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The width of the invisible area around the edge that the user can interact with. This is useful for making the edge easier to click or hover over.</p>
</div></td>
<td><code dir="ltr">20</code></td>
</tr>
<tr id="labelx">
<td><code dir="ltr">labelX</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The x position of edge label</p>
</div></td>
<td></td>
</tr>
<tr id="labely">
<td><code dir="ltr">labelY</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The y position of edge label</p>
</div></td>
<td></td>
</tr>
<tr id="props">
<td><code dir="ltr">...props</code></td>
<td><code dir="ltr">Omit<SVGAttributes<SVGPathElement>, "d" | "path" | "markerStart" | "markerEnd"></code></td>
<td></td>
</tr>
</tbody>
</table>

## Notes

-   If you want to use an edge marker with the
    <a href="/api-reference/components/base-edge"><code dir="ltr"><BaseEdge /></code></a>
    component, you can pass the `markerStart` or `markerEnd` props
    passed to your custom edge through to the
    <a href="/api-reference/components/base-edge"><code dir="ltr"><BaseEdge /></code></a>
    component. You can see all the props passed to a custom edge by
    looking at the
    <a href="/api-reference/types/edge-props"><code dir="ltr">EdgeProps</code></a>
    type.
