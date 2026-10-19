---
id: atom-graph-ui-node-types-must-not-be-hand-written-zod-generate-them-from-sldb-models-at-build
title: graph_ui node types must not be hand-written Zod; generate them from sldb models
  at build
five_wh_one_plus: how_not
tags:
- system:graph_ui
- topic:typed-editor
- layer:document-model
---

# graph_ui node types must not be hand-written Zod; generate them from sldb models at build

## Answer

En apps/review-workbench los tipos de nodo ya se generan en parte desde modelos: scripts/generate-node-types.mjs (npm run hum:sync) lee src/schema/models/*.model.json y escribe src/schema/generated-node-types.ts (Zod por campo), que registerDefaultNodeTypes registra junto a los tipos 'group' y 'simple', que siguen escritos a mano con Zod y renderers placeholder en src/schema/register-defaults.ts. Lo que no debe hacerse es ampliar esos tipos a mano: el camino elegido es BUILD-TIME, exportar los modelos sldb a un contrato/schema que graph_ui consume para generar NodeTypeDefinition (Zod desde Field, allowedConnections desde campos de relación, colorToken/category desde __family__), no lecturas del store en runtime. Falta que los .model.json salgan de los modelos sldb reales en lugar de mantenerse localmente.
