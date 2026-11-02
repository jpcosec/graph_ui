## REFORMULACION

**Objetivo:** implementar en el host Mindmap un lector de solo lectura con render y fuente cruda del mismo origen, contexto real, seguimiento de enlaces y foco compartido donde WS11 defina correspondencia.

**Alcance:** `frontends/mindmap/workspace_routes.py`, `frontends/mindmap/views/workspace/node/`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`; opcionales `sldb_adapter.py` (una función) y `serve.py` (despacho), con declaración previa en `declaracion-archivos.md`.

**Repo:** graph_ui a1b2b22.

**Límites:** sin escritura, commit, board ni rutas de mutación; sin mocks/stubs; puertos 8090/8091 excluidos.

## AMBIGUEDADES

1. *"Forma de la respuesta: la decide el Executor con estos campos mínimos"* — fuerza inventar esquema, nombres de campo y envoltorio que las pruebas asertarán como contrato de facto.
2. *"secciones con span"* — unidad del span (bytes, líneas o caracteres) no definida; obliga a inventarla.
3. *"solo si una prueba sobre un Markdown no modelado real del fixture muestra secciones correctas"* — "correctas" y fixture no definidos; fuerza inventar criterio y dato.
4. *"foco compartido donde WS11 defina correspondencia"* — "correspondencia" sin definición; obliga a inventar la relación entre Document, Graph y Code.
5. *"parse_links, split_anchor, clasificar prefijo"* — módulo y firmas no citados; fuerza asumir API.
6. *"C1 a C3… C14a… H-03… H-14"* — identificadores sin definición en la TaskDoc pese a declararse autocontenida; obliga a leer contratos externos.
7. *"el desk del proceso viaja como ausencia"* — formulación opaca; fuerza interpretar comportamiento de parámetros.

## DRY-RUN

El ejecutor: (1) lee bundle y contratos citados; (2) corre línea base pytest; (3) en `workspace_routes.py` añade GET de lectura con `id`/`path` excluyentes (400 si ambos o ninguno), guardias §3.3 (resolve/symlink, `.git`, gitignore cerrado, directorio, 256 KB, binario, codificación), lectura única de bytes con sha256, render modelado/no modelado, contexto vía `load_edge_index(store, include_linked=False)`; (4) en `views/workspace/node/` renderiza fuente íntegra, contexto, enlaces y foco (sección/span, `field_path`, `{doc,field,position,value}`, aristas con procedencias, rango local Code); (5) tests con store y desk temporales reales, comparando sha256 de `.sldb` y archivo leído antes/después de cada GET; (6) escribe `result-summary.md`, `validation.log` y handoff. Errores previstos: H-14 si el store muta con API pública; ambigüedad de forma de respuesta; fallo de `extract_sections` en no modelado. Resultado esperado: acceptance del nodo WS13.1.

## FUTURO

Tester independiente ejecuta y produce `runs/subagents/20261102-ws13-1-lector/tester-result-summary.md`; G_HUMAN_READ revisa y decide; WS16 y WS13.2/WS13.3 continúan. Nadie commitea ni cierra Board desde esta tarea.
