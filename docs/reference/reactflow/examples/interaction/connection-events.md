---
source: https://reactflow.dev/examples/interaction/connection-events
title: Connection Events
---

# Connection Events

React Flow emits different events during the connection process that you
can use to update your UI or your flow in different ways. The example
below demonstrates which events are fired and when.

<div
class="remote-code-viewer border-border mt-5 flex flex-col overflow-hidden rounded-xl border dark:border-gray-700">

<div style="aspect-ratio:16/9">

<div>

<div id="app">

</div>

</div>

</div>

<div>

<div dir="ltr" orientation="horizontal">

<div
class="grid grid-flow-col grid-cols-[1fr_min-content] gap-2 border-t border-b border-border dark:border-gray-700">

<div
class="border-border mb-4 flex gap-x-0 border-b tablist h-full overflow-x-auto overflow-y-hidden text-nowrap border-none"
role="tablist" aria-orientation="horizontal" tabindex="-1"
orientation="horizontal" style="outline:none">

App.jsx

xy-theme.css

index.css

</div>

<div
class="col-span-1 flex h-10 justify-end gap-1 self-center p-1 text-sm">

</div>

</div>

<div>

<div id="radix-_R_13kt5fiv5tlqlb_-content-App.jsx"
state="active" orientation="horizontal" role="tabpanel"
aria-labelledby="radix-_R_13kt5fiv5tlqlb_-trigger-App.jsx" tabindex="0"
style="animation-duration:0s">

```tsx
import { useCallback } from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import './index.css';
 
import { useState } from 'react';
import { useEffect } from 'react';
 
 
const initialNodes = [
  { id: 'a', position: { x: -100, y: 0 }, data: { label: 'A' } },
  { id: 'b', position: { x: 100, y: 0 }, data: { label: 'B' } },
  { id: 'c', position: { x: 0, y: 100 }, data: { label: 'C' } },
];
 
const initialEdges = [{ id: 'b->c', source: 'b', target: 'c' }];
 
const Flow = () => {
  const [events, setEvents] = useState({
    onReconnectStart: false,
    onConnectStart: false,
    onConnect: false,
    onReconnect: false,
    onConnectEnd: false,
    onReconnectEnd: false,
  });
 
  const onReconnectStart = useCallback(() => {
    console.log('onReconnectStart');
    setEvents({
      onReconnectStart: true,
      onConnectStart: false,
      onConnect: false,
      onReconnect: false,
      onConnectEnd: false,
      onReconnectEnd: false,
    });
  }, []);
 
  const onConnectStart = useCallback(() => {
    console.log('onConnectStart');
    setEvents((events) => ({
      ...events,
      onConnectStart: true,
      onConnect: false,
      onReconnect: false,
      onConnectEnd: false,
      onReconnectEnd: false,
    }));
  }, []);
 
  const onConnect = useCallback(() => {
    console.log('onConnect');
    setEvents({
      onReconnectStart: false,
      onConnectStart: false,
      onConnect: true,
      onReconnect: false,
      onConnectEnd: false,
      onReconnectEnd: false,
    });
  }, []);
 
  const onReconnect = useCallback(() => {
    console.log('onReconnect');
    setEvents({
      onReconnectStart: false,
      onConnectStart: false,
      onConnect: false,
      onReconnect: true,
      onConnectEnd: false,
      onReconnectEnd: false,
    });
  }, []);
 
  const onConnectEnd = useCallback(() => {
    setEvents((events) => ({
      ...events,
      onReconnectStart: false,
      onConnectStart: false,
      onConnectEnd: true,
    }));
  }, []);
 
  const onReconnectEnd = useCallback(() => {
    console.log('onReconnectEnd');
    setEvents((events) => ({
      ...events,
      onReconnectStart: false,
      onConnectStart: false,
      onReconnectEnd: true,
    }));
  }, []);
 
  useEffect(() => {
    if (!events.onReconnectEnd && !events.onConnectEnd) return;
 
    let timer = window.setTimeout(() => {
      setEvents({
        onReconnectStart: false,
        onConnectStart: false,
        onConnect: false,
        onReconnect: false,
        onConnectEnd: false,
        onReconnectEnd: false,
      });
    }, 500);
 
    return () => window.clearTimeout(timer);
  });
 
  return (
    <>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        edgesReconnectable={true}
        onConnectStart={onConnectStart}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onReconnectStart={onReconnectStart}
        onReconnect={onReconnect}
        onReconnectEnd={onReconnectEnd}
        fitView
        colorMode="system"
      >
        <Background />
      </ReactFlow>
      <div id="event-list">
        {Object.entries(events).map(([name, active]) => (
          <p key={name} style={{ opacity: active ? 1 : 0.2 }}>
            {name}
          </p>
        ))}
      </div>
    </>
  );
};
 
export default Flow;
```

