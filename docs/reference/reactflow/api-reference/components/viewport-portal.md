---
source: https://reactflow.dev/api-reference/components/viewport-portal
title: The ViewportPortal component
---

# <ViewportPortal />

<a href="https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/ViewportPortal/index.tsx">Source on GitHub </a>

`<ViewportPortal />` component can be used to add components to the same
viewport of the flow where nodes and edges are rendered. This is useful
when you want to render your own components that adhere to the same
coordinate system as the nodes & edges and are also affected by zooming
and panning

```tsx
import React from 'react';
import { ViewportPortal } from '@xyflow/react';
 
export default function () {
  return (
    <ViewportPortal>
      <div
        style={{ transform: 'translate(100px, 100px)', position: 'absolute' }}
      >
        This div is positioned at [100, 100] on the flow.
      </div>
    </ViewportPortal>
  );
}
```

</div>

## Props

| Name                                                                                                                                                                                                                                                                                | Type        | Default |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|---------|
| `children` | `ReactNode` |         |
