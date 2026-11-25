REFORMULACION

Propósito: que el lector del workspace y el adaptador de graph_ui usen la lectura pública de sldb (`read_store`, `extract_payload`, `store_is_prepared`) en vez de módulos internos (`sldb.store.runtime_cache_signature`, `sldb.runtime.validation`). Resultado: ningún archivo de `frontends/` ni `tests/deskops_viewdocs.py` importa esos internos; un store sin preparar en un GET responde el mensaje 'store not prepared' en vez de migrarse; una prueba nueva lo vigila; el mínimo de structuredLanguageDB sube solo si procede. Repo: `/mnt/ssd/proyectos/SLDB_1/UIs/graph_ui`. Límites: no tocar sldb; escrituras con `open_store` intactas; `frontends/desk` fuera; `persistence.py` solo comentario.

AMBIGUEDADES

1. "Si una ruta GET del workspace hoy llama a sldb.api.open_store, pasa a read_store" — condicional y sin el contenido de `workspace_routes.py` en el bundle; obliga a inventar qué rutas GET abren el store y su forma actual.
2. "subir el mínimo de structuredLanguageDB a la versión que trae read_store si sldb la publicó con versión nueva; si no, dejarlo" — no se aporta versión ni criterio; obliga a inventar número o asumir ausencia.
3. "da un error claro con el mensaje de sldb" — no fija código HTTP ni rutas; un test existente espera 503 para store ausente; obliga a inventar el mapeo.
4. "Una prueba nueva ... que falla si frontends/mindmap/*.py importa..." — no aclara si cubre imports dinámicos o solo AST estático; obliga a inventar alcance.
5. "el sldb instalado debe contener f515d91c" — no se confirma que esté en origin/main; obliga a asumir la precondición.

DRY-RUN

Lecturas: grep de `runtime_cache_signature|runtime\.validation|extract_model_data|open_store` en `frontends` y `tests/deskops_viewdocs.py`; leer `workspace_routes.py` (no incluido), `sldb_adapter.py`, `deskops_viewdocs.py`, `pyproject.toml` y la prueba existente. Cambios: sustituir imports por `sldb.api` en `refresh_for_concurrent_sessions` y `_extract_payload`; ajustar rutas GET a `read_store` y mapear `SLDBStoreError`; añadir prueba AST; pin condicional. Dependencias: sldb con f515d91c en `origin/main`, versión publicada, CI instala `sldb@main`. Validaciones futuras: los cuatro comandos del TaskDoc y las suites pytest, bajo ritual testing.

FUTURO

Otro nodo o humano debe confirmar/pushear f515d91c a origin/main de sldb, decidir la versión de structuredLanguageDB, ejecutar testing y, en closeout, actualizar Board con commit atómico.
