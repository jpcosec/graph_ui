REFORMULACION
Propósito: eliminar en graph_ui los imports de internos de sldb (`sldb.store.runtime_cache_signature.new_operation` y `sldb.runtime.validation.extract_model_data`) sustituyéndolos por la API pública `sldb.api.read_store` y `sldb.api.extract_payload`. Resultado: ningún .py de `frontends/` ni `tests/deskops_viewdocs.py` importa esos nombres; las lecturas del workspace usan `read_store`; un GET de listado sobre store no preparado responde 503 con el texto de sldb en vez de migrar. Repo: graph_ui (robocop2); toca `frontends/mindmap/{sldb_adapter,workspace_routes,persistence}.py`, `tests/deskops_viewdocs.py` y `tests/test_mindmap_workspace_explorer.py`. Límites: no se toca sldb, ni `frontends/desk`, ni las escrituras; se conserva el import de `render_model_markdown`/`validate_model_input_roundtrip`; `pyproject.toml` no cambia.

AMBIGUEDADES
1. "3) Para (4), revisar las rutas GET de workspace_routes.py": el (4) del alcance son docstrings; la ruta GET es (2b). Obliga a inventar a qué punto se refiere.
2. "WorkspaceError(<mensaje de sldb>, 503, 'store_no_preparado')" frente a "responde 503 con el texto de sldb ('store not prepared: run `sldb stores update`')": no se fija si es `str(exc)` completo o solo ese literal. Obliga a inventar el formateo.
3. "una prueba de que GET /api/workspace/nodes sobre un store con layout no canónico responde 503 ... y no cambia ningún archivo del store": no se indica cómo fabricar el store no canónico ni cómo comprobar la inmutabilidad. Obliga a inventar fixtures y aserción.
4. "el único punto del módulo que abre el store en un GET": afirmación no verificable sin ejecutar; si hubiera otro, el alcance queda indefinido.
5. "su docstring se reescribe: read_store no migra": contenido mínimo no especificado.

DRY-RUN
Lecturas: los cinco archivos del alcance y las referencias citadas. Cambios previstos: imports y llamadas según alcance; comentario en `persistence.py`; docstrings; dos pruebas nuevas (ast y 503). Dependencias: sldb instalado con f515d91c. Validaciones futuras: `python -c` de imports, grep negativo, suites pytest listadas, e2e y comprobación de rama remota. Sin ejecutar nada.

FUTURO
Un humano/coordinador decide el push y si f515d91c está en origin/main de sldb; otra tarea cubre el equivalente público de `render_model_markdown`; la CI instala sldb@main.
