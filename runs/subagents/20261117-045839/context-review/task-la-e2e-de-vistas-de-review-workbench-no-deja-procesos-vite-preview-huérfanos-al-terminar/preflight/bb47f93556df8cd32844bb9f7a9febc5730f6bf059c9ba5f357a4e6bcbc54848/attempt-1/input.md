FILE:desk/tasks/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar.md
---
sldb:
  by: agent
  at: '2026-11-17T04:53:02Z'
  authority: generated
  via: create_document
id: task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- runs/subagents/20261117-viewsave-executor-a1/result-summary.md
- tests/e2e_review_workbench_views.py
depends_on: []
pills: []
files:
- tests/test_review_workbench.py
- tests/e2e_review_workbench_views.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# La e2e de vistas de review-workbench no deja procesos vite preview huérfanos al terminar

## Rationale

_Explain why this task exists or the business driver behind it._

El fixture de módulo de tests/e2e_review_workbench_views.py (líneas ~78-121) lanza `subprocess.Popen(["npx", "vite", "preview", ...])` y al terminar hace process.terminate() y wait sobre ese Popen. La señal llega a npx, pero el proceso hijo `node .../node_modules/.bin/vite preview` sobrevive. Cada corrida deja un vite preview huérfano escuchando en un puerto, con su outDir en /dev/shm/rw-views-*. El ejecutor de runs/subagents/20261117-viewsave-executor-a1 lo vio en cada corrida. El 2026-11-17 había dos huérfanos del 16-nov (PID 707726 y 969129, unas 15 h vivos) y otros de copias del repo en /dev/shm de otras sesiones. En una máquina con poca RAM y varias sesiones, eso acumula procesos y puertos.

## Goal

_Describe the concrete result this task must produce._

Al terminar `pytest tests/e2e_review_workbench_views.py`, pase o falle, no queda vivo ningún proceso que el fixture haya lanzado: vite preview, sldb serve ni serve.py.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) tests/e2e_review_workbench_views.py: el fixture lanza cada proceso de larga vida en su propio grupo (start_new_session=True) y al terminar manda SIGTERM al grupo con os.killpg(os.getpgid(p.pid)), espera, y si no termina manda SIGKILL al grupo. Otra opción válida es invocar el binario apps/review-workbench/node_modules/.bin/vite directamente en lugar de npx, si con eso alcanza; la prueba (2) decide. (2) Una prueba nueva en el mismo archivo, o en tests/test_review_workbench.py si allí encaja mejor: lanza el fixture o reproduce su arranque y parada, y comprueba con /proc o psutil, si ya es dependencia, que no queda ningún proceso cuyo cmdline contenga el outDir de esa corrida. NO ENTRA: tests/test_ci_workflow.py y tests/test_review_workbench.py fuera de lo que diga (2); el código de apps/review-workbench; .github/workflows.

## Implementation Path

_Outline the expected implementation route or affected surface._

1) Reproducir: correr la e2e una vez y listar con `ps -eo pid,cmd | grep rw-views-` antes y después. Guardar la salida como evidencia de la línea base. 2) Cambiar el fixture. 3) Repetir la corrida y comprobar que no queda nada. 4) Correr la prueba nueva sobre el código viejo (git archive HEAD en /dev/shm) para ver que falla. Nunca usar pkill: cortar solo por PID los procesos de la propia corrida.

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/e2e_review_workbench_views.py
- python -m pytest -q -rs tests/test_review_workbench.py

## Done When

_Name the observable condition that makes the task complete._

Tras correr la e2e, `ps -eo cmd` no muestra ningún vite preview con el outDir de esa corrida. La prueba nueva pasa con el fixture arreglado y falla con el de HEAD. La validación pasa. La evidencia de ps antes y después queda en el run_dir.

FILE:instruccion
Preflight solo-TaskDoc de la tarea task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar: reformula el encargo tal como lo leería un ejecutor sin ningún otro contexto, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

