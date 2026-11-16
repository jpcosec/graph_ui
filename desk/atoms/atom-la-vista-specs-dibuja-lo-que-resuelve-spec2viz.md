---
sldb:
  by: agent
  at: '2026-11-16T05:08:10Z'
  authority: generated
  via: save_document_payload
id: atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
title: La vista Specs dibuja lo que resuelve sldb.api.notations
five_wh_one_plus: how
tags:
- system:graph_ui
- system:sldb
- topic:notation
provenance: frontends/mindmap/views/specs/notation/notation.mjs
---

# La vista Specs dibuja lo que resuelve sldb.api.notations

## Answer

La vista Specs (/specs/notation) no interpreta notaciones: GET /api/notation/view devuelve tal cual sldb.api.notations.resolve_view, y la vista solo dibuja forma, compartimentos, marcas, terminales y rótulos. Las notaciones de fábrica viven en sldb/src/sldb/notations/builtin/ (activity, component, deployment, statechart, uml-class, uml-sequence…); graph_ui no importa ni invoca spec2viz (IR13). layout graph/tree va con dagre (draw nest como contención), lanes como carriles (un carril por nodo en orden, mensajes por order, fragmentos como marcos) y grid como una tabla por data.view, con filas components anidadas y celdas draw cell. Lo no soportado (axis, draw lane) se dibuja como grafo/línea con aviso. El contrato está en sldb/docs/architecture/notations-and-views.md.
