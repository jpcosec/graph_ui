---
sldb:
  by: agent
  at: '2026-11-16T16:26:08Z'
  authority: generated
  via: create_document
id: materialization-la-ui-del-desk-dibuja-estado-gates-y-findings-tal-como-los-entrega-deskops-view
title: La UI del desk dibuja estado, gates y findings tal como los entrega deskops
  view
source_atoms:
- atom-deskops-workflow-views-delegate-state-and-gates-to-deskops
target_kind: code
target_identity: frontends/desk
validation:
- python -m pytest -q tests/e2e_desk_ui.py tests/test_desk_ui_routes.py
tags: []
---

# La UI del desk dibuja estado, gates y findings tal como los entrega deskops view

## Intent

frontends/desk muestra el Board, la Tarea y sus gates (relation, condición, holds y los findings de las reglas con nivel, code y what) exactamente como los entrega deskops view; no decide estado ni avanza por su cuenta.
