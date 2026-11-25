## REFORMULACION

**Propósito:** que la e2e de vistas de review-workbench no deje procesos `vite preview` huérfanos (hoy el `terminate()` llega a `npx` pero sobrevive el hijo `node .../vite preview`, con outDir en `/dev/shm/rw-views-*`).

**Resultado:** fixture de `tests/e2e_review_workbench_views.py` que lanza cada proceso de larga vida en su propio grupo (`start_new_session=True`) y al terminar mata el grupo (SIGTERM, espera, SIGKILL), más una prueba nueva que comprueba que no queda proceso con el outDir de la corrida. Evidencia `ps` antes/después en el run_dir.

**Repo:** graph_ui (workspace desk, host robocop2). Archivos: `tests/e2e_review_workbench_views.py` y, según (2), `tests/test_review_workbench.py`; depende de `apps/review-workbench` (node_modules, vite).

**Límites:** no tocar `tests/test_ci_workflow.py`, el código de `apps/review-workbench` ni `.github/workflows`; nunca `pkill`, solo PID/grupo de la propia corrida; cierre con los dos `pytest` de la sección Validation.

## AMBIGUEDADES

1. "Otra opción válida es invocar el binario apps/review-workbench/node_modules/.bin/vite directamente en lugar de npx, si con eso alcanza; la prueba (2) decide." — exige inventar el criterio de decisión y quién decide.
2. "Una prueba nueva en el mismo archivo, o en tests/test_review_workbench.py si allí encaja mejor" — exige inventar la ubicación.
3. "comprueba con /proc o psutil, si ya es dependencia" — exige inventar el mecanismo y verificar dependencias no mostradas.
4. "no queda vivo ningún proceso que el fixture haya lanzado: vite preview, sldb serve ni serve.py" — el alcance solo detalla grupos para "cada proceso de larga vida"; exige inventar si `sldb serve`/`serve.py` también se agrupan.
5. "La prueba nueva pasa con el fixture arreglado y falla con el de HEAD" — exige inventar el montaje (git archive en /dev/shm) que ejecute la prueba contra el fixture antiguo.

## DRY-RUN

Lecturas: TaskDoc, rituales execution/testing/closeout, ambos tests citados, `apps/review-workbench/package.json`/node_modules. Cambios previstos: `start_new_session=True` en los tres `Popen`; limpieza por `os.killpg`; test nuevo de ausencia de procesos por outDir. Dependencias: node/npx, playwright, `sldb`, `/proc`. Validaciones futuras: los dos `pytest`, `ps` antes/después, prueba nueva roja sobre HEAD.

## FUTURO

Promoción en `Board.md` y ligado de pills (hoy vacías) — humano; ejecución real y captura de evidencia — otro nodo; aceptación del cierre — revisor.
