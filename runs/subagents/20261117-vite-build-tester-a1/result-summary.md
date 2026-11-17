# Tester independiente: el vite build del fixture de vistas no deja procesos huérfanos

Veredicto: **PASS**

Entorno: venv en /dev/shm/vbuild-t1 (uv, CPython 3.13.18, UV_CACHE_DIR=/dev/shm/vbuild-t1/uvcache). Instalé sldb (origin/main), deskops (/home/robocop/herramientas/deskops HEAD), pron (HEAD), graph_ui sin dependencias (HEAD), pytest y playwright. requirements-suite.txt solo lista esos tres repos por git, así que se cubren con las copias locales. Chromium está en PLAYWRIGHT_BROWSERS_PATH=/dev/shm/vbuild-t1/pw, `sldb` en el PATH y uso el node_modules del repo. Antes de cada pytest se cumplió la regla de RAM: available 15G y avg60 entre 0.02 y 0.13. Cada pytest corrió con systemd-run MemoryMax=3G, TMPDIR=/dev/shm, sin -n y uno a la vez. Al terminar borré /dev/shm/vbuild-t1.

## 1. Validación
`tests/e2e_review_workbench_views.py` completo: **5 passed, sin skips, en 49 s, rc=0** (p1-e2e.log).
- La prueba nueva corrió de verdad. Su vite-build.log (p1-vite-build-timeout.log) muestra que vite llegó a "transforming..." antes del corte de 1 s, así que había procesos node de vite vivos y `_stop` los bajó.
- `ps` posterior (p1-ps-despues.txt): los únicos procesos con rw-views o el venv son los tres vite preview ajenos (/dev/shm/gui, /dev/shm/cc34ui y /home/dios), que no toqué. No queda ningún proceso con la ruta /mnt/ssd/.../graph_ui/apps ni con el basetemp, y no queda ningún `vite build`.

## 2. Control negativo propio
Hice una copia en /dev/shm/vbuild-t1/neg con apps enlazado al repo. Ahí reemplacé `_build` por el `subprocess.run([...], cwd=APP, check=True, capture_output=True, timeout=timeout)` viejo (p2-negativo.diff). La prueba nueva **FALLA** como se esperaba:
`AssertionError: processes still holding .../rw-views-build-timeout/dist after the build timed out: [2841990, 2841991]` (p2-control-negativo.log).
La propia prueba mata por PID esos dos huérfanos (`sh -c vite build` y `node vite build`). El `ps` posterior sale vacío (p2-ps-despues.txt).

## 3. Rama rc != 0
Copié apps/review-workbench a /dev/shm sin tocar el repo, con node_modules enlazado y un `vite.config.js` inválido (`export default {{{ ...`). Sobre esa copia, `_build(dist, timeout=120)` lanza **subprocess.CalledProcessError** con lo siguiente:
- returncode 1;
- cmd `['npx','vite','build','--outDir',<dist>,'--emptyOutDir']`;
- `output` es un str idéntico al contenido de dist.parent/vite-build.log ("Expected identifier but found "{"" ... "failed to load config").

Después no queda ningún proceso con el outDir ni ningún `vite build`, y tampoco servicios esbuild de esta corrida. Evidencia: p3-p4-rc.log, p3-p4-test_rc.py y p3-ps-despues.txt.

## 4. Robustez
- **Descriptor del log**: el `with log.open("wb")` lo cierra en el padre apenas lanza el proceso, y el hijo conserva su propia copia. Lo comprobé: después de `_build`, la ruta del log no aparece en /proc/self/fd (test_build_log_fd_closed_in_parent: pasó).
- **dist.parent inexistente**: `log.open` lanza FileNotFoundError antes de lanzar ningún proceso, así que no queda ninguno (test_build_missing_parent: pasó). En el fixture no puede pasar, porque `work` sale de mkdtemp. La prueba nueva hace `dist.parent.mkdir()`.
- **Aislamiento**: la prueba usa tmp_path/rw-views-build-timeout/dist, que es único por corrida y basetemp. Pertenecer a la corrida se decide por ese outDir completo, así que no confunde los vite ajenos que estaban corriendo a la vez (confirmado en el punto 1). El log del fixture va a `work/vite-build.log`, dentro de su mkdtemp.

## 5. Alcance
El cambio de código toca solo `tests/e2e_review_workbench_views.py` (diff.patch, +41/-2): agrega `_build`, el fixture llama a `_build(dist)` y suma la prueba nueva. `_spawn`, `_group_alive` y `_stop` quedan byte-idénticos a HEAD (diff de la sección _spawn.._store: solo aparece `_build`). La firma `_build(dist: Path, timeout: float = 300) -> None`, el log en archivo con stderr=STDOUT, `TimeoutExpired(cmd, timeout)`, `CalledProcessError(rc, cmd, output=log)`, el skip con el mismo criterio y mensaje del fixture y el `timeout=1` con `pytest.raises(subprocess.TimeoutExpired)` coinciden con la Disposition del preflight-1.

Aparte: durante la corrida aparecieron en el árbol de trabajo cambios en .sldb/core y desk/inbox (InboxNoteDoc). Al empezar no estaban, no son del ejecutor y no forman parte de esta tarea.

## Hallazgos (ninguno bloqueante)
1. **Baja**: tests/e2e_review_workbench_views.py:124-128. Solo `TimeoutExpired` dispara `_stop`. Una excepción de otro tipo durante `process.wait` (KeyboardInterrupt o Ctrl-C en pytest) deja vivo el grupo del build. Se arregla con `except BaseException: _stop([process]); raise` o con un try/finally que pare el grupo si sigue vivo. El código viejo tenía el mismo hueco, incluso peor.
2. **Baja**: tests/e2e_review_workbench_views.py:128. El `TimeoutExpired` relanzado no lleva la salida del log (`output=None`), así que para diagnosticar un build lento hay que ir a buscar dist.parent/vite-build.log. Se podría pasar `output=log.read_text(...)`. El contrato no lo exige.
3. **Baja**: tests/e2e_review_workbench_views.py:222-224. La prueba no comprueba que, antes del corte, hubiera procesos con el outDir. Con la máquina muy cargada, npx podría no haber hecho fork todavía al cumplirse 1 s, y la prueba pasaría en vacío. En esta corrida sí era significativa: vite llegó a "transforming" y el control negativo encontró 2 PID.
4. **Info**: tests/e2e_review_workbench_views.py:120-121. Si dist.parent no existe, sale FileNotFoundError en vez de CalledProcessError. Es aceptable porque el que llama siempre crea el padre.

Al cierre no queda ningún proceso mío, y /dev/shm/vbuild-t1 está borrado.
