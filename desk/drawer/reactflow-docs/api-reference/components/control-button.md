---
source: https://reactflow.dev/api-reference/components/control-button
title: The ControlButton component
---

# <ControlButton />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Controls/ControlButton.tsx">Source on GitHub </a>

You can add buttons to the control panel by using the
`<ControlButton />` component and pass it as a child to the
<a href="/api-reference/components/controls"><code dir="ltr"><Controls /></code></a>
component.

```tsx
import { MagicWand } from '@radix-ui/react-icons'
import { ReactFlow, Controls, ControlButton } from '@xyflow/react'
 
export default function Flow() {
  return (
    <ReactFlow nodes={[...]} edges={[...]}>
      <Controls>
        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
          <MagicWand />
        </ControlButton>
      </Controls>
    </ReactFlow>
  )
}
```

</div>

## Props

The `<ControlButton />` component accepts any prop valid on a HTML
`<button />` element.

| Name                                                                                                                                                                                                                                                                             | Type                                      | Default |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|---------|
| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` |         |
