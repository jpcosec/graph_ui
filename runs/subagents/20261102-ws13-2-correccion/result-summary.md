# Resultado corrección WS13.2

Executor Claude Sonnet 5.5, 2026-11-02. HEAD encontrado: `15bf3d628c96332e3abe33364840ab967b83e3cd`. Sin commits, sin tocar el Board, sin suite general. No es PASS de Tester. Salidas: `validation.log`, `stdout.log`, `stderr.log`, `capturas/`, `ensayo/`, `evidencia-base/base_results.log`.

## Ensayo de open_store (punto 1, antes de decidir)
Reproductor: `ensayo/hook_serve.py` (proceso real de serve.py con `sys.addaudithook`: open con escritura, os.remove/rename/mkdir/rmdir/truncate/chmod/utime/link/symlink, shutil.*; los `open(<fd>)` se resuelven y los pipes a git se separan) y `ensayo/ensayo_open_store.py`. Para observar, el lanzador sustituye solo `_fresh_listing` por `sldb.api.open_store(<.sldb>, mode="readonly")` real (modo B); modo A = código previo. Store canónico preparado, repo git real, modelo no importable real. Logs: `ensayo/ensayo-A.log`, `ensayo-B.log`.
- Modo B, GET /explorer, /nodes (x2 y x4 durante refrescos), /node, /source: open_store llamado en cada /nodes y /explorer; **0 eventos de escritura a archivo**, 0 diferencias de sha256, mtime_ns, directorios, git status y HEAD. En todo el log del hook solo aparecen los 9 eventos del control positivo.
- Control positivo (mismo proceso, fuera de los GET): detectó os.remove, os.mkdir, open w, os.rename, shutil.copyfile, os.rmdir.
- Refresco entre procesos con servidor vivo: alta, untrack, track, baja: los cuatro vistos en /explorer y /nodes.
- Store inexistente y `.sldb` vacío, llamada directa a open_store: 0 eventos de escritura, árbol sin cambios (`ensayo/ensayo-store-inexistente.log`). Aun así el guardia `store_path.exists()` -> 503 queda antes de `_fresh_listing`.
- Observación: open_store inserta en `sys.path` del servidor la raíz del store dueño (`/home/jp/proyectos/SLDB_1/deskops` en el ensayo). Efecto solo en memoria; no es escritura.
- Modo A (código previo): el único "evento" fue `open(<fd>,'w')` hacia el pipe de `git check-ignore` en /explorer; con el hook corregido se clasifica como pipe, no archivo.
Decisión: se adopta open_store. Hay cero escrituras observadas, así que no hay reproductor de escritura que escalar. Límite: solo canónico; el layout no canónico (que open_store migraría) NO se ensayó.

