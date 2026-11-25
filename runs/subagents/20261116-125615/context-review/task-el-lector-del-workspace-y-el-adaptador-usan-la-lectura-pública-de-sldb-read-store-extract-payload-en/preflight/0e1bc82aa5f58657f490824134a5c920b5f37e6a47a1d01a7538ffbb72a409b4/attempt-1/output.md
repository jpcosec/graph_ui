## REFORMULACION

Encargo ejecutable (`task.code`, no agregado): adaptar graph_ui para usar la lectura pública de sldb (`sldb.api.read_store`, `extract_payload`, `store_is_prepared`) en vez de internos no contrato. Resultado: ningún `.py` de `frontends/` ni `tests/deskops_viewdocs.py` importa `sldb.store.runtime_cache_signature` ni `sldb.runtime.validation`; `refresh_for_concurrent_sessions` usa `read_store`; `_extract_payload` usa `extract_payload`; `_fresh_listing` usa `read_store` y traduce `SLDBStoreError` “store not prepared” a `WorkspaceError(..., 503, 'store_no_preparado')`; se añaden pruebas AST y de 503 sin escrituras. Repo: graph_ui. Límites: no cambiar sldb, `frontends/desk` ni rutas de escritura; `pyproject.toml` no cambia.

## AMBIGUEDADES

1. “un listado GET del workspace” frente a “GET /api/workspace/nodes”: no queda claro si la prueba cubre solo esa ruta o cualquier GET que use `_fresh_listing`; obligaría a inventar el alcance de rutas.
2. “no cambia ningún archivo del store”: no se define cómo comprobarlo (hash, mtime, listado); obligaría a inventar el método de verificación.
3. “responde 503 con 'store not prepared'”: no se aclara si se exige el texto completo o solo el substring; obligaría a inventar el criterio de comparación.
4. “read_store(self.store_path)” frente a “read_store(store) -> StoreLocation” y “acepta la misma ruta .sldb”: no se explicita si el argumento es ruta, id o `StoreLocation`; obligaría a inventar la conversión.
5. “imports estáticos, como la existente”: no se precisan alias, `from sldb import runtime` ni imports dinámicos; obligaría a inventar las reglas del escaneo AST.
6. “Para el push” en Done When: el push no está en Scope; obligaría a inventar si el ejecutor debe commitear/pushear o solo reportar.
7. “store con layout no canónico”: no hay procedimiento de fixture; obligaría a inventar cómo construirlo.

## DRY-RUN

Lecturas: `frontends/mindmap/sldb_adapter.py` (~371), `workspace_routes.py` (~164, ~183), `persistence.py` (~74), `tests/deskops_viewdocs.py` (14, 27), `tests/test_mindmap_workspace_explorer.py`, `pyproject.toml`; grep de imports internos. Cambios previstos: sustituir imports y llamadas, reescribir docstring, añadir pruebas AST y 503. Dependencias: sldb instalado con `f515d91c`; CI instala `sldb@main`. Validaciones futuras: los comandos de Validation y `origin/main` contiene `f515d91c`. Sin ejecutar.

## FUTURO

Otro nodo o humano decide/ejecuta el push si `f515d91c` está en `origin/main`; el coordinador avisa si no; CI y revisión/merge.
