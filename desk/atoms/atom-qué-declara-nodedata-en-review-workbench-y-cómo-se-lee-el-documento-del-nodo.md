---
id: atom-qué-declara-nodedata-en-review-workbench-y-cómo-se-lee-el-documento-del-nodo
title: Qué declara NodeData en review-workbench y cómo se lee el documento del nodo
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:types
- layer:review-workbench
provenance: apps/review-workbench/src/stores/types.ts
---

# Qué declara NodeData en review-workbench y cómo se lee el documento del nodo

## Answer

NodeData, en src/stores/types.ts, es el tipo cerrado de los datos de un nodo del editor: typeId, payload ({typeId, value}), properties (strings), visualToken, label, name, category (la categoría de grupo, que elige el color del borde), message (aviso de texto libre) y childIds (los ids de los nodos contenidos). No tiene firma de índice, así que leer una clave que no declara es un error de compilación y no una lectura silenciosa de unknown. payload.value sigue siendo unknown a propósito: es el documento y su forma depende del modelo. Se lee solo con payloadValue(data) de src/features/graph-editor/lib/node-data.ts, que devuelve el documento como registro o {} si no es un objeto plano. El código del editor no castea node.data; los únicos casts que quedan están en las fronteras con datos desconocidos (el JSON crudo de sldb en el adapter de Antonia y las props de los renderers del schema).
