---
source: https://reactflow.dev/api-reference/utils/is-edge
title: isEdge()
---

# isEdge()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L39-L40">Source on GitHub </a>

Test whether an object is usable as an
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>.
In TypeScript this is a type guard that will narrow the type of whatever
you pass in to
<a href="/api-reference/types/edge"><code dir="ltr">Edge</code></a>
if it returns `true`.

```tsx
import { isEdge } from '@xyflow/react';
 
const edge = {
  id: 'edge-a',
  source: 'a',
  target: 'b',
};
 
if (isEdge(edge)) {
  // ...
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
<tr id="element">
<td><code dir="ltr">element</code></td>
<td><code dir="ltr">unknown</code>
<div>
<p>The element to test</p>
</div></td>
<td></td>
</tr>
</tbody>
</table>

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`boolean`

</div>
