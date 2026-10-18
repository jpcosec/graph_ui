---
id: atom-cómo-filtra-el-lienzo-de-review-workbench
title: Cómo filtra el lienzo de review-workbench
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:filters
- layer:review-workbench
provenance: apps/review-workbench/src/features/graph-editor/L2-canvas/GraphCanvas.tsx
---

# Cómo filtra el lienzo de review-workbench

## Answer

GraphCanvas dibuja lo que devuelve applyCanvasFilters(nodes, edges, {filters, focusedNodeId, focusMode}), que aplica en este orden los filtros del sidebar guardados en ui-store. 1) Tipos de relación ocultos: un nodo sin aristas visibles se conserva solo si no tenía ninguna. 2) Texto: el título (resolveNodeTitle) o el id contiene el texto, sin distinguir mayúsculas. 3) Atributo: sobre payload.value y properties juntos; con clave, el nodo debe tener esa clave y, si hay valor, contenerlo; solo con valor, basta que algún atributo lo contenga. 4) Foco: si editorState es focus y hideNonNeighbors está activo, quedan el nodo enfocado y sus vecinos por las aristas que dejaron los pasos anteriores. Una arista queda solo si quedan sus dos extremos. El foco depende de editorState y no de focusedNodeId solo, porque el doble click también setea focusedNodeId para abrir el inspector. Escape sale del foco (exit-edit-mode).
