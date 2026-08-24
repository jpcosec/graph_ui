---
source: https://reactflow.dev/api-reference/utils/get-viewport-for-bounds
title: getViewportForBounds()
---

# getViewportForBounds()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/general.ts/#L170">Source on Github </a>

This util returns the viewport for the given bounds. You might use this
to pre-calculate the viewport for a given set of nodes on the server or
calculate the viewport for the given bounds *without* changing the
viewport directly.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

**Note**

This function was previously called `getTransformForBounds`

</div>

</div>

```tsx
import { getViewportForBounds } from '@xyflow/react';
 
const { x, y, zoom } = getViewportForBounds(
  {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
  1200,
  800,
  0.5,
  2,
);
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
<tr id="bounds">
<td><code dir="ltr">bounds</code></td>
<td><code dir="ltr">Rect</code>
<div>
<p>Bounds to fit inside viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="width">
<td><code dir="ltr">width</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Width of the viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="height">
<td><code dir="ltr">height</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Height of the viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="minzoom">
<td><code dir="ltr">minZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Minimum zoom level of the resulting viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="maxzoom">
<td><code dir="ltr">maxZoom</code></td>
<td><code dir="ltr">number</code>
<div>
<p>Maximum zoom level of the resulting viewport.</p>
</div></td>
<td></td>
</tr>
<tr id="padding">
<td><code dir="ltr">padding</code></td>
<td><code dir="ltr">Padding</code>
<div>
<p>Padding around the bounds.</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

| Name                                                                                                                                                                                                                                                                        | Type     |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `x`       | `number` |
| `y`       | `number` |
| `zoom` | `number` |

## Notes

-   This is quite a low-level utility. You might want to look at the
    <a href="/api-reference/types/react-flow-instance#fitview"><code dir="ltr">fitView</code></a>
    or
    <a href="/api-reference/types/react-flow-instance#fitbounds"><code dir="ltr">fitBounds</code></a>
    methods for a more practical api.
