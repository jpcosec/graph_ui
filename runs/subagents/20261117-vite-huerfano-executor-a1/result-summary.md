# Ejecutor: la e2e de vistas de review-workbench no deja vite preview huérfanos

Tarea: desk/tasks/task-la-e2e-de-vistas-de-review-workbench-no-deja-procesos-vite-preview-huérfanos-al-terminar.md
Aclaraciones: Disposition de desk/reviews/<misma tarea>/preflight-1.md. Base: HEAD ca08ae0. Sin commit, push, add ni stash.

## Cambios (solo tests/e2e_review_workbench_views.py)

- :26 `import signal`.
- :71 `_spawn(cmd, **kw) -> Popen`: `Popen(..., start_new_session=True)`, con stdout y stderr a DEVNULL por defecto. El pid del líder es el pgid.
- :83 `_group_alive(p)`: `p.poll()` recoge al líder zombi y después `os.killpg(p.pid, 0)`.
- :92 `_stop(processes, timeout=10)`: `os.killpg(pgid, SIGTERM)` a cada grupo. Espera a que el grupo entero desaparezca, no solo el Popen, con un tope de 10 s. Si queda algo, manda `os.killpg(pgid, SIGKILL)` y luego `wait`.
- :138, :139 y :146: el fixture `stack` lanza sldb serve, serve.py y `npx vite preview` con `_spawn`. Se sigue usando npx.
- :151: el `finally` del fixture llama a `_stop(processes)`.
- :155 `_holding(marker)`: recorre `/proc/*/cmdline`, sin psutil.
- :168 `test_stop_leaves_no_process_of_vite_preview_alive(tmp_path)`: prueba nueva, sin navegador. Usa `_spawn` para lanzar `npx vite preview --outDir <tmp_path>/rw-views-stop --port <libre> --strictPort --host 127.0.0.1` con cwd=APP. Espera a que el puerto responda y comprueba que hay procesos con ese outDir. Después llama a `_stop` y exige que ninguno quede. Si quedan, primero los corta por PID (son solo los de su outDir único) y después falla. Se salta con el mismo criterio que el fixture (npx más node_modules) y también si no hay /proc.

## Validación (venv /dev/shm/vite-e1, py3.13; sldb origin/main, deskops HEAD, pron HEAD; ninguna prueba con -n)

| Corrida | Resultado |
|---|---|
| Línea base `tests/e2e_review_workbench_views.py` (código de HEAD) | 3 passed. Dejó el huérfano PID 2280109 (`node .../vite preview --outDir /dev/shm/rw-views-ppsyuhcr/dist`, PPID 1). Ver ps-antes.txt y ps-despues.txt. Lo corté con `kill 2280109`. |
| Prueba nueva sola, con el arreglo | 1 passed |
| Control negativo: prueba nueva con el `_stop` viejo | 1 failed: `processes still holding .../rw-views-stop after _stop: [2292838]`. Ver control-negativo.log. |
| `tests/e2e_review_workbench_views.py` con el arreglo | 4 passed, 0 failed, 0 skipped (99.7 s). En ps-despues-arreglado.txt no aparece ningún proceso de esta corrida. |
| `tests/test_review_workbench.py` | 3 passed, 0 failed, 0 skipped |

En ps-antes y ps-despues aparecen tres vite preview ajenos que ya estaban antes de empezar: PID 1327477 bajo /dev/shm/gui, PID 1984202 bajo /dev/shm/cc34ui y PID 3566546 de /home/dios/...SLDB_1-wip. No los toqué.

## Desviaciones y notas

- `_stop` usa `os.killpg(process.pid, ...)` y no `os.getpgid(p.pid)`. Con start_new_session el pgid es el pid. Además, cuando el líder (npx) ya murió y fue recogido, `getpgid` falla, mientras que `killpg` sigue llegando al hijo node que queda en el grupo.
- La espera es por grupo vacío, no solo por `wait()` del Popen: npx puede salir antes que el node hijo.
- La prueba nueva escribe un `index.html` de una línea en su outDir. `vite preview` necesita que el directorio exista y `_wait` necesita una respuesta 200. No es un dato que se valide: solo sirve para tener un servidor real que levantar.
- En el control negativo la propia prueba cortó al huérfano por PID, porque es parte de su limpieza. El ps posterior no muestra ningún proceso suyo, así que no hizo falta un kill manual.
- El control negativo se corrió en una copia `git archive HEAD` en /dev/shm/vite-e1/neg, con el archivo nuevo y el cuerpo de `_stop` reemplazado. node_modules es un symlink al del repo.
- logs/run.sh es el script de cada corrida: ps antes, pytest con systemd-run (MemoryMax=3G), ps después.
