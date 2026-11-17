# Ejecutor: el vite build del fixture de vistas no deja huérfanos al vencer el timeout

Tarea: task-el-vite-build-del-fixture-de-vistas-no-deja-procesos-huérfanos-cuando-se-pasa-del-timeout
Base: HEAD d8e5698 (graph_ui). Sin commit, push ni add. Archivo tocado: solo tests/e2e_review_workbench_views.py.

## Cambios (archivo:línea, en el árbol de trabajo)
- tests/e2e_review_workbench_views.py:111-128: helper nuevo `_build(dist: Path, timeout: float = 300) -> None`.
  Lanza `_spawn(["npx","vite","build","--outDir",str(dist),"--emptyOutDir"], cwd=APP, stdout=<dist.parent/"vite-build.log">, stderr=subprocess.STDOUT)`
  (un archivo, no PIPE) y luego `process.wait(timeout)`. Si vence: `_stop([process])` y `raise subprocess.TimeoutExpired(cmd, timeout)`.
  Si rc != 0: `raise subprocess.CalledProcessError(rc, cmd, output=<texto del log>)`. `_spawn` y `_stop` se reusan sin cambios.
- tests/e2e_review_workbench_views.py:164: el fixture `stack` llama a `_build(dist)` en lugar de `subprocess.run(..., timeout=300)`.
- tests/e2e_review_workbench_views.py:214-230: prueba nueva `test_build_timeout_leaves_no_process_of_vite_build_alive`, sin navegador.
  Usa el mismo criterio de skip que el fixture (npx + APP/node_modules, mismo mensaje) más el de /proc de la prueba hermana.
  Corre `_build` con un outDir único en tmp_path y timeout=1, dentro de `pytest.raises(subprocess.TimeoutExpired)`, y comprueba
  `_holding(str(dist)) == []`. Si queda algo, lo corta por PID antes de fallar.
- diff completo: diff.patch

## Validación (venv /dev/shm/vbuild-e1 con Python 3.13; sldb origin/main, deskops HEAD, pron HEAD y graph_ui HEAD instalados con uv; chromium de playwright)
Todas las corridas se hicieron sin -n, una a la vez, con systemd-run MemoryMax=3G, TMPDIR=/dev/shm y la regla de RAM comprobada
antes de cada una (available 12G, some avg60 0.01).
- Control negativo (control-negativo.log): copia en /dev/shm con el cuerpo de `_build` reemplazado por el `subprocess.run(..., check=True, capture_output=True, timeout=timeout)`
  viejo (copia en control-negativo-e2e_review_workbench_views.py). Resultado: **1 failed**. Quedaron los PID 2822188 y 2822189 con el outDir;
  la propia prueba los cortó por PID.
- Prueba nueva con el arreglo (prueba-nueva.log): **1 passed**. Se repitió 3 veces más (prueba-nueva-repeticiones.log): 3/3 passed.
- Validación del contrato `pytest -q -rs tests/e2e_review_workbench_views.py` (e2e-completa.log): **5 passed, 0 failed, 0 skipped** en 51.8 s.
- Procesos: en ps-antes.txt y ps-despues.txt, filtrados por vite build, vite preview y vbuild-e1. No queda ningún proceso con el outDir
  de mis corridas ni ningún `vite build`. Los 3 `vite preview` que siguen vivos son de otras sesiones (/dev/shm/gui, /dev/shm/cc34ui, /home/dios):
  tienen el mismo PID antes y después y no los toqué.

## Desviaciones
- graph_ui se instaló en el venv (sin deps) desde `git archive HEAD`, porque la e2e importa `mindmap.projection_views`. El brief no lo
  mencionaba. El paquete no cambia con esta tarea.
- Los paquetes de .github/requirements-suite.txt (structuredLanguageDB, pron y deskops desde GitHub) se cubrieron con los git archive
  locales que pedía el brief, no desde GitHub.
- Hay un aviso de pytest, inocuo: `asyncio_default_fixture_loop_scope` es una opción desconocida sin pytest-asyncio. Ya estaba antes.
- La rama `CalledProcessError` (rc != 0) no tiene prueba propia. El contrato no la pedía.
