---
source: https://reactflow.dev/api-reference/utils/get-simple-bezier-path
title: getSimpleBezierPath()
---

# getSimpleBezierPath()

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/SimpleBezierEdge.tsx/#L32">Source on Github </a>

The `getSimpleBezierPath` util returns everything you need to render a
simple bezier edge between two nodes.

```tsx
import { Position, getSimpleBezierPath } from '@xyflow/react';
 
const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };
 
const [path, labelX, labelY, offsetX, offsetY] = getSimpleBezierPath({
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

| Name                                                                                                                                                                                                                                                                                                 | Type       | Default           |
|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|-------------------|
| `[0].sourceX`               | `number`   |                   |
| `[0].sourceY`               | `number`   |                   |
| `[0].sourcePosition` | `Position` | `Position.Bottom` |
| `[0].targetX`               | `number`   |                   |
| `[0].targetY`               | `number`   |                   |
| `[0].targetPosition` | `Position` | `Position.Top`    |

**Returns:**

<div id="returns"
class="x:rounded-xl nextra-border x:hover:bg-primary-50 x:dark:hover:bg-primary-500/10 x:text-sm x:relative x:p-3 x:border x:before:content-["Type:_"] x:mt-5">

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

</div>

## Notes

-   This function returns a tuple (aka a fixed-size array) to make it
    easier to work with multiple edge paths at once.
