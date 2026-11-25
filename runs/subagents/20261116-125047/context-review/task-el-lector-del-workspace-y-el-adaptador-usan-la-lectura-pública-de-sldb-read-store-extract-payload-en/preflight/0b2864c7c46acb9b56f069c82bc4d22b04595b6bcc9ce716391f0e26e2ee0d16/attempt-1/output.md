REFORMULACION
Encargo ejecutable (`task.code`) en el repo graph_ui. Propósito: eliminar imports de internos de sldb y usar la lectura pública `sldb.api.read_store`, `store_is_prepared` y `extract_payload`. Resultado: adaptar `frontends/mindmap/sldb_adapter.py`, `workspace_routes.py`, `tests/deskops_viewdocs.py` y añadir una prueba de imports en `tests/test_mindmap_workspace_explorer.py`; valorar `pyproject.toml`. Límites: no cambiar sldb, no tocar escrituras ni `frontends/desk`; `persistence.py` solo si su comentario cita `new_operation`.

AMBIGUEDADES
1. “Si una ruta GET del workspace hoy llama a sldb.api.open_store, pasa a read_store”: no enumera rutas ni distingue usos de escritura; obliga a inventar el conjunto de rutas GET afectadas.
2. “subir el mínimo de structuredLanguageDB a la versión que trae read_store si sldb la publicó con versión nueva; si no, dejarlo”: no indica versión ni cómo determinarla; obliga a inventar versión o criterio.
3. “persistence.py salvo que su comentario cite new_operation (solo texto)”: no consta si existe tal comentario; obliga a inventar si se modifica.
4. “el SLDBStoreError 'store not prepared' se devuelve como respuesta de error con ese texto (no 500 genérico)”: no fija código HTTP ni formato de respuesta; obliga a inventarlos.
5. Goal dice “Ningún archivo de frontends/” pero el alcance concreto y la prueba nueva hablan de “frontends/mindmap/*.py”: obliga a decidir si la prohibición es global o solo mindmap.

DRY-RUN
Lecturas: TaskDoc, nota del inbox, `sldb/api/stores/read_store.py`, `sldb/api/documents/extract_payload.py`, `store-declaration.md`, archivos listados y un grep de imports/rutas. Cambios previstos: sustituir imports por `sldb.api`; ajustar `refresh_for_concurrent_sessions` y `_extract_payload`; migrar rutas GET condicionales; añadir prueba AST de imports; bump opcional de `pyproject.toml`. Dependencias: sldb instalado con f515d91c y presencia de ese commit en `origin/main`. Validaciones futuras: import de API pública, grep negativo, suites pytest indicadas y e2e. Sin ejecutar nada.

FUTURO
Un humano o nodo externo confirma la versión/commit de sldb en origin/main, decide el bump de `pyproject.toml` y valida el código HTTP del error; la CI ejecuta las pruebas.
