---
id: atom-qué-es-una-vista-de-proyección-y-cómo-la-evalúa-graph-ui
title: Qué es una vista de proyección y cómo la evalúa graph_ui
five_wh_one_plus: what
tags:
- system:graph_ui
- topic:projection-grammar
---

# Qué es una vista de proyección y cómo la evalúa graph_ui

## Answer

Una vista de proyección es un ViewDoc del store (modelo en spec2viz.sldb_models, junto a NotationDoc, desde spec2viz 218676d): nodes es una lista de {model, where} (unión; where en la gramática de sldb find --where), relations los tipos de relación que se conservan (vacío = todos), direction both|outgoing|incoming, notation una NotationDoc opcional y layout un override de su layout (style layered|rings, ring_field). Solo nombra modelos, relaciones y una notación, nunca ids de nodo ni rutas, así que corre contra cualquier store. graph_ui la evalúa en frontends/mindmap/projection_views.py con sldb.api.where.where_matches y sldb.api.graph.execute_query, y la sirve en /api/views, /api/views/evaluate (por ref o con una vista sin guardar, ?store= para otro store) y /api/views/save (modo local). Con notation, la evaluación la aplica con spec2viz.notation_view.resolve_documents (el único intérprete del contrato §13) y devuelve un bloque notation: glifo, forma y estilo resuelto de cada nodo, link de cada arista (color, trazo, punta), leyenda y el ink de la paleta; si la notación no resuelve, la vista se evalúa igual y notation.error dice por qué. review-workbench pinta ese estilo en cada nodo y arista y muestra la leyenda en la barra lateral. Lo prueban tests/test_projection_views.py y tests/e2e_review_workbench_views.py.