</div>

</div>

<div id="radix-_R_13kt5fiv5tlqlb_-content-xy-theme.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_13kt5fiv5tlqlb_-trigger-xy-theme.css"
hidden="" tabindex="0">

</div>

<div id="radix-_R_13kt5fiv5tlqlb_-content-index.css"
class="min-h-[500px]" state="inactive" orientation="horizontal"
role="tabpanel"
aria-labelledby="radix-_R_13kt5fiv5tlqlb_-trigger-index.css" hidden=""
tabindex="0">

</div>

</div>

</div>

</div>

</div>

For a **new connection** created by dragging from a handle, the
following events are called in order:

-   <a href="/api-reference/react-flow#onconnectstart"><code dir="ltr">onConnectStart</code></a>
    is called with the mouse event and an object containing the source
    node, potentially the source handle id, and the handle type.

-   <a href="/api-reference/react-flow#onconnect"><code dir="ltr">onConnect</code></a>
    is only called when the connection is released on a handle that
    <a href="/api-reference/components/handle#isconnectable">is connectable</a>.
    It is called with a complete
    <a href="/api-reference/types/connection">connection object</a>
    containing the source and target node, and the source and target
    handle ids if present.

-   <a href="/api-reference/react-flow#onconnectend"><code dir="ltr">onConnectEnd</code></a>
    is called when a connection is released, regardless of whether it
    was successful or not. It is called with the mouse event.

When an edge is **reconnected** by dragging an existing edge, the
following events are called in order:

-   <a href="/api-reference/react-flow#onreconnectstart"><code dir="ltr">onReconnectStart</code></a>
    is called when a
    <a href="/api-reference/types/edge#reconnectable">reconnectable edge</a>
    is picked up. It is called with the mouse event, the edge object
    that is being reconnected, and the type of the stable handle.

-   <a href="/api-reference/react-flow#onconnectstart"><code dir="ltr">onConnectStart</code></a>
    is called as above.

-   <a href="/api-reference/react-flow#onreconnect"><code dir="ltr">onReconnect</code></a>
    is called when the edge is released on a handle that is
    <a href="/api-reference/types/edge#reconnectable">reconnectable</a>.
    It is called with the old
    <a href="/api-reference/types/edge">edge object</a>
    and the new
    <a href="/api-reference/types/connection">connection object</a>.

-   <a href="/api-reference/react-flow#onconnectend"><code dir="ltr">onConnectEnd</code></a>
    is called as above.

-   <a href="/api-reference/react-flow#onreconnectend"><code dir="ltr">onReconnectEnd</code></a>
    is called when the edge is released, regardless of whether the
    reconnection was successful or not. It is called with the mouse
    event, the edge that was picked up, and the type of the stable
    handle.

<div
class="nextra-callout x:overflow-x-auto x:not-first:mt-[1.25em] x:flex x:rounded-lg x:border x:py-[.5em] x:pe-[1em] x:contrast-more:border-current! x:bg-blue-100 x:dark:bg-blue-900/30 x:text-blue-700 x:dark:text-blue-400 x:border-blue-700 x:dark:border-blue-600">

<div
style="font-family:"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol""

</div>

<div>

You can see many of these events in use in our
<a href="/examples/nodes/add-node-on-edge-drop">add node on edge drop</a>
and
<a href="/examples/edges/temporary-edges">temporary edges</a>
examples!

</div>

</div>
