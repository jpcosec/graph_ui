# Tester independiente: vite preview huérfano (task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar)

## Veredicto: PASS

El cambio en `tests/e2e_review_workbench_views.py` (sin commitear, sobre HEAD ca08ae0) cumple el contrato y la Disposition de preflight-1: hay helpers `_spawn`/`_stop`, el fixture los usa con start_new_session y killpg TERM→wait 10 s→KILL, la prueba nueva no usa navegador y lee /proc, y se salta con el criterio del archivo. El control negativo falla y no queda ningún proceso de mis corridas. Hay hallazgos menores (abajo); ninguno bloquea.

Entorno: venv /dev/shm/vite-t1 con Python 3.13 y uv. sldb viene de `origin/main` 472f1c80, deskops de HEAD 0bc4206a y pron de HEAD 79e384c, más pytest y playwright (chromium headless shell). Todo pytest corrió con `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm python -m pytest -q -rs -p no:cacheprovider --basetemp=/dev/shm/vite-t1/bt`, sin -n y de a uno. El script es `scripts/run.sh`. Por cada corrida se guardan `ps-antes`, `ps-durante` (muestreo de ps), `ps-despues` y `ps-despues-filtrado` (el filtro por outDir y puertos de MI corrida).

## 1. Validación de la tarea

| corrida | resultado | huérfanos de mi corrida después |
|---|---|---|
| `e2e.pytest.log` (carga ~300) | 1 passed y 3 errors. `test_stop` pasó, pero el fixture `stack` dio timeout en `_wait` de vite preview :48767: npx no llegó a lanzar node en 60 s por la carga | ninguno (`e2e.ps-despues-filtrado.txt` vacío; outDir rw-views-hspn8a1z, puertos 34399/48767/49501/37073) |
| `e2e-r2.pytest.log` (carga ~300) | rc=124: el `timeout 900` externo lo mató sin salida (stdout en buffer). Es ambiental | ninguno (`e2e-r2.ps-despues-filtrado.txt` vacío) |
| **`e2e-r3.pytest.log`** (carga ~34) | **4 passed in 126 s** | **ninguno**: `e2e-r3.ps-despues-filtrado.txt` vacío. Durante la corrida se vieron sldb serve :38829, serve.py :41995 y npm exec→sh→node vite preview :47951 (outDir /dev/shm/rw-views-oi_7icfd/dist), cada uno con pgid propio, y `rw-views-stop` :37297. Después no quedó ninguno y el outDir fue borrado |
| **`test-review-workbench.pytest.log`** | **3 passed in 116 s** | ninguno (vitest terminó; `ps-despues-filtrado` vacío) |

Los vite preview ajenos (/dev/shm/gui, /dev/shm/cc34ui y SLDB_1-wip: PID 1327477, 1984202 y 3566546) no se tocaron.

## 2. Control negativo propio

Copia de HEAD en /dev/shm/vite-t1/neg (git archive de tests, apps/review-workbench y frontends; node_modules como symlink) con el archivo nuevo encima, y el cuerpo de `_stop` reemplazado por el de HEAD: terminate, wait(10) y kill sobre el Popen (`copias/control-negativo.diff`). Resultado (`control-negativo.pytest.log`): **1 failed**: `AssertionError: processes still holding .../rw-views-stop after _stop: [2425979]`. El PID 2425979 era `node .../.bin/vite preview` (la cadena fue npm exec→sh -c→node). La limpieza de la propia prueba lo mató, y `control-negativo.ps-despues.txt` no muestra nada de vite-t1/bt. La prueba nueva discrimina.

## 3. Robustez de `_stop` (`robustez-stop.log`, `scripts/robust.py`, importa el archivo real)

- Proceso que ignora SIGTERM (`trap "" TERM; sleep & wait`): `_stop` tarda 10.02 s, rc=-9, no queda nada. Hay SIGKILL al grupo a los 10 s.
- Proceso ya muerto: como zombie (sin reapear) tarda 0.00 s, sin excepción y rc=3. Ya reapeado con `wait()`: 0.00 s, sin excepción.
- Nietos (3 niveles de bash/sleep): `_stop` tarda 0.10 s y no queda ninguno.
- Líder muerto con nieto vivo en el grupo: se mata con TERM. Si el nieto ignora TERM, cae con KILL a los 10.08 s. `_group_alive` reapea al líder y sigue mirando el grupo.
- Tres grupos, dos tercos: 10.01 s en total, porque el plazo es compartido y no se suma por proceso. No queda ninguno.
- Un descendiente que hace `setsid` escapa (esperable: sale del grupo). npx/npm/sh/node vite no lo hacen. Lo maté por PID.

