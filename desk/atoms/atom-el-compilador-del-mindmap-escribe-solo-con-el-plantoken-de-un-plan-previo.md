---
id: atom-el-compilador-del-mindmap-escribe-solo-con-el-plantoken-de-un-plan-previo
title: El compilador del mindmap escribe solo con el planToken de un plan previo
five_wh_one_plus: how
tags:
- system:graph_ui
- topic:compiler
- layer:mindmap
provenance: tests/test_mindmap_endpoints.py
---

# El compilador del mindmap escribe solo con el planToken de un plan previo

## Answer

El compilador del mindmap expone cuatro endpoints POST en serve.py: /api/validate (solo contrato JSON v1, no toca el store), /api/plan (dry-run contra el store real: creates/updates/unchanged/conflicts/invalid_payloads y un planToken), /api/compile (escribe vía pron.Store, y solo si recibe el planToken de un plan previo; sin token responde 409, porque la KB pudo cambiar fuera de la sesión) y /api/export (el estado del store como el mismo contrato v1). La garantía es el round-trip: exportar, planear y compilar en un store vacío y reexportar devuelve exactamente el mismo JSON (modelos, payloads y layout). Las escrituras rechazan Origin cruzado (403), cuerpos de más de 5 MB (413) y JSON malformado o que no sea objeto (400). tests/test_mindmap_endpoints.py lo prueba contra un servidor HTTP real y tests/e2e_mindmap_compiler.py desde el diálogo en el navegador.
