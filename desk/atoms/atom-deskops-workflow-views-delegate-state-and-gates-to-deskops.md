---
id: atom-deskops-workflow-views-delegate-state-and-gates-to-deskops
title: Deskops workflow views delegate state and gates to deskops
five_wh_one_plus: how
tags:
- system:graph_ui
provenance: desk/drawer/tasks/task-deskops-workflow-view.md
---

# Deskops workflow views delegate state and gates to deskops

## Answer

La vista workflow/deskops reutiliza el shell, temas y WorkersPanel de Mindmap. Las tareas activas provienen exclusivamente del Board del desk seleccionado; los estados, condiciones y avances proceden de DeskopsOperations. SLDB conserva extracción y persistencia documental. La UI no edita status ni current_node por guardado genérico, no fuerza transiciones y no cierra tareas. El desk se configura explícitamente con DESKOPS_ROOT o el padre del store local; el backend remoto exige DESKOPS_ROOT para workflow. Las referencias rotas, dependencias ausentes y errores son visibles; nunca se presentan como un tablero vacío.
