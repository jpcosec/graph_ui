---
sldb:
  by: agent
  at: '2026-11-21T06:29:07Z'
  authority: generated
  via: save_document_payload
id: task-respaldar-el-enlace-workbench-de-la-pagina-de-tarea-con-prueba-y-sacar-las-urls-base-a-configuracion
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references:
- desk/inbox/20261121-032547-suggestion-enlace-workbench-36adfbb-entr-a-master-sin-tarea-ni-prueba-url-fija.md
depends_on: []
pills: []
files: []
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Respaldar el enlace Workbench de la página de tarea con prueba y sacar las URLs base a configuración

## Rationale

_Explain why this task exists or the business driver behind it._

Nota de JP desk/inbox/20261121-032547-suggestion-enlace-workbench-36adfbb-entr-a-master-sin-tarea-ni-prueba-url-fija.md: el commit 36adfbb agregó el enlace 'Workbench ↗' (frontends/desk/app.js WORKBENCH_BASE = 'http://127.0.0.1:5174/' y frontends/desk/task.js) directo a master, sin tarea ni prueba y con la URL fija. INSPECT_BASE ('http://127.0.0.1:8090/', app.js:7, e index.html:32) tiene el mismo problema.

## Goal

_Describe the concrete result this task must produce._

Que la base del enlace Workbench (y la de Inspeccionar) se lea de configuración del servidor del desk en vez de constantes fijas en app.js, con valores por defecto iguales a los actuales, y que una prueba cubra el href del enlace Workbench de la página de tarea.

## Scope

_State what is in scope and what is out of scope._

frontends/desk/serve.py (exponer las bases configurables, p. ej. por variables DESK_UI_WORKBENCH_URL y DESK_UI_INSPECT_URL o un endpoint de configuración junto a los existentes), frontends/desk/app.js, frontends/desk/task.js, frontends/desk/index.html y las pruebas tests/test_desk_ui_routes.py y tests/e2e_desk_ui.py. Fuera de alcance: cambiar el destino o los parámetros del enlace (doc=TaskDoc:<id>&lens=fierros) y cualquier otro frontend.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) En frontends/desk/serve.py leer la base del workbench y la de inspect desde el entorno (por defecto http://127.0.0.1:5174/ y http://127.0.0.1:8090/) y entregarlas al shell sin URLs externas fijas (test_shell_files_are_served_and_have_no_external_urls debe seguir pasando). 2) En app.js reemplazar las constantes WORKBENCH_BASE e INSPECT_BASE por los valores servidos. 3) Agregar prueba de ruta que verifique que la configuración servida refleja la variable de entorno y el valor por defecto. 4) En tests/e2e_desk_ui.py agregar la aserción del href del enlace Workbench en la página de tarea (prefijo de la base y doc=TaskDoc%3A<id>).

## Validation

_List the checks required before this task can close._

- TMPDIR=/dev/shm python -m pytest -q tests/test_desk_ui_routes.py
- TMPDIR=/dev/shm python -m pytest -q tests/e2e_desk_ui.py
- grep -n '127.0.0.1:5174' frontends/desk/app.js devuelve vacío

## Done When

_Name the observable condition that makes the task complete._

Ninguna URL http://127.0.0.1:5174/ ni :8090/ queda fija en frontends/desk/app.js; la base del Workbench y de Inspeccionar se configuran por entorno con los defaults actuales; hay prueba de ruta y aserción e2e del enlace Workbench; las pruebas tocadas pasan.
