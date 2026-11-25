Task: task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de
Title: una notación con carriles por partición se dibuja con una columna por partición en cualquier tipo de diagrama
Status: active
Current node: ritual-testing
Task type: task.code
Lifecycle gates:
- task_hands_to_closeout -> ritual-closeout: open [nonempty(validation)]
  post-hook evento-para-el-coordinador: sh -c mkdir -p runs/hooks && printf '%s %s %s %s->%s\n' "$(date -u +%FT%TZ)" "$DESKOPS_TASK_ID" "$DESKOPS_TRANSITION" "$DESKOPS_FROM_NODE" "$DESKOPS_TO_NODE" >> runs/hooks/events.log
  post-hook encola-reap-del-tester: deskops queue add dispatch-reap --root .

---
sldb:
  by: agent
  at: '2026-11-25T21:32:15Z'
  authority: generated
  via: save_document_payload
id: task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de
status: active
summary: ''
tags: []
current_node: ritual-testing
history:
- task_activates
references: []
depends_on: []
pills: []
files: []
pointers: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# una notación con carriles por partición se dibuja con una columna por partición en cualquier tipo de diagrama

## Rationale

_Explain why this task exists or the business driver behind it._

ADR sldb/docs/architecture/mechanism-in-sldb-content-in-specir.md (JP, 2026-11-25): una notación pide un tipo de layout, no trae uno, y no hay código por notación. Hoy los carriles por partición solo existen para la actividad UML (views/specs/notation/notation-swimlanes.mjs, por data.partition) y el layout lanes es el de secuencia. BPMN y la notación de capas de specIR necesitan carriles y no los tienen.

## Goal

_Describe the concrete result this task must produce._

Que el layout de carriles por partición sea una capacidad genérica de la vista de notación, que cualquier notación pueda pedir.

## Scope

_State what is in scope and what is out of scope._

Dentro: frontends/mindmap/views/specs/notation/ (notation.mjs, notation-swimlanes.mjs, notation-layout.mjs). Fuera: la notación BPMN y la de capas (son de specIR), eventos y compuertas como formas nuevas.

## Implementation Path

_Outline the expected implementation route or affected surface._

Leer docs/representacion/README.md. Si hace falta un tipo de layout que sldb no acepta hoy (sldb/src/sldb/notations/notation_constants.py, LAYOUT_KINDS), pedirlo por el inbox de sldb con deskops message send; no se resuelve en graph_ui.

Aclaraciones de la revisión: Repo: /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui (frontends/mindmap/views/specs/notation/ y docs/representacion/README.md de graph_ui; ignorar la línea de apps/review-workbench del ritual). Mecanismo: la NotationDoc declara layout: {kind: partition-lanes, by: <campo del nodo>} y la vista lo lee como dato, sin rama por nombre de notación; el título de cada columna es el valor de ese campo. La notación de prueba se crea como fixture en tests/fixtures/ (p. ej. una notación de componentes con by: layer) y tests/notation-partition-lanes.test.mjs se crea. 'Igual que antes' para la actividad = el test e2e existente de actividad pasa sin cambiar sus aserciones. La regla de 'sin rama' aplica a toda la carpeta notation/. Parte de master actual (después de G-C intento 2). No poner Task-Id en el commit de código.

## Validation

_List the checks required before this task can close._

- node --test tests/notation-partition-lanes.test.mjs
- python -m pytest -q tests/e2e_notation_activity.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

Una notación de prueba que no es la de actividad, con nodos repartidos en tres particiones, se dibuja con tres columnas con su título y cada nodo dentro de la suya. La actividad UML se dibuja igual que antes. En el código de la vista no hay ninguna rama por nombre de notación ni por tipo de diagrama.

## Como probar (tester)

Ubica el trabajo del ejecutor:

    git log -1 --format=%H --grep "Task-Id: task-una-notacion-con-carriles-por-particion-se-dibuja-con-una-columna-por-particion-en-cualquier-tipo-de"   # commit del ejecutor
    git show --name-only <commit>                           # sus archivos

Los tests a correr son los archivos tests/*.py de ese commit, mas tests/test_<modulo>.py cuando exista para cada modulo de codigo tocado; de a uno, con `TMPDIR=/tmp python -m pytest -q <archivo>`. No corras la suite completa: la corre integrate en el host.

Escribe result-summary.md con el veredicto PASA o FALLA en la primera linea.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-7c62dc444282"
