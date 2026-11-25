REFORMULACION
Propósito: sustituir en graph_ui imports internos de sldb (`sldb.store.runtime_cache_signature`, `extract_model_data`) por API pública (`sldb.api.read_store`, `sldb.api.extract_payload`), sin migrar stores. Resultado: adaptador y lector del workspace leen por contrato público; un GET de listado con store no preparado devuelve 503 con el mensaje de sldb; una prueba AST impide reincidir. Repo: graph_ui (frontends/mindmap, tests). Límites: no tocar sldb, escrituras, frontends/desk ni el import residual `render_model_markdown`/`validate_model_input_roundtrip`; pyproject no cambia. No es agregado ni paquete; es task.code ejecutable.

AMBIGUEDADES
1. "`_fresh_listing` ... `open_store(self.store_path, mode='readonly')`" y "`WorkspaceError(mensaje, status, código)` ya existe en el módulo". El bundle no incluye `workspace_routes.py`: obligaría a inventar el código actual, la firma exacta de `WorkspaceError` y su propagación.
2. "un listado GET del workspace sobre un store sin preparar responde 503". No precisa endpoint(s): el alcance solo toca `_fresh_listing`, pero la prueba nombra `/api/workspace/nodes`. Obligaría a decidir si también aplica a `/api/workspace/explorer`.
3. "una prueba de que GET /api/workspace/nodes sobre un store con layout no canónico responde 503 ... y no cambia ningún archivo del store". No define cómo construir el layout no canónico ni qué snapshot usar; obligaría a inventar fixture y criterio de inmutabilidad.

DRY-RUN
Lecturas: TaskDoc, rituales de ejecución/testing/closeout, pill, `sldb_adapter.py`, `persistence.py`, tests citados y `pyproject.toml`; faltaría leer `workspace_routes.py`. Cambios previstos: imports y llamadas en el adaptador; `_extract_payload`, `_fresh_listing` y docstrings en rutas; comentario en persistencia; import en `deskops_viewdocs.py`; prueba AST y prueba 503. Dependencias: sldb instalado con f515d91c; CI instala sldb@main; pron/deskops. Validaciones futuras: los comandos listados en Validación, sin ejecutar ahora.

FUTURO
Otro nodo ejecuta execution, luego testing y closeout con commit atómico y Board reconciliado. El coordinador decide el push si f515d91c no está en origin/main de sldb; sldb debe publicar equivalente público de `render_model_markdown`/`validate_model_input_roundtrip` en otra tarea.
