Task: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
Title: G-D: el layout de notacion corta en el primer candidato legible y ELK corre en un worker
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
  at: '2026-11-25T15:40:51Z'
  authority: generated
  via: save_document_payload
id: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
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
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# G-D: el layout de notacion corta en el primer candidato legible y ELK corre en un worker

## Rationale

_Explain why this task exists or the business driver behind it._

Medido por specir-graph-ui-parity en Chrome (johanes, /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md): activity.render-error-handling (13 nodos, 17 relaciones) hace 99 corridas de ELK y tarda 3,5 s, las demas specs 24 corridas y 0,3-0,5 s. bestLayout (frontends/mindmap/views/specs/notation/notation-layout.mjs:469-523) prueba 24 candidatos y, si el mejor tiene problemas o queda bajo el zoom legible, repite 24 en la otra direccion y otros 24 por direccion sin reservar rotulos. ELK se instancia sin worker (notation-view.js:25): la pagina no responde mientras tanto.

## Goal

_Describe the concrete result this task must produce._

Que bestLayout corte en el primer candidato sin problemas y con zoom legible, que ELK corra en un worker, y que una prueba fije un tope de corridas para esa spec.

## Scope

_State what is in scope and what is out of scope._

notation-layout.mjs (bestLayout), notation-view.js (instancia de ELK), tests node de layout y una e2e o medicion. Fuera: cambiar el layout de las specs que ya salen bien.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. bestLayout: evaluar candidatos en el orden actual y devolver el primero sin problemas y con zoom >= legible; solo si ninguno lo cumple seguir con la otra direccion y luego sin reservar rotulos, como hoy; el resultado para las specs que hoy salen al primer intento no cambia. ELK con worker: elkjs trae elk-worker; instanciarlo con workerUrl servido por graph_ui (o el patron que use la libreria vendorizada), con fallback al hilo principal si el worker no carga. Prueba node en tests/mindmap-notation-layout.test.mjs: con un contador de corridas inyectado, la spec de actividad de 13 nodos (fixture: copiar activity.render-error-handling a tests/fixtures/ si no esta) no pasa de un tope (p. ej. 30) y las specs de fixtures existentes dan el mismo layout que antes.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

## Done When

_Name the observable condition that makes the task complete._

La spec de 13 nodos queda bajo el tope de corridas en la prueba node, las demas dan el mismo layout, ELK corre en un worker, y node --test de layout y la e2e de notacion pasan.

## Como probar (tester)

Ubica el trabajo del ejecutor:

    git log -1 --format=%H --grep "Task-Id: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker"   # commit del ejecutor
    git show --name-only <commit>                           # sus archivos

Los tests a correr son los archivos tests/*.py de ese commit, mas tests/test_<modulo>.py cuando exista para cada modulo de codigo tocado; de a uno, con `TMPDIR=/tmp python -m pytest -q <archivo>`. No corras la suite completa: la corre integrate en el host.

Escribe result-summary.md con el veredicto PASA o FALLA en la primera linea.

## Temporales de pytest

Antes de cualquier pytest exporta, para que sus temporales caigan en el /tmp del contenedor (muere con el agente) y no en el /dev/shm del host:

    export PYTEST_ADDOPTS="--basetemp=/tmp/pytest-deskops-t-475a7d5409d5"
