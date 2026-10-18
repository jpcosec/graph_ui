---
id: atom-grapheditor-de-review-workbench-dibuja-lo-que-hay-en-el-graph-store
title: GraphEditor de review-workbench dibuja lo que hay en el graph store
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:editor-contract
- layer:review-workbench
provenance: apps/review-workbench/src/features/graph-editor/L2-canvas/GraphEditor.tsx
---

# GraphEditor de review-workbench dibuja lo que hay en el graph store

## Answer

GraphEditor, la entrada pública de L2 en apps/review-workbench, no recibe el grafo por props. Dibuja lo que haya en useGraphStore, y lo mismo hacen GraphCanvas, NodeShell y NodeInspector, que leen y escriben ese store y useUIStore directamente. Quien monta el editor carga el grafo antes con useGraphStore.getState().loadGraph(nodes, edges), como hacen AntoniaFlowPage y GraphEditorPage. Sus props son solo de presentación y de comportamiento (onSave, editable, hero, workspace, overlays, variante). Las props initialNodes e initialEdges existían pero se ignoraban, y se quitaron. La alternativa de subir el estado de L2 a L1 por props o contexto no se tomó: es una decisión de arquitectura abierta, ligada a cuál es la página L1.
