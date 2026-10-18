---
source: https://reactflow.dev/api-reference/utils/get-smooth-step-path
title: getSmoothStepPath()
---

# getSmoothStepPath()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts/#L215">Source on GitHub </a>

The `getSmoothStepPath` util returns everything you need to render a
stepped path between two nodes. The `borderRadius` property can be used
to choose how rounded the corners of those steps are.

```tsx
import { Position, getSmoothStepPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});
 
console.log(path); //=> "M0 20L20 20L 70,20Q 75,20 75,25L 75,95Q ..."
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
<tr id="0borderradius">
<td><code dir="ltr">[0].borderRadius</code></td>
<td><code dir="ltr">number</code></td>
<td><code dir="ltr">5</code></td>
</tr>
<tr id="0centerx">
<td><code dir="ltr">[0].centerX</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="0centery">
<td><code dir="ltr">[0].centerY</code></td>
<td><code dir="ltr">number</code></td>
<td></td>
</tr>
<tr id="0offset">
<td><code dir="ltr">[0].offset</code></td>
<td><code dir="ltr">number</code></td>
<td><code dir="ltr">20</code></td>
</tr>
<tr id="0stepposition">
<td><code dir="ltr">[0].stepPosition</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Controls where the bend occurs along the path. 0 = at source, 1 = at target, 0.5 = midpoint</p>
</div></td>
<td><code dir="ltr">0.5</code></td>
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
-   You can set the `borderRadius` property to `0` to get a step edge
    path.
