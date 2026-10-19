---
id: atom-cómo-se-edita-guarda-y-apunta-una-vista-desde-la-barra-lateral-de-review-workbench
title: Cómo se edita, guarda y apunta una vista desde la barra lateral de review-workbench
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:projection-grammar
---

# Cómo se edita, guarda y apunta una vista desde la barra lateral de review-workbench

## Answer

En la barra lateral de review-workbench, Filters abre con la consulta de la vista (ViewQuery): entradas modelo + where (unión; ninguna = todos los documentos), tipos de relación separados por coma y dirección. Apply view la manda sin guardar a POST /api/views/evaluate del servidor de graph_ui (vite proxy /api), que la evalúa con sldb.api.graph; useApplyView carga los nodos y aristas en el graph store y hace layout cuando React Flow los midió. Views lista los ViewDoc del store (GET /api/views), carga uno al elegirlo y guarda el borrador con nombre como ViewDoc (POST /api/views/save); el campo Store apunta la misma vista a otro .sldb. No hay vistas en localStorage. Lo prueba tests/e2e_review_workbench_views.py (sldb serve + servidor de graph_ui + vite preview, en Chromium).
