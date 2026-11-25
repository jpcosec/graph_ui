## REFORMULACION
**Propósito:** corregir la e2e de vistas de review-workbench para que no deje procesos `vite preview` huérfanos. **Resultado:** al terminar `pytest tests/e2e_review_workbench_views.py`, pase o falle, no queda vivo ningún proceso lanzado por el fixture (`vite preview`, `sldb serve`, `serve.py`); una prueba nueva lo detecta y falla contra HEAD. **Repo:** no se nombra explícitamente; las rutas relativas (`tests/...`, `apps/review-workbench`) presuponen la raíz del proyecto. **Límites:** entra el fixture y una prueba nueva en el mismo archivo o en `tests/test_review_workbench.py`; no entra `tests/test_ci_workflow.py`, el código de `apps/review-workbench` ni `.github/workflows`. Prohibido `pkill`: solo PIDs de la propia corrida.

## AMBIGUEDADES
1. “o en tests/test_review_workbench.py si allí encaja mejor”: no hay criterio objetivo; obligaría a inventar qué significa “encajar mejor”.
2. “Otra opción válida es invocar el binario ... directamente ... si con eso alcanza; la prueba (2) decide”: la prueba aún no existe y no se define qué resultado la hace decidir; obligaría a inventar prioridad entre ambas soluciones.
3. “lanza el fixture o reproduce su arranque y parada”: no se especifica cómo reproducirlo sin duplicar el fixture; obligaría a inventar una API o duplicación.
4. “La evidencia de ps antes y después queda en el run_dir”: no se define `run_dir` ni nombres/formato; obligaría a inventar ubicación y artefactos.
5. “no queda vivo ningún proceso que el fixture haya lanzado: vite preview, sldb serve ni serve.py”: el rationale solo describe `vite preview`; obligaría a inventar qué otros fixtures/procesos existen.

## DRY-RUN
Lecturas: TaskDoc, `tests/e2e_review_workbench_views.py` (fixture ~78-121), `tests/test_review_workbench.py`, resumen de referencia y estado HEAD. Cambios previstos: `start_new_session=True`; terminación con `os.killpg(os.getpgid(p.pid))`, `SIGTERM`, espera y `SIGKILL`; alternativa de binario directo; prueba nueva que verifique cmdlines contra el `outDir`. Dependencias: pytest, Node/npx/vite, `/proc` o psutil si ya existe, `git archive` y un `run_dir`. Validaciones futuras: los dos pytest indicados, comprobación `ps` antes/después y fallo de la prueba nueva sobre HEAD.

## FUTURO
Un ejecutor producirá el diff y la evidencia; un humano decidirá ubicación final de la prueba y aceptará la solución; otro nodo/CI ejecutará las validaciones y confirmará ausencia de procesos.
