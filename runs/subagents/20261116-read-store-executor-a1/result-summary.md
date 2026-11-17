# Ejecutor: lectura pública de sldb (read_store, extract_payload) en el workspace y el adaptador — intento 1

Tarea: task-el-lector-del-workspace-y-el-adaptador-usan-la-lectura-pública-de-sldb-read-store-extract-payload-en
graph_ui HEAD 7ad725a. sldb usado: árbol de trabajo de /mnt/ssd/proyectos/SLDB_1/sldb en eb41f065 (contiene f515d91c).
No hice add, commit, push ni stash. No toqué desk/, .sldb/, sldb ni pyproject.toml.

## Cambios (archivo:línea, después del cambio)

- `frontends/mindmap/sldb_adapter.py:366-374` — `refresh_for_concurrent_sessions`: `from sldb.store.runtime_cache_signature import new_operation; new_operation(self.store)` pasa a `from sldb.api import read_store; read_store(self.store)`. read_store hace ese new_operation y además el del hash de documentos. El docstring lo dice.
- `frontends/mindmap/workspace_routes.py`:
  - `:3-6` (docstring del módulo): los listados abren operación con `sldb.api.read_store`, que no migra; con un layout no canónico responden 503 store_no_preparado con el texto de sldb.
  - `:164-176` `_fresh_listing`: `open_store(self.store_path, mode='readonly')` pasa a `read_store(self.store_path)`. Una `SLDBStoreError` cuyo texto contiene 'store not prepared' se convierte en `WorkspaceError(str(exc), 503, STORE_NO_PREPARADO)`; cualquier otra `SLDBStoreError` se relanza sin tocarla. El docstring se reescribió: read_store no migra y lanza 'store not prepared'. `SLDBStoreError` se importa de `sldb.core.exceptions` porque sldb.api no la reexporta; tests/deskops_viewdocs.py ya importa `SLDBModelError` de ese mismo módulo. Las dos rutas que lo llaman, `/api/workspace/nodes` y `/api/workspace/explorer`, dan 503.
  - `:188-199` `_extract_payload`: `sldb.runtime.validation.extract_model_data` pasa a `sldb.api.extract_payload`, con el mismo valor devuelto: extract_payload es un envoltorio directo. Se actualizaron el docstring y el comentario de `:234`.
- `frontends/mindmap/persistence.py:74`: solo el comentario; `new_operation` pasa a ``sldb.api.read_store``.
- `tests/deskops_viewdocs.py`: se quitó el import de `extract_model_data`; `:26` usa `api.extract_payload(ViewDoc, …)`. El módulo ya hacía `from sldb import api`.
- `tests/test_mindmap_workspace_explorer.py`:
  - `:715`: comentario de la prueba existente (`read_store llega por sldb.api`).
  - `:718` `test_frontends_do_not_import_sldb_internal_readers`: recorre con ast todos los `.py` de `frontends/`. Falla con `import sldb.store.runtime_cache_signature[...]`, con `from sldb.store.runtime_cache_signature import …`, con `from sldb.store import runtime_cache_signature`, con `from sldb.runtime.validation import extract_model_data` y con `from sldb.runtime import validation`. Además comprueba en positivo que sldb_adapter.py importa `read_store` de sldb.api y que workspace_routes.py importa `read_store` y `extract_payload` de sldb.api.
  - `:752` `test_listing_get_on_unprepared_store_is_503_and_writes_nothing`:
    - Monta un store real (deskops bootstrap + seed_desk) y un servidor real. Comprueba `store_is_prepared` y un GET /nodes con 200.
    - Fabrica el layout no canónico a partir de `sldb.store.migration._already_canonical`: esa función rechaza el store mientras exista el índice semántico de archivo único (`semantic_index_path`). La prueba escribe ahí el índice semántico real del store (`load_semantic_index(...)`, volcado con el `yaml_dump` de sldb), que es el layout anterior al sharding de la capa 5. Después comprueba que `store_is_prepared` da False.
    - Para `/api/workspace/nodes` y `/api/workspace/explorer` espera status 503, `ok: false`, `estado: store_no_preparado`, la substring 'store not prepared' en `error`, y el mismo sha256 y mtime_ns de cada archivo bajo `.sldb` antes y después. Al final el archivo legado sigue ahí: nadie migró.
    - Control: `open_store(store)`, la apertura que sí migra, prepara ese mismo store.

## Validación

Las pruebas corrieron sin -n, un comando a la vez, así: `systemd-run --user --scope -p MemoryMax=3G -- env TMPDIR=/dev/shm [PLAYWRIGHT_BROWSERS_PATH=…] <py> -m pytest -q -rs -p no:cacheprovider --basetemp=/dev/shm/...`. La línea base se corrió sobre `git archive HEAD` en /dev/shm; el "después" se corrió sobre el árbol de trabajo. El script está en /dev/shm/readstore-a1/scripts/run-validation.sh y su contenido equivale a los comandos de cada log.

