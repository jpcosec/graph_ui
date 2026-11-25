---
sldb:
  by: agent
  at: '2026-11-25T14:11:14Z'
  authority: generated
  via: create_document
id: task-el-panel-embebido-lleva-el-tema-y-el-localstorage-con-alcance-a-su-contenedor
status: draft
summary: ''
tags: []
current_node: ritual-execution
history: []
references: []
depends_on:
- task-la-vista-de-notacion-de-graph-ui-se-monta-en-cualquier-pagina-con-mount-contenedor-opciones-sin-el-c
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# El panel embebido lleva el tema y el localStorage con alcance a su contenedor

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP (2026-11-25), brief de johanes en /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md (G-A/G-B). G-A: un panel de edicion embebible en cualquier UI con las mismas funciones que en graph_ui. Paso 3 de G-A: hoy el tema va en data-skin de <html> y hay claves globales de localStorage (kb-skin, kb-notation-spec, kb-editor-route), que chocan con la pagina anfitriona o con dos paneles.

## Goal

_Describe the concrete result this task must produce._

Que el tema se aplique en el contenedor (data-skin en el contenedor, css con alcance) y que las claves de almacenamiento lleven un prefijo por instancia (opcion storageKey de mount, default el de hoy en graph_ui).

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/embed/, donde se leen/escriben data-skin y kb-* (grep), y la e2e de embed. Fuera: otras vistas.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. grep -rn "data-skin\|kb-skin\|kb-notation-spec\|kb-editor-route\|localStorage" frontends/mindmap para el inventario. En graph_ui todo se comporta igual (default). Extender tests/e2e_embed_notation.py: dos paneles en la misma pagina con temas distintos y specs distintas no se pisan, y <html> de la anfitriona no cambia de data-skin.

## Validation

_List the checks required before this task can close._

- python -m pytest -q tests/e2e_embed_notation.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

Dos paneles embebidos con tema y spec distintos conviven sin pisarse y sin tocar <html>; la e2e de embed y la de notacion pasan.
