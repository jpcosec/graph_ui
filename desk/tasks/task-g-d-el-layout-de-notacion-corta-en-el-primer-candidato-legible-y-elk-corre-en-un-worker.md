---
sldb:
  by: agent
  at: '2026-11-25T16:08:08Z'
  authority: generated
  via: save_document_payload
id: task-g-d-el-layout-de-notacion-corta-en-el-primer-candidato-legible-y-elk-corre-en-un-worker
status: ready_for_testing
summary: ''
tags: []
current_node: ritual-closeout
history:
- task_activates
- task_hands_to_closeout
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

Intento 2 (tester FALLA en runs/subagents/exec-deskops-t-475a7d5409d5-testing, sobre 8f617a4). Partir de ese commit y corregir: (1) REGRESION: el corte temprano de bestIn en notation-layout.mjs rompe state.diagram-sync-lifecycle: tests/e2e_mindmap_notation.py::test_specs_view_draws_nest_markers_compartments_and_terminals da margen 5.0 (< 8) en assert_nodes_framed (tests/e2e_notation_legibility.py:204); el criterio de 'primer candidato aceptable' tiene que incluir lo que hoy hace que bestLayout prefiera el candidato que encuadra bien (comparar contra lo que el puntaje actual premia), de modo que las specs que hoy salen bien den el mismo layout. (2) El tope de corridas es 30 para la actividad de 13 nodos (hoy da 56); si 30 no se puede sin cambiar layouts buenos, dejar el minimo alcanzable y explicarlo en result-summary.md con la cuenta medida. (3) El worker de ELK no puede salir del CDN: servir elk-worker desde graph_ui (archivo vendorizado o ruta del servidor) con fallback al hilo principal. (4) El test node usa el fixture real tests/fixtures/notation-pilots/activity-render-error-handling.yml, no uno sintetico. Validacion: los cuatro comandos de Validation, incluida la e2e de notacion completa.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation-layout.test.mjs tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_mindmap_notation.py tests/e2e_notation_activity.py

## Done When

_Name the observable condition that makes the task complete._

La spec de 13 nodos queda bajo el tope de corridas en la prueba node, las demas dan el mismo layout, ELK corre en un worker, y node --test de layout y la e2e de notacion pasan.
