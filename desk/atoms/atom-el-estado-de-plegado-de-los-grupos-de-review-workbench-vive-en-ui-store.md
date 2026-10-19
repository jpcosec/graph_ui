---
id: atom-el-estado-de-plegado-de-los-grupos-de-review-workbench-vive-en-ui-store
title: El estado de plegado de los grupos de review-workbench vive en ui-store
five_wh_one_plus: where
tags:
- system:graph_ui
- topic:collapse
- layer:review-workbench
provenance: apps/review-workbench/src/stores/ui-store.ts
---

# El estado de plegado de los grupos de review-workbench vive en ui-store

## Answer

En apps/review-workbench, que un grupo esté plegado es estado de vista y vive en useUIStore.collapsedGroups, un mapa de id de grupo a { expandedHeight? }, que se modifica con setGroupCollapsed(id, entry | null). Nunca va en data ni en data.properties del nodo, porque eso es dato de dominio: el inspector lo muestra y es lo que se guardaría por documento con saveDoc. collapseGroupEdges (en hooks/use-edge-inheritance.ts) registra el plegado con la altura actual del grupo, oculta los hijos, redirige sus aristas al grupo como inherited y reduce style.height a COLLAPSED_GROUP_HEIGHT, la altura de la cabecera. expandGroupEdges restaura la altura recordada y borra la entrada. GroupShell decide si está plegado con isCollapsed(id, collapsedGroups).