| Comando | Base (HEAD) | Después |
|---|---|---|
| `python -c "from sldb.api import read_store, extract_payload, store_is_prepared"` (sldb/.venv y venv de pruebas) | rc=0 / rc=0 | rc=0 / rc=0 |
| `! grep -rnE "runtime_cache_signature\|extract_model_data" frontends tests/deskops_viewdocs.py --include=*.py` | rc=1, 7 coincidencias | rc=0, sin salida |
| pytest de las 8 suites de la validación | 121 passed, 1 failed, 0 skipped (29 min) | **124 passed, 0 failed, 0 skipped** (19 min) |
| `pytest tests/e2e_mindmap_workspace.py` | 21 passed, 1 failed, 0 skipped | **22 passed, 0 failed, 0 skipped** |
| `git -C ../../sldb branch -r --contains f515d91c` | rc=0, salida vacía | rc=0, salida vacía (ver desvío 1) |

Las pruebas del "después" son 124 = 122 de base + 2 nuevas.

Fallos de base, previos a mi cambio, que no se repitieron después:
- `test_mindmap_deskops.py::test_terminal_cannot_close_and_path_escape`: TimeoutError de urlopen (30 s) bajo carga.
- e2e `test_reader_renders_real_markdown_of_the_repo[README.md]`: `doc-render` no visible en 5 s.

Ninguno toca el código cambiado; son de tiempo.

Control negativo (`negative-control-old-code.log`): las dos pruebas nuevas, corridas sobre el código de HEAD, fallan.
- La prueba de imports lista `sldb_adapter.py → sldb.store.runtime_cache_signature` y `workspace_routes.py → extract_model_data`.
- La prueba del 503 recibe **200**: open_store migró el store en silencio.

Ninguna corrida se acercó al tope de 3G.

## Ejemplo real de la respuesta 503 (manual-503.log)

Servidor real `mindmap.serve.make_server` sobre un store en /dev/shm con el índice semántico de archivo único:

```
store_is_prepared: False
GET /api/workspace/nodes -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/readstore-a1/readstore-503-xq7fc8um/repo/.sldb)", "estado": "store_no_preparado"}
GET /api/workspace/explorer -> 503 {"ok": false, "error": "store not prepared: run `sldb stores update` (/dev/shm/readstore-a1/readstore-503-xq7fc8um/repo/.sldb)", "estado": "store_no_preparado"}
store_is_prepared after: False legacy exists: True
```

## Desvíos y observaciones

1. **f515d91c no está en origin/main de sldb.** `branch -r --contains f515d91c` sale vacío: f515d91c solo está en la rama local `backup/pre-align-20261116`. origin/main tiene el commit equivalente **77b6dc34**, con el mismo mensaje y el mismo `read_store.py` (`git ls-tree origin/main` lo muestra). `after-sldbref.log` incluye esa comprobación complementaria. La CI que instala sldb@main tiene, por tanto, read_store, extract_payload y store_is_prepared. El coordinador debería leer la condición del push como "77b6dc34 en origin/main".
2. **Intérprete.**
   - `/mnt/ssd/proyectos/SLDB_1/sldb/.venv/bin/python` tiene sldb.api con read_store, pero no tiene deskops, pron ni playwright, y las suites de la validación importan deskops. Solo lo usé para el `python -c`.
   - El venv de la corrida anterior (`/dev/shm/venv-lector-e1`) ya no existía.
   - Armé `/dev/shm/readstore-a1/venv` (Python 3.13, uv) a partir de `git archive HEAD` de sldb (eb41f065), de `/home/robocop/herramientas/deskops` (339bacca) y de pron (39ea972), más pytest y playwright 1.65.2. Así no escribí nada en esos árboles.
   - Playwright 1.65.2 necesita chromium_headless_shell-1255, que no está en ~/.cache/ms-playwright. Lo instalé en `PLAYWRIGHT_BROWSERS_PATH=/dev/shm/readstore-a1/pw`. El primer intento de línea base e2e falló 22/22 por esa razón y quedó guardado como `baseline-e2e-sin-navegador.log`.
   - Al terminar borré /dev/shm/readstore-a1 (venv, navegador y copias).
3. `_fresh_listing` envuelve read_store en un try/except: es lo que exige el contrato para el 503. El import sigue siendo directo desde sldb.api.
4. Fuera de alcance, sin tocar: `sldb_adapter.py:409-415` (`load_runtime_documents`) sigue usando `open_store(Path(store))`, que migra. No es la ruta GET de workspace_routes, pero es otra apertura que migra en una lectura; podría ir a otra tarea.
5. Fuera de alcance, sin tocar: el import de `render_model_markdown` y `validate_model_input_roundtrip` desde `sldb.runtime.validation` en `sldb_adapter.py:31`, como dice el contrato.
6. **Cambios ajenos en el árbol durante la corrida.** Hay cambios en `.sldb/core/store_index.yaml`, en `.sldb/core/models/InboxNoteDoc.yaml` y una nota nueva `desk/inbox/20261116-230531-suggestion-aviso-el-alias-deskops-inbox-se-retir-usar-deskops-message.md` con su shard. La nota es del proyecto deskops (`sender_project: deskops`, 23:05:31). No la hice yo: no está en mi diff ni en mi alcance, y mis pruebas usan stores temporales. El coordinador debe tenerla en cuenta al integrar.

## Archivos de evidencia

baseline-{pyc,grep,unit,e2e,sldbref}.log, baseline-e2e-sin-navegador.log, after-{pyc,grep,unit,e2e,sldbref}.log, negative-control-old-code.log, manual-503.log, diff.patch.
