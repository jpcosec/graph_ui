## REFORMULACION
Propósito: cerrar dos huecos tras read_store. Resultado: (a) `runtime_documents` usa `sldb.api.read_store` en vez de `open_store`, de modo que ningún GET de `/api/views` migre el store; (b) `POST /api/save` sobre store des-preparado responde 503 "store not prepared"/"store_no_preparado" y no escribe. Repo: graph_ui; toca `frontends/mindmap/sldb_adapter.py`, `views_routes.py`, `persistence.py` y tests. Límites (NO ENTRA): `make_server`, import de `render_model_markdown/validate_model_input_roundtrip`, sldb, `frontends/desk`. Nodo ejecutable `task.code`, no agregado.

## AMBIGUEDADES
1. "503 con str(exc) y estado 'store_no_preparado'. Reusa la forma de respuesta de error que ya tenga ese módulo." `dispatch` devuelve `{'ok': False, 'error': ...}` sin campo de estado: habría que inventar la clave (`estado`/`status`/`state`) y resolver la contradicción con "reusa".
2. "un SLDBStoreError con 'store not prepared'". Filtrar por subcadena obliga a inventar el tipo/módulo exacto (`workspace_routes.py` no viene en el bundle) y el criterio ante mensajes distintos.
3. "un POST /api/save sobre un store des-preparado con el servidor ya arrancado" frente a "make_server, que sigue preparando el store con open_store". Si el arranque prepara, el store no queda des-preparado; habría que inventar cómo fabricarlo después (la prueba citada no está incluida).
4. "no cambia ningún archivo de .sldb (sha256 y mtime)": no se define el conjunto ni tolerancias; obligaría a inventar el snapshot.
5. "! grep -rn open_store frontends/mindmap/sldb_adapter.py...": el docstring actual de `runtime_documents` menciona `open_store`; no se aclara si el match debe evitarse también en comentarios.
6. "En tests/test_mindmap_persistence.py, un POST /api/save": ese archivo hoy prueba `EditorStore`, no HTTP; obliga a inventar la infraestructura de servidor.

## DRY-RUN
Lecturas: TaskDoc, rituales, `sldb_adapter.py`, `views_routes.py`, `persistence.py` y tests; faltan `projection_views.py`, `workspace_routes.py`, `test_mindmap_workspace_explorer.py` y las notas/commit referenciados. Cambios previstos: (1) `runtime_documents` `open_store`→`read_store` y docstring; (2) capturar `SLDBStoreError` en `dispatch` y devolver 503; (3) envolver `refresh_for_concurrent_sessions` en `save` y traducir a `SaveError(status=503)`; (4) pruebas nuevas con store no canónico. Dependencias: `sldb.api.read_store`, `sldb.core.exceptions.SLDBStoreError`. Validaciones futuras: los tres comandos del TaskDoc, con baseline previo.

## FUTURO
Deciden otro nodo o humano: promoción en Board (status `draft`), nombre del campo de estado y política de detección por mensaje, provisión de los archivos ausentes, y el closeout como commit atómico.
