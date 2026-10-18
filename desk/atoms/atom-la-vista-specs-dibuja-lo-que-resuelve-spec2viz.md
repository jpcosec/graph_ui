---
id: atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
title: La vista Specs dibuja lo que resuelve spec2viz
five_wh_one_plus: how
tags:
- system:graph_ui
- system:spec2viz
- topic:notation
provenance: frontends/mindmap/views/specs/notation/notation.mjs
---

# La vista Specs dibuja lo que resuelve spec2viz

## Answer

La vista Specs (/specs/notation) no interpreta notaciones: GET /api/notation/view devuelve tal cual spec2viz.notation_view.resolve_view, y la vista solo dibuja forma, compartimentos, marcas, terminales y rótulos. layout graph/tree va con dagre (draw nest como contención), lanes como carriles (un carril por nodo en orden, mensajes por order, fragmentos como marcos) y grid como una tabla por data.view, con filas components anidadas y celdas draw cell. Lo no soportado (axis, draw lane) se dibuja como grafo/línea con aviso. El contrato está en spec2viz/docs/notation-contract.md, §8c/§8d/§11.
