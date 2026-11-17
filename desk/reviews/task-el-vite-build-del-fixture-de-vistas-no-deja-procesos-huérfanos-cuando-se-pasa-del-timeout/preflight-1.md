---
sldb:
  by: agent
  at: '2026-11-17T07:37:05Z'
  authority: generated
  via: save_document_payload
# review-<task>-<kind>-<n>
id: review-task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout-preflight-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: preflight
# kind evidence only: tests | commit | atom | materialization | document | external
fact: ''
# kind evidence only: what the producer verified, one item per line
value: ''
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout@sha256:25ecd566763e4f390fc692e6fb008e1953bd3164dfa106b4f6dd9c02a4665dab
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: runtime-pi-deepseek-flash
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: runs/subagents/20261117-073609/context-review/task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout/preflight/856e408553fee6f153c4c63ad3ebf741d64c37aa546e7c99b15c54053db49f02/attempt-1
input_sha256: 856e408553fee6f153c4c63ad3ebf741d64c37aa546e7c99b15c54053db49f02
# preflight/bundle: SHA-256 of the input with the TaskDoc replaced by its __contract__ digest
contract_sha256: d2e0fae49768e61b691ad3431506d544f40eed08549cd458064b1e2123c2fd91
output_sha256: 65d1f6925dda52031b7a471059079584518e4532cdd8e24676b33212572d7d9c
# pending | accepted | rejected | incomplete
verdict: accepted
reason: "Verdict accepted. El coordinador fija el contrato contra el código de 9a609dd\
  \ (tests/e2e_review_workbench_views.py):\n(1) Helpers existentes: _spawn(cmd, **kw)\
  \ -> Popen (línea 71) y _stop(processes, timeout=10) -> None (línea 92). Se reusan\
  \ sin cambios.\n(2) Helper nuevo: _build(dist: Path, timeout: float = 300) -> None.\
  \ Lanza _spawn(['npx', 'vite', 'build', '--outDir', str(dist), '--emptyOutDir'],\
  \ cwd=APP, stdout=<archivo dist.parent/'vite-build.log'>, stderr=subprocess.STDOUT);\
  \ usa un archivo y no PIPE, para no bloquear. Luego process.wait(timeout).\n  -\
  \ Si vence: _stop([process]) y raise subprocess.TimeoutExpired(cmd, timeout). El\
  \ tipo es exactamente subprocess.TimeoutExpired.\n  - Si rc != 0: raise subprocess.CalledProcessError(rc,\
  \ cmd, output=<texto del log>). Es el mismo tipo que hoy da check=True.\n  - El\
  \ fixture llama a _build(dist).\n(3) Criterio de skip: el mismo del fixture (líneas\
  \ 123-124), shutil.which('npx') and (APP/'node_modules').is_dir(), con el mismo\
  \ mensaje.\n(4) Timeout de la prueba: 1 s, con pytest.raises(subprocess.TimeoutExpired).\
  \ Basta el arranque de npx para pasarlo.\n(5) Pertenencia: un proceso es de la corrida\
  \ si su /proc/<pid>/cmdline contiene el outDir único de esa corrida (en tmp_path).\
  \ Se reusa _holding(marker), que ya existe.\n(6) Control negativo: en una copia\
  \ en /dev/shm, el cuerpo de _build se reemplaza por el código viejo, subprocess.run([...],\
  \ cwd=APP, check=True, capture_output=True, timeout=timeout). La prueba nueva debe\
  \ fallar porque queda un proceso con el outDir. Esos procesos se cortan por PID.\n\
  (7) Evidencia en runs/subagents/20261117-vite-build-executor-a1/: ps-antes.txt y\
  \ ps-despues.txt filtrados por el outDir, control-negativo.log, diff.patch y los\
  \ logs.\nEl ejecutor no hace commit ni push."
# ISO 8601 timestamp
created_at: '2026-11-17T07:36:18.142302+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-17T07:37:03.463807+00:00'
disposed_by: graph_ui
# e.g. workspace:desk
tags:
- workspace:desk
---

# Preflight review of task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout

## Summary

_Summarize what was reviewed and the evidence this receipt records._

preflight review; engine runtime-pi-deepseek-flash; evidence under runs/subagents/20261117-073609/context-review/task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout/preflight/856e408553fee6f153c4c63ad3ebf741d64c37aa546e7c99b15c54053db49f02/attempt-1.

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: Verdict accepted. El coordinador fija el contrato contra el código de 9a609dd (tests/e2e_review_workbench_views.py):
(1) Helpers existentes: _spawn(cmd, **kw) -> Popen (línea 71) y _stop(processes, timeout=10) -> None (línea 92). Se reusan sin cambios.
(2) Helper nuevo: _build(dist: Path, timeout: float = 300) -> None. Lanza _spawn(['npx', 'vite', 'build', '--outDir', str(dist), '--emptyOutDir'], cwd=APP, stdout=<archivo dist.parent/'vite-build.log'>, stderr=subprocess.STDOUT); usa un archivo y no PIPE, para no bloquear. Luego process.wait(timeout).
  - Si vence: _stop([process]) y raise subprocess.TimeoutExpired(cmd, timeout). El tipo es exactamente subprocess.TimeoutExpired.
  - Si rc != 0: raise subprocess.CalledProcessError(rc, cmd, output=<texto del log>). Es el mismo tipo que hoy da check=True.
  - El fixture llama a _build(dist).
(3) Criterio de skip: el mismo del fixture (líneas 123-124), shutil.which('npx') and (APP/'node_modules').is_dir(), con el mismo mensaje.
(4) Timeout de la prueba: 1 s, con pytest.raises(subprocess.TimeoutExpired). Basta el arranque de npx para pasarlo.
(5) Pertenencia: un proceso es de la corrida si su /proc/<pid>/cmdline contiene el outDir único de esa corrida (en tmp_path). Se reusa _holding(marker), que ya existe.
(6) Control negativo: en una copia en /dev/shm, el cuerpo de _build se reemplaza por el código viejo, subprocess.run([...], cwd=APP, check=True, capture_output=True, timeout=timeout). La prueba nueva debe fallar porque queda un proceso con el outDir. Esos procesos se cortan por PID.
(7) Evidencia en runs/subagents/20261117-vite-build-executor-a1/: ps-antes.txt y ps-despues.txt filtrados por el outDir, control-negativo.log, diff.patch y los logs.
El ejecutor no hace commit ni push.
