---
sldb:
  by: agent
  at: '2026-11-17T04:59:41Z'
  authority: generated
  via: save_document_payload
# review-<task>-<kind>-<n>
id: review-task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar-preflight-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: preflight
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
run_dir: runs/subagents/20261117-045839/context-review/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar/preflight/bb47f93556df8cd32844bb9f7a9febc5730f6bf059c9ba5f357a4e6bcbc54848/attempt-1
input_sha256: bb47f93556df8cd32844bb9f7a9febc5730f6bf059c9ba5f357a4e6bcbc54848
output_sha256: 9ce9bb93e189263c7e9ea3ee523ec9f0aacce57ee5d10bf53dd25844e44e7b12
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
created_at: '2026-11-17T04:58:51.599091+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-17T04:59:38.678692+00:00'
disposed_by: graph_ui
# e.g. workspace:desk
tags:
- workspace:desk
---

# Preflight review of task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar

## Summary

_Summarize what was reviewed and the evidence this receipt records._

preflight review; engine runtime-pi-deepseek-flash; evidence under runs/subagents/20261117-045839/context-review/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar/preflight/bb47f93556df8cd32844bb9f7a9febc5730f6bf059c9ba5f357a4e6bcbc54848/attempt-1.

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