## 4. Fallo a mitad del fixture

Lectura del código: los `_spawn` se agregan a `processes` antes de cada `_wait`, y todo el cuerpo está dentro de `try/finally: _stop(processes)` (e2e_review_workbench_views.py:127-152). Un fallo después de 1, 2 o 3 procesos para todos los que se lanzaron.

Simulación en una copia (/dev/shm/vite-t1/mid, `copias/mid-*.diff`):
- `raise` tras lanzar sldb serve (1 proceso): `mid-e2e_mid1.pytest.log` da 3 errors con `SIMULATED`. `ps-despues` no tiene nada de rw-views-ku5vaqrf.
- `raise` tras lanzar 2 procesos y esperar a sldb serve: `mid-e2e_review_workbench_views.pytest.log` da 3 errors. serve.py :38067 se vio vivo durante la corrida y en `ps-despues` no aparece nada.
- Caso natural con 3 procesos: la corrida 1 (`e2e.pytest.log`) falló por el timeout de `_wait` de vite preview y no dejó huérfanos.

## 5. Sin node_modules

Copia sin `apps/review-workbench/node_modules` (`sin-node-modules.pytest.log`): `SKIPPED [1] tests/e2e_review_workbench_views.py:171: review-workbench needs node and `npm ci` in apps/review-workbench`, rc=0. Es el mismo criterio y el mismo mensaje que el fixture (líneas 123-124).

## 6. Alcance

`git diff --stat` muestra solo `tests/e2e_review_workbench_views.py | 99 +++++---` (`git-diff-stat.txt`). `git diff --quiet -- tests/test_review_workbench.py` sale 0. No se tocaron apps, .github ni frontends.

## Hallazgos

1. **Baja.** e2e_review_workbench_views.py:143-144: `subprocess.run(["npx", "vite", "build", ...], timeout=300)`. Si se pasa del timeout, `subprocess.run` mata solo npx, y `sh -c vite build` y `node .../vite build` quedan huérfanos con ppid 1. Es el mismo mecanismo del bug original, ahora en el build, que es de vida corta. Lo reproduje con timeout=4 (`vite-build-timeout.log`): quedaron vivos 2431866 (sh) y 2431868 (node vite build) y los maté por PID. El contrato y la Disposition nombran solo los 3 procesos de larga vida, así que esto no incumple. El Goal dice "ningún proceso que el fixture haya lanzado", así que conviene una tarea aparte: `_spawn` más `wait(timeout)` más `_stop`, o killpg en el except.
2. **Baja / info.** e2e_review_workbench_views.py:108: `process.wait(timeout=timeout)`, que corre después del SIGKILL, puede lanzar `TimeoutExpired` si el líder queda en estado D. Dentro del `finally` del fixture (línea 151), esa excepción taparía el error original y saltaría `shutil.rmtree(work)` de la línea 152. Es improbable.
3. **Baja / ambiental.** e2e_review_workbench_views.py:181: la prueba nueva reusa `_wait` con su default de 60 s (línea 58). Con carga ~200-300 (otra suite IR con xdist en la máquina), npx tardó más de 60 s en lanzar node en el fixture (corrida 1), y la corrida 2 se colgó hasta el timeout externo de 900 s sin salida. No pude localizar el paso; hay pasos previos sin timeout, como `sldb stores init` y `notations sync` en las líneas 114-115 y 132-134. Con carga normal (corrida 3) todo pasa en 126 s. No es regresión del cambio, pero la prueba nueva hereda la flakiness bajo carga. En ninguna de esas corridas fallidas quedaron huérfanos.
4. **Info.** e2e_review_workbench_views.py:83-89: los descendientes que hacen `setsid` escapan del grupo. npx y vite no lo hacen, así que no aplica hoy.

## Limpieza

Maté por PID solo procesos propios: los nietos de las pruebas de robustez (los mató el propio script) y el build huérfano 2431866/2431868. Nunca usé pkill ni killall. Al final no quedó ningún proceso con vite-t1, rw-views-stop ni los outDir o puertos de mis corridas. Logs copiados aquí; /dev/shm/vite-t1 y el caché uv /mnt/ssd/.uv-cache-vite-t1 se borraron.
