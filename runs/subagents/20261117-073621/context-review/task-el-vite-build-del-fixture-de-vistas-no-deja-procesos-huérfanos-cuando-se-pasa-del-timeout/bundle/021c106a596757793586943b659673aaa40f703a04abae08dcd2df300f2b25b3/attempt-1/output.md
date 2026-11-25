REFORMULACION
Propósito: que el `vite build` del fixture de vistas no deje procesos huérfanos al vencer su timeout; hoy `subprocess.run([...], timeout=300)` mata solo a npx y sobreviven `sh -c vite build` y `node .../vite build`. Resultado: helper `_build(dist, timeout)` que lanza con `_spawn` (nueva sesión), y al vencer para con `_stop([proceso])` y relanza el error; más una prueba sin navegador que fuerza el timeout sobre un outDir único en `tmp_path` y comprueba en `/proc/*/cmdline` que nadie lo conserva. Repo: graph_ui; archivo único `tests/e2e_review_workbench_views.py`. Límites: no tocar `_spawn`/`_stop` salvo reuso mínimo, no `tests/test_review_workbench.py`, no el `_wait` de 60 s ni los pasos sin timeout. Pills y átomos ligados: ninguno.

AMBIGUEDADES
1. "se relanza el error (subprocess.TimeoutExpired o uno equivalente con el comando y el tiempo)": no fija tipo ni mensaje; obliga a inventar el contrato de `_build`.
2. "correr la prueba nueva sobre HEAD (git archive en /dev/shm) y ver que falla": en HEAD la prueba nueva no existe; obliga a inventar cómo obtener la línea base.
3. "timeout muy corto (1-4 s)": rango sin valor ni mecanismo que garantice que el build lo exceda; obliga a inventar la determinación.
4. "Con rc distinto de 0 sigue fallando como hoy, con la salida capturada": no dice qué excepción o retorno preserva el helper; obliga a inventar la semántica.
5. "solo kill por PID de los procesos de la propia corrida": no define cómo se identifica esa pertenencia (¿marcador del outDir?); obliga a inventarlo.

DRY-RUN
Lecturas: TaskDoc, rituales execution/testing/closeout, `tests/e2e_review_workbench_views.py` y `runs/subagents/20261117-vite-huerfano-tester-a1/result-summary.md`. Cambios previstos: extraer `_build(dist, timeout)` con `_spawn`/`_stop`; sustituir el `subprocess.run` del fixture; añadir prueba de timeout que escanea `/proc/*/cmdline` buscando el outDir, y salta sin npx/node_modules o sin `/proc`. Dependencias: npx, `apps/review-workbench/node_modules`, `/proc` de Linux. Validaciones futuras: `python -m pytest -q -rs tests/e2e_review_workbench_views.py`, comprobar con `ps` la ausencia del outDir y guardar evidencia en el run_dir. No se ejecuta nada; el nodo es ejecutable (task.code), no agregado.

FUTURO
Decisión humana/revisión: aceptar el tipo y mensaje del error de timeout y validar la línea base sin la prueba en HEAD. Otro nodo: tester independiente reproduce el hallazgo; closeout actualiza `Board.md` y registra el commit atómico. Queda como tarea aparte el hallazgo del `_wait` de 60 s y los pasos sin timeout.
