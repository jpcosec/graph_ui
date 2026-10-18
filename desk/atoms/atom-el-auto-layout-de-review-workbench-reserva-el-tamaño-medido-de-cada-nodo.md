---
id: atom-el-auto-layout-de-review-workbench-reserva-el-tamaño-medido-de-cada-nodo
title: El auto layout de review-workbench reserva el tamaño medido de cada nodo
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:layout
- layer:review-workbench
provenance: apps/review-workbench/src/features/graph-editor/L2-canvas/hooks/use-graph-layout.ts
---

# El auto layout de review-workbench reserva el tamaño medido de cada nodo

## Answer

useGraphLayout le da a la estrategia de layout (ELK) el tamaño de cada nodo según layoutNodeSize: primero el que midió React Flow (el measured de su nodo interno, que se lee con getInternalNode), luego un style.width/height numérico y, si no hay ninguno, undefined, con lo que la estrategia usa su valor por defecto de 200x80. Para que el sidebar pueda leer ese store, GraphEditor envuelve todo el editor en ReactFlowProvider y no solo el lienzo. Apply Layout se habilita cuando ready es verdadero, es decir, cuando everyNodeMeasured confirma que todos los nodos internos tienen ancho y alto. No se usa useNodesInitialized() porque GraphCanvas reconstruye sus nodos controlados desde el graph store sin measured, y React Flow nunca los da por inicializados.
