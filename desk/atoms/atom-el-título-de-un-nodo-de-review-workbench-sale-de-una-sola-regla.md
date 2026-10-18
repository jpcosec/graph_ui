---
id: atom-el-título-de-un-nodo-de-review-workbench-sale-de-una-sola-regla
title: El título de un nodo de review-workbench sale de una sola regla
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:node-title
- layer:review-workbench
provenance: apps/review-workbench/src/features/graph-editor/lib/node-title.ts
---

# El título de un nodo de review-workbench sale de una sola regla

## Answer

En apps/review-workbench el título visible de un nodo lo calcula solo resolveNodeTitle(data, fallback), en src/features/graph-editor/lib/node-title.ts. Toma el primer string no vacío (sin contar espacios) entre data.label, data.name, data.payload.value.name y data.payload.value.title, en ese orden. La forma JSON plana trae el título directo; la forma AST lo trae dentro del payload del documento. Si no hay ninguno, devuelve el fallback del llamador, porque cada superficie nombra la ausencia de título a su modo: NodeShell y graph-to-domain usan Untitled, GroupShell usa Group y el borrador del inspector usa la cadena vacía. Escribir el título (setNodeTitle en NodeInspector) es otra regla y no pasa por aquí.
