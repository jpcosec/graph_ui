---
sldb:
  by: agent
  at: '2026-11-17T04:59:48Z'
  authority: generated
  via: save_document_payload
# review-<task>-<kind>-<n>
id: review-task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar-bundle-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: bundle
# kind evidence only: tests | commit | atom | materialization | document | external
fact: ''
# kind evidence only: what the producer verified, one item per line
value: ''
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar@sha256:79c7389c9ac6999d71020aada5077e876ef7837bedb026f7fe13b265248e31d6
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: runtime-pi-deepseek-flash
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: runs/subagents/20261117-045857/context-review/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar/bundle/a7aed430b5fed5b0d0758e4dc80acb6a46402f0a5f84ae66e63aefe739c6011a/attempt-1
input_sha256: a7aed430b5fed5b0d0758e4dc80acb6a46402f0a5f84ae66e63aefe739c6011a
output_sha256: 352fe7a0e6dd80c9a3741579d13e8233bb216169aff1a67b1f7f4cbd88240fd0
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'Verdict accepted. El coordinador resuelve:

  (1) Solución. Grupo de procesos para los 3 Popen de larga vida del fixture: sldb
  serve, serve.py y vite preview. Cada uno se lanza con start_new_session=True; al
  parar va os.killpg(pgid, SIGTERM), wait(timeout=10) y, si no termina, os.killpg(pgid,
  SIGKILL). Se sigue usando npx. La opción del binario directo queda descartada.

  (2) Arranque y parada en helpers. Se extraen dos helpers en tests/e2e_review_workbench_views.py,
  _spawn(cmd, **kw) -> Popen y _stop(processes), y el fixture los usa. No se duplica
  el fixture.

  (3) Prueba nueva, en el mismo archivo y sin navegador. Con _spawn lanza [''npx'',
  ''vite'', ''preview'', ''--outDir'', <dir único en tmp_path>, ''--port'', <libre>,
  ''--strictPort'', ''--host'', ''127.0.0.1''] en cwd=APP. Espera a que el puerto
  responda, llama a _stop y comprueba recorriendo /proc/*/cmdline (sin psutil, que
  no es dependencia) que ningún proceso contiene ese outDir. Si apps/review-workbench/node_modules
  no existe, se salta con el mismo criterio que ya use el archivo.

  (4) Control negativo. En una copia en /dev/shm se reemplaza el cuerpo de _stop por
  el código viejo (terminate, wait y kill sobre el Popen) y la prueba nueva debe fallar.
  Si falla, la huérfana se corta por PID.

  (5) Evidencia en runs/subagents/20261117-vite-huerfano-executor-a1/: ps-antes.txt,
  ps-despues.txt, control-negativo.log y los logs de la validación.

  (6) tests/test_review_workbench.py no se toca; solo se corre como validación.

  El ejecutor no hace commit ni push.'
# ISO 8601 timestamp
created_at: '2026-11-17T04:59:09.785775+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-17T04:59:46.082350+00:00'
disposed_by: graph_ui
# e.g. workspace:desk
tags:
- workspace:desk
---

# Bundle review of task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar

## Summary

_Summarize what was reviewed and the evidence this receipt records._

bundle review; engine runtime-pi-deepseek-flash; evidence under runs/subagents/20261117-045857/context-review/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar/bundle/a7aed430b5fed5b0d0758e4dc80acb6a46402f0a5f84ae66e63aefe739c6011a/attempt-1.

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: Verdict accepted. El coordinador resuelve:
(1) Solución. Grupo de procesos para los 3 Popen de larga vida del fixture: sldb serve, serve.py y vite preview. Cada uno se lanza con start_new_session=True; al parar va os.killpg(pgid, SIGTERM), wait(timeout=10) y, si no termina, os.killpg(pgid, SIGKILL). Se sigue usando npx. La opción del binario directo queda descartada.
(2) Arranque y parada en helpers. Se extraen dos helpers en tests/e2e_review_workbench_views.py, _spawn(cmd, **kw) -> Popen y _stop(processes), y el fixture los usa. No se duplica el fixture.
(3) Prueba nueva, en el mismo archivo y sin navegador. Con _spawn lanza ['npx', 'vite', 'preview', '--outDir', <dir único en tmp_path>, '--port', <libre>, '--strictPort', '--host', '127.0.0.1'] en cwd=APP. Espera a que el puerto responda, llama a _stop y comprueba recorriendo /proc/*/cmdline (sin psutil, que no es dependencia) que ningún proceso contiene ese outDir. Si apps/review-workbench/node_modules no existe, se salta con el mismo criterio que ya use el archivo.
(4) Control negativo. En una copia en /dev/shm se reemplaza el cuerpo de _stop por el código viejo (terminate, wait y kill sobre el Popen) y la prueba nueva debe fallar. Si falla, la huérfana se corta por PID.
(5) Evidencia en runs/subagents/20261117-vite-huerfano-executor-a1/: ps-antes.txt, ps-despues.txt, control-negativo.log y los logs de la validación.
(6) tests/test_review_workbench.py no se toca; solo se corre como validación.
El ejecutor no hace commit ni push.
