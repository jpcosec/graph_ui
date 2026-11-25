---
sldb:
  by: agent
  at: '2026-11-25T18:10:25Z'
  authority: generated
  via: save_document_payload
id: task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion
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

# G-C: la vista de notacion lista tambien los ViewDoc del store y dibuja uno con su notacion

## Rationale

_Explain why this task exists or the business driver behind it._

Pedido de JP via johanes (2026-11-25 11:50, /mnt/ssd/proyectos/SLDB_1/IR/runs/coordinacion-johanes.md): la vista de notacion solo lista SpecDoc (specCatalog en frontends/mindmap/views/specs/notation/notation.mjs:18 filtra model_name === 'SpecDoc') y ninguna vista del frontend consume /api/views; un ViewDoc con notacion se evalua en el servidor pero no se puede ver. Es previo a ver la cadena de specIR con su propia notacion.

## Goal

_Describe the concrete result this task must produce._

Que la vista de notacion liste los ViewDoc del store junto a los SpecDoc y dibuje un ViewDoc con su notacion, reusando el mismo lienzo y layout.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation/ (catalogo y carga), frontends/mindmap/views_routes.py solo si hace falta exponer algo, un test node y una e2e. Fuera: crear ViewDoc desde la UI, la notacion de specIR (va en IR).

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo /mnt/ssd/proyectos/SLDB_1/UIs/graph_ui. specCatalog incluye tambien los ViewDoc que tengan notacion (marcados como vista, agrupados por category si la traen, si no en su propio grupo). Al elegir un ViewDoc, la vista pide su evaluacion (GET /api/views/evaluate?view=ViewDoc:<name>, ver views_routes.py:3-7) y, si el resultado trae lo mismo que GET /api/notation/view para un spec, lo dibuja con el mismo camino (sceneFor + bestLayout); si el payload difiere, adaptarlo en un punto (funcion pura testeada), sin un segundo layout. Test node en tests/mindmap-notation.test.mjs (o uno nuevo): specCatalog con un SpecDoc y un ViewDoc lista ambos. e2e nueva tests/e2e_notation_viewdoc.py: store temporal con un ViewDoc y una notacion propia (sincronizada con sldb notations sync), abre la vista de notacion, el ViewDoc aparece en la lista y al elegirlo se dibujan sus nodos.

Intento 2: el intento 1 (rama deskops/deskops-e-84ca580617e9, commit d3076e4) no se pudo integrar: choca en frontends/mindmap/views/specs/notation/notation-view.js con G-D, ya en master (8f617a4 y d26ff31: corte en el primer candidato legible, ELK en un worker). Rehaz el cambio sobre master actual: parte de d3076e4 (git show d3076e4) y conserva lo de G-D (bestIn, worker de ELK). Corre tests/e2e_mindmap_notation.py y las pruebas de G-D (tests/*.test.mjs que toquen layout) además de las tuyas. No pongas Task-Id en el commit de código.

## Validation

_List the checks required before this task can close._

- node --test tests/mindmap-notation.test.mjs && python -m pytest -q tests/e2e_notation_viewdoc.py tests/e2e_mindmap_notation.py

## Done When

_Name the observable condition that makes the task complete._

La vista de notacion lista y dibuja un ViewDoc con su notacion; el test node y tests/e2e_notation_viewdoc.py pasan junto con tests/e2e_mindmap_notation.py.
