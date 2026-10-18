---
source: https://reactflow.dev/api-reference/utils/get-bezier-path
title: getBezierPath()
---

# getBezierPath()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/bezier-edge.ts/#L95">Source on GitHub </a>

The `getBezierPath` util returns everything you need to render a bezier
edge between two nodes.

```tsx
import { Position, getBezierPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});
 
console.log(path); //=> "M0,20 C75,20 75,100 150,100"
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
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
<tr id="0sourcex">
<td><code dir="ltr">[0].sourceX</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">x</code> position of the source handle.</p>
</div></td>
<td></td>
</tr>
<tr id="0sourcey">
<td><code dir="ltr">[0].sourceY</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">y</code> position of the source handle.</p>
</div></td>
<td></td>
</tr>
<tr id="0sourceposition">
<td><code dir="ltr">[0].sourcePosition</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>The position of the source handle.</p>
</div></td>
<td><code dir="ltr">Position.Bottom</code></td>
</tr>
<tr id="0targetx">
<td><code dir="ltr">[0].targetX</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">x</code> position of the target handle.</p>
</div></td>
<td></td>
</tr>
<tr id="0targety">
<td><code dir="ltr">[0].targetY</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The <code dir="ltr">y</code> position of the target handle.</p>
</div></td>
<td></td>
</tr>
<tr id="0targetposition">
<td><code dir="ltr">[0].targetPosition</code></td>
<td><code dir="ltr">Position</code>
<div>
<p>The position of the target handle.</p>
</div></td>
<td><code dir="ltr">Position.Top</code></td>
</tr>
<tr id="0curvature">
<td><code dir="ltr">[0].curvature</code></td>
<td><code dir="ltr">number</code>
<div>
<p>The curvature of the bezier edge.</p>
</div></td>
<td><code dir="ltr">0.25</code></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

</div>

## Notes

-   This function returns a tuple (aka a fixed-size array) to make it
    easier to work with multiple edge paths at once.
