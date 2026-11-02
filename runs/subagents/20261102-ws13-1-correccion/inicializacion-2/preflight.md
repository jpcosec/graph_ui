## REFORMULACION

**Objetivo:** corregir cinco hallazgos del lector WS13.1 en `graph_ui` (lectura sin mutación, guardias previas a leer, foco con dueño, estados sin mezcla, anclas) con pruebas reales, incluyendo casos negativos, sin implementar hojas posteriores.

**Alcance:** solo los archivos listados (`workspace_routes.py`, `views/workspace/node/`, cuatro tests) más `sldb_adapter.py` únicamente con funciones de lectura, previa declaración en `runs/.../declaracion-archivos.md`. Fuera: shell/api.js, `frontends/workspace/`, mutaciones, render Markdown, WS13.2/13.3, multidesk, API nueva de sldb, push, puertos 8090-8092.

**Repo:** SLDB_1, UI `graph_ui`. Base: HEAD de main al despacho conteniendo `bf55151`.

**Límites:** sin mocks/stubs (stores temporales reales; audithook y `page.route` admisibles); Executor no commitea ni toca Board; bloqueo irresoluble se documenta en `result-summary.md`, sin preguntar.

## AMBIGUEDADES

1. *"Esta TaskDoc es autocontenida"* vs *"demás guardias de §3.3"*: obliga a leer `contratos/navegacion.md` (externo) para enumerar las guardias. Inventar el conjunto si el contrato no está disponible.
2. *"la extracción pública del modelo; comprobar en fuente; cuenta como pública una función importable desde sldb.api o sus submódulos sin guion bajo"*: el executor debe inspeccionar `sldb`, fuera de la lista cerrada; no se dice si la inspección (solo lectura) está permitida ni qué función concreta cumple.
3. *"para destino modelado, no modelado y propio"* y *"lectura protegida"*: no define cómo se obtiene `extract_section` de un destino no modelado sin abrirlo; riesgo de inventar la ruta.
4. *"correspondences cuenta solo elementos cuya procedencia pertenece al documento abierto: no cuenta un campo de otro documento ni un campo propio que apunte a otro destino"*: la segunda cláusula es gramaticalmente ambigua (¿el campo propio que apunta a otro destino se cuenta o no?).
5. *"un contador local de generación por navegación"* y *"dos revisiones distintas no se unifican en silencio"*: mecanismo y punto de comparación indeterminados (¿por panel, por documento, por petición?).
6. *"Sin transcluir"*: término sin definición en el documento.
7. *"la extracción pública del modelo"* vs *"El fallback `_resolve_document` no lee sin guardia"*: no aclara si se conserva, se elimina o se reubica.

## DRY-RUN

1. Leer `review-source.md`, contrato §3.3/§5.2/§5.4/§6/§6.1/H-14, checkpoints del lector y `sldb` para localizar API pública (`indexed_documents`, `load_edge_index`, `extract_section`, `load_registered_model`); registrar en `declaracion-archivos.md` cualquier necesidad de `sldb_adapter.py`.
2. En `workspace_routes.py`: sustituir rutas GET por `load_edge_index(store, include_linked=False)`; chequear `EdgeIndex.stale` → `ok:false, estado:store_no_preparado`; mover guardias §3.3 antes de abrir fuentes; usar `indexed_documents` para catálogo.
3. En `views/workspace/node/`: añadir propietario por procedencia, filtro de `correspondences`, generación por navegación, estados de carga y clasificación de anclas antes de navegar.
4. Tests: ajustar `test_workspace_cycle_and_2hops_real_edges` (preparar store antes del GET + caso de rechazo), añadir negativos por hallazgo y `tests/mindmap-workspace-reader.test.mjs`.
5. Errores esperables: ausencia de API pública → bloqueo documentado; drift del baseline "204 pruebas" → declarar desviación una a una.
6. Resultado esperado: las cinco validaciones pytest/node verdes; `result-summary.md` con avance y bloqueos.

## FUTURO

- **Supervisor:** commit, demo en 8092 sobre copia temporal; valida `declaracion-archivos.md` como evidencia.
- **Tester independiente:** produce `tester-result-summary.md` con ejecución de los cinco casos.
- **Root:** decide aceptación de WS13.1; solo entonces se desbloquean WS13.2 y WS13.3.
- **sldb desk:** resolver el intake `20261102-051843-unclear-...` (lectura pública de store preparado sin `open_store`) para desbloquear layout no canónico.
