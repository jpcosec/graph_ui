## REFORMULACION

Encargo: modificar `tests/e2e_review_workbench_views.py` del repo en `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui` para que el `vite build` del fixture no deje procesos huérfanos al vencer su timeout (hoy `subprocess.run(..., timeout=300)` mata solo a `npx` y sobreviven `sh -c vite build` y `node .../vite build`). Resultado: el build se lanza con `_spawn` (nueva sesión), se espera con timeout y, al vencer, se detiene con `_stop([proceso])` relanzando un error de timeout; rc≠0 sigue fallando con salida capturada. Se añade una prueba sin navegador con timeout 1-4 s sobre outDir único en `tmp_path` que verifica el error y que ningún `/proc/*/cmdline` contiene ese outDir; se salta sin `node_modules`. Fuera de alcance: `_spawn`/`_stop` más allá de lo mínimo, `tests/test_review_workbench.py`, `_wait` de 60 s y pasos sin timeout. Validación: `python -m pytest -q -rs tests/e2e_review_workbench_views.py` y evidencia en run_dir.

## AMBIGUEDADES

1. "se lanza con _spawn (start_new_session) y se espera con su timeout" — no se define firma ni retorno de `_spawn`/`_stop`; obligaría a inventar su contrato.
2. "se relanza el error (subprocess.TimeoutExpired o uno equivalente con el comando y el tiempo)" — "o uno equivalente" no fija el tipo; obligaría a inventar qué excepción y mensaje asertar.
3. "se salta con el mismo criterio del archivo" — no se cita el criterio; obligaría a inventar la condición de skip.
4. "un timeout muy corto (1-4 s)" — rango sin valor concreto; obligaría a elegir uno (y a decidir si un build real lo excede).
5. "sigue fallando como hoy, con la salida capturada" — "como hoy" no se muestra; obligaría a inventar tipo y formato del error.
6. "correr la prueba nueva sobre HEAD (git archive en /dev/shm)" — no se detalla copia, `node_modules` ni ruta; obligaría a inventar el procedimiento.
7. "La evidencia queda en el run_dir" — ruta y formato no especificados; obligaría a inventar dónde y cómo registrarla.

## DRY-RUN

Lecturas: task doc, `runs/subagents/20261117-vite-huerfano-tester-a1/result-summary.md`, `tests/e2e_review_workbench_views.py` (~143-144, helpers `_spawn`/`_stop`). Cambios previstos: baseline en `/dev/shm` (falla, huérfanos, kill por PID), extraer `_build(dist, timeout)`, nueva prueba en el mismo archivo. Dependencias: helpers existentes, `npx`/`node_modules`. Validaciones futuras: pytest del archivo, `ps` sin procesos con el outDir, evidencia en run_dir.

## FUTURO

Un nodo ejecutor corre la línea base y la validación; un tester/revisor humano confirma la evidencia del run_dir y el cierre.