## Cambios por punto
1. `frontends/mindmap/workspace_routes.py:163-170` `_fresh_listing` llama `sldb.api.open_store(self.store_path, mode='readonly')`; ya no hay import de `sldb.store.*` en el módulo. Pruebas (`tests/test_mindmap_workspace_explorer.py`): `test_refresh_path_has_no_sldb_store_import` (AST, :696), `test_real_process_listing_get_writes_nothing_and_sees_other_process_changes` (:710; proceso real con hook, `HOOK_LAUNCHER` :560, `RealServer` :620; control positivo, hashes+mtime, alta/untrack/track/baja). Fallo previo: el AST falla en base; la prueba de proceso real PASA en base (el código previo tampoco escribía; solo la parte de import distingue).
2. `workspace_routes.py:263-268` (`_explorer_roots`): componente con punto, `__pycache__` o `node_modules` -> `roots_invalid` con razón `componente_prohibido`, antes de enumerar, directa o anidada; mixta conserva las válidas. `explorer.mjs:89` etiqueta. Pruebas: `test_forbidden_root_is_rejected_...` (:788, 8 con git + 6 sin git, `.git` solo con git porque un `.git` inventado rompe git), `test_mixed_roots_...` (:804, con y sin git, centinelas `.md` sin .gitignore, aperturas de .md observadas con el hook: ningún centinela abierto, 0 escrituras), `test_legit_roots_with_spaces_and_unicode_are_preserved` (:829). Fallo previo: 16 de 16 parametrizadas y las 2 mixtas fallan en base.
3. `explorer-view.js:34,98` cada entrada (modelada y no modelada) muestra `explorer-item-path` visible con la ruta relativa (`pathLabel`, `explorer.mjs:23`, "sin ruta" si vacía); `workspace.css:807-818`. Pruebas: e2e `test_explorer_equal_titles_show_distinct_visible_paths_and_open_their_origin` (e2e:993; TaskDoc y AtomDoc reales con título "ActionsSection", abrir cada uno lleva a su identidad y ruta; dos LEEME.md no modelados) y mjs. Los títulos iguales dentro de un mismo modelo no se pueden crear (el id sale del título), por eso son modelos distintos. Fallo previo: falla en base.
4. `explorer.mjs:15-47` (`MODELO_SIN_CONFIRMAR`, `modeledGroups(..., catalogStatus)`; texto «modelo sin confirmar»; causa solo con /nodes ok), `explorer-view.js:45-47,96-98`, `workspace-view.js:244,332,343,351,658` (`catalogStatus` pending/ok/error). El error de /nodes de la vista no se toca. Pruebas e2e (:1051 `/nodes` real retenida con `page.route` y modelo Bitacora realmente no importable: sin afirmación, luego `modelo_no_carga` y título; :1084 fallo real de red con `route.abort()`: sin confirmar, alerta «Error de catálogo» persistente, recuperación al refrescar) y 5 pruebas mjs (una prueba previa que esperaba `ok` sin catálogo se cambió: conducta retirada por este punto). Fallo previo: las dos e2e fallan en base (`ok` en vez de `modelo_sin_confirmar`); mjs falla por import.

## Falla contra la base
Worktree desechable `/tmp/ws132c-base` en 15bf3d6 con los 3 archivos de prueba nuevos copiados; eliminado (`git worktree remove`; `worktree list` solo muestra el principal). `evidencia-base/base_results.log`: pytest 19 failed, 2 passed (real_process, legit_roots); node: SyntaxError por exports ausentes; e2e nuevos: 3 failed.

## Resultados finales (`validation.log`, `stdout.log`)
- `pytest tests/test_mindmap_workspace_explorer.py`: 40 passed.
- `pytest tests/e2e_mindmap_workspace.py`: 18 passed.
- `node --test tests/mindmap-workspace-explorer.test.mjs`: 13 pass, 0 fail.
- Extra (corrida previa a los ajustes finales, no repetida): `pytest tests/test_mindmap_workspace_reader.py tests/test_mindmap_workspace.py`: 46 passed.
Capturas revisadas a ojo: `correccion-modelo-sin-confirmar-pendiente.png`, `correccion-titulos-repetidos.png`.

## Ajustes finales (pedido del coordinador)
1. Insignia sin recorte: `workspace.css` `.workspace-explorer-item-title` y `.workspace-explorer-item-title .workspace-badge` con `white-space: normal; overflow-wrap: anywhere` (la insignia envuelve). Aserción nueva en `test_explorer_does_not_claim_model_loaded_while_nodes_is_held_then_updates`: scrollWidth - clientWidth <= 0 en la insignia y en su botón, y la caja de la insignia dentro de la del botón, a 1440x900 en Chromium. Captura revisada: `capturas/correccion-modelo-sin-confirmar-pendiente.png` (el texto completo se lee, envuelto en dos líneas en columna estrecha). La aserción se probó solo contra el código corregido; no la corrí contra el CSS anterior.
2. Docstring de `workspace_routes.py` líneas 3-6: describe open_store(readonly) en los listados sobre store canónico preparado fuera del request, sin afirmar nada del layout no canónico.
Repetidos (`validation.log`, HEAD 15bf3d6): explorer 40 passed; e2e 18 passed; node 13 pass, 0 fail.

## No verifiqué
Suite general; layout no canónico con open_store; Tester independiente (queda el suyo, con control positivo propio); otros navegadores/viewports; en la captura, una ruta secundaria muy larga queda cortada al borde de la lista con scroll (no medida); `demo 8092` y otros puertos no usados; Los `__pycache__`/node_modules con mayúsculas o variantes no se probaron.
