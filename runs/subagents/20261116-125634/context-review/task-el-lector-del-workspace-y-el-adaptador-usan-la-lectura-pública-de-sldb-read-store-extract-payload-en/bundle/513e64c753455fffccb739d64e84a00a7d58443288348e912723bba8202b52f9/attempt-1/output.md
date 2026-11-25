## REFORMULACION
Propósito: migrar graph_ui de imports internos de sldb (`sldb.store.runtime_cache_signature`, `sldb.runtime.validation`) a la API pública `sldb.api` (`read_store`, `extract_payload`, `store_is_prepared`). Resultado: ningún `.py` bajo `frontends/` ni `tests/deskops_viewdocs.py` importa esos internos; `_fresh_listing` usa `read_store` y, ante store no preparado, responde 503 con el mensaje de sldb sin migrar; se añaden dos pruebas (AST en `frontends/` y 503 sin escrituras). Repo: graph_ui. Límites: no tocar `sldb`, `frontends/desk`, rutas de escritura; `pyproject.toml` sin cambios.

## AMBIGUEDADES
1. El archivo clave no está en el bundle: «frontends/mindmap/workspace_routes.py: (a) _extract_payload (línea ~183)… (b) _fresh_listing (línea ~164)». Obliga a inventar `_fresh_listing`, `WorkspaceError` y `store_path`.
2. «sldb sigue en 0.1.13 en su pyproject» contradice el incluido: «"structuredLanguageDB>=0.1.11"». Obliga a decidir si se fija versión.
3. «responde 503 con el texto de sldb ('store not prepared: run `sldb stores update`')»: no aclara igualdad exacta ni substring; obliga a inventar la aserción.
4. «una prueba nueva junto a test_refresh_path_has_no_sldb_store_import»: no dice si sustituye o convive con la existente (que solo mira `workspace_routes.py`).
5. «el único punto del módulo que abre el store en un GET»: no verificable sin el archivo; obliga a confiar.

## DRY-RUN
Lecturas: `sldb_adapter.py`, `persistence.py`, `tests/deskops_viewdocs.py`, `tests/test_mindmap_workspace_explorer.py`, `pyproject.toml`; falta `workspace_routes.py`. Cambios previstos: imports y `refresh_for_concurrent_sessions`; comentario de `persistence.py` (~línea 74); tests. Dependencias: sldb con `f515d91c` en `origin/main`; CI instala `sldb@main`. Validaciones futuras: los cinco comandos del TaskDoc. Sin `workspace_routes.py` no puede ejecutarse (puntos 2a/2b).

## FUTURO
El nodo de testing/closeout ejecutará las validaciones y el commit atómico; el coordinador decide si `f515d91c` está en `origin/main` y si el push procede; la CI instala `sldb@main`.
