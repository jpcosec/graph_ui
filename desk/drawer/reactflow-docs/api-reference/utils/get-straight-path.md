---
source: https://reactflow.dev/api-reference/utils/get-straight-path
title: getStraightPath()
---

# getStraightPath()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/straight-edge.ts/#L30">Source on GitHub </a>

Calculates the straight line path between two points.

```tsx
import { getStraightPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getStraightPath({
  sourceX: source.x,
  sourceY: source.y,
  targetX: target.x,
  targetY: target.y,
});
 
console.log(path); //=> "M 0,20L 150,100"
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
