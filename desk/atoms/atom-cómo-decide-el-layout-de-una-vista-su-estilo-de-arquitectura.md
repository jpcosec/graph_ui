---
id: atom-cómo-decide-el-layout-de-una-vista-su-estilo-de-arquitectura
title: Cómo decide el layout de una vista su estilo de arquitectura
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:projection-grammar
---

# Cómo decide el layout de una vista su estilo de arquitectura

## Answer

El layout de una vista es ViewDoc.layout o, si está vacío, el layout de su NotationDoc (spec2viz §12: kind graph, style layered|rings, direction, ring_field). En review-workbench strategyForLayout (L2-canvas/layout/layout-strategies.ts) lo traduce: style rings -> elk-rings con ringField y el orden layout.rings; cualquier otro -> elk-layered con la dirección de la notación. elk-rings pone cada nodo en el anillo que nombra ring_field de su payload (ringDepths: los anillos listados de adentro hacia afuera, el resto ordenado, los nodos sin anillo al final), así una arquitectura en anillos o hexagonal muestra sus capas concéntricas; sin ring_field reparte por distancia en el grafo. useApplyView fija la estrategia al cargar la vista y hace el layout cuando React Flow midió los nodos. Lo prueba tests/e2e_review_workbench_views.py midiendo radios y alturas en Chromium.
