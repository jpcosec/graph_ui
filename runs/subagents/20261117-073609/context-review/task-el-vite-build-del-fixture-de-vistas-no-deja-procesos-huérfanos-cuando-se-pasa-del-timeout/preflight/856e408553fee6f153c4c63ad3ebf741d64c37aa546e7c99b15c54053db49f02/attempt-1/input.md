FILE:desk/tasks/task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout.md
---
sldb:
  by: agent
  at: '2026-11-17T06:21:37Z'
  authority: generated
  via: create_document
id: task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261117-vite-huerfano-tester-a1/result-summary.md
- tests/e2e_review_workbench_views.py
depends_on: []
pills: []
files:
- tests/e2e_review_workbench_views.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# El vite build del fixture de vistas no deja procesos huérfanos cuando se pasa del timeout

## Rationale

_Explain why this task exists or the business driver behind it._

Al cerrar la tarea de los vite preview huérfanos (código 9a609dd), el tester independiente (runs/subagents/20261117-vite-huerfano-tester-a1/result-summary.md, hallazgo 1) encontró el mismo mecanismo en el paso de build. tests/e2e_review_workbench_views.py, líneas ~143-144, corre subprocess.run(["npx", "vite", "build", ...], timeout=300). Si se pasa del timeout, subprocess mata solo a npx, y quedan huérfanos `sh -c vite build` y `node .../vite build`. Lo reprodujo con timeout=4: quedaron los PID 2431866 y 2431868. Con la máquina cargada (colapso de RAM del 2026-11-17), un build lento es justo el caso en que esto pasa.

## Goal

_Describe the concrete result this task must produce._

Si el vite build del fixture se pasa del timeout, el fixture falla con el error del timeout y no queda vivo ningún proceso del build.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) tests/e2e_review_workbench_views.py: el build se lanza con _spawn (start_new_session) y se espera con su timeout. Al vencer, se para con _stop([proceso]) y se relanza el error (subprocess.TimeoutExpired o uno equivalente con el comando y el tiempo). Con rc distinto de 0 sigue fallando como hoy, con la salida capturada. (2) Una prueba nueva, sin navegador, que corre el helper del build con un timeout muy corto (1-4 s) sobre un outDir único en tmp_path. Comprueba que lanza el error de timeout y que, al recorrer /proc/*/cmdline, ningún proceso contiene ese outDir. Si no hay node_modules, se salta con el mismo criterio del archivo. NO ENTRA: cambiar _spawn ni _stop salvo lo mínimo para reusarlos; tests/test_review_workbench.py; el _wait de 60 s y los pasos sin timeout (sldb stores init, notations sync), que son otro hallazgo.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Línea base: correr la prueba nueva sobre HEAD (git archive en /dev/shm) y ver que falla, dejando huérfanos; cortarlos por PID. 2) Extraer un helper _build(dist, timeout) que use _spawn y _stop. 3) Correr la validación. Nunca pkill: solo kill por PID de los procesos de la propia corrida.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/e2e_review_workbench_views.py

## Done When

_Name the observable condition that makes the task complete._

La prueba nueva pasa con el helper y falla sobre HEAD. La e2e completa pasa. Tras las corridas, ps no muestra ningún proceso con el outDir de la corrida. La evidencia queda en el run_dir.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

