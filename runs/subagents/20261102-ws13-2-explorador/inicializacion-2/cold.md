## REFORMULACION

**Objetivo:** entregar en el host Mindmap un explorador de documentos reales modelados y de Markdown no modelado, navegable sin conocer ID, con refresco explícito y catálogo degradado tolerante a modelos que no cargan.

**Alcance:** lista cerrada de archivos: `views/workspace/explorer/` nuevo; `workspace-view.js` y `workspace.css` solo para montar explorador y avisos; `workspace_routes.py`; tres pruebas backend/e2e y una Node nuevas o modificadas. Incluye `GET /api/workspace/explorer`, permitidos por `WORKSPACE_EXPLORER_ROOTS`, exclusión de puntos, `__pycache__`, `node_modules`, symlinks e ignorados git, tope 5000, aviso de relaciones indexadas y degradación por modelo no importable.

**Repo:** graph_ui, HEAD de main al despacho posterior al commit citado; delta WS13.2 con `G_UI_READ`; base declarada `a2f0bba` en el recibo.

**Límites:** sin mocks, stubs ni datos falsos; solo GET; no mutar, migrar, reconstruir ni inicializar store; no `shell/api.js`, `frontends/workspace/`, WS13.3, multidesk, API nueva de sldb, Changes/Integrity/Scion, push ni puertos 8090/8091/8092; no cambios de contrato. Executor no commitea; Tester es independiente; Supervisor commitea y hace demo en 8092 sobre copia temporal.

## AMBIGUEDADES

1. **Contradicción de superficie.** dag.yaml dice `output_scope: frontends/mindmap/views/workspace/explorer/; rutas de lectura definidas por el contrato WS11; tests/`, mientras la TaskDoc fija `frontends/mindmap/workspace_routes.py` y `node/workspace-view.js`/`workspace.css`. Obliga a decidir si tocar ruta y vista fuera de `explorer/` o a inventar una excepción.

2. **Alcance de los permitidos sobre modelados.** La TaskDoc dice: «Modelados desde indexed_documents; no modelados recorriendo solo las rutas permitidas». No queda explícito si un modelado indexado fuera de `WORKSPACE_EXPLORER_ROOTS` debe listarse/abrirse. Obliga a inventar si los permitidos filtran todo el explorador o solo el recorrido de no modelados.

3. **Defaults y raíces inválidas.** «si no está definida, desk y docs. Una entrada absoluta, con .. o que no resuelva dentro de la raíz se ignora y se informa en roots_invalid». No define si un default inexistente (`desk`/`docs`) va a `roots_invalid`, ni si una raíz permitida que sea symlink se sigue o se ignora. Obliga a inventar política.

## DRY-RUN

Un ejecutor futuro leería el bundle y confirmaría HEAD/base. En `workspace_routes.py` añadiría `GET /api/workspace/explorer`, leería `WORKSPACE_EXPLORER_ROOTS` una vez en `__init__`, resolvería relativos contra `repo_root`, descartaría absolutos, `..` y escapes, y listaría modelados desde `indexed_documents` y no modelados recorriendo permitidos sin abrir archivos. Excluiría puntos, `__pycache__`, `node_modules`, symlinks de directorio y archivos symlink fuera de raíz; ejecutaría una sola vez `git check-ignore --stdin -z` con argv fijo; aplicaría tope 5000 y campos `roots_invalid`, `sin_git`, `truncado`. En `explorer/` crearía árbol, filtro y apertura por `id` o `path` al lector WS13.1; en `workspace-view.js` montaría el explorador y conservaría el selector; añadiría botón de refresco que recarga `/nodes` y `/explorer`; pondría avisos de procedencia indexada en Grafo y relaciones del contexto. En `workspace_nodes`/`/node` capturaría fallo de `load_registered_model` o `extract_model_data` por documento, conservaría identidad/path y estado `modelo_no_carga` con el texto de la excepción; `/source` devolvería fuente segura y `extract_sections`; `/node` degradado, no 500. Añadiría pruebas de permitidos, symlinks, ignorados, punto, sin git, truncado, duplicado modelado/no modelado, modelo no importable y ausencia de mutaciones por GET. Errores esperados: 503 sin store; permitidos inválidos ignorados; fallo git cerrado; modelo no importable aislado. Resultado esperado: pruebas indicadas verdes, suite general con 218 previas, sin cambios de hashes/HEAD/git status tras GET.

## FUTURO

El Executor implementa y entrega `result-summary.md` y handoff; el Tester independiente ejecuta con backend/store/navegador reales y deja su `tester-result-summary.md`; el Supervisor commitea y actualiza demo 8092 en copia temporal. Root/P01 registran recepción y aceptación del delta; `G_HUMAN_READ` y WS16 siguen pendientes. WS13.3 —pestañas, divisiones e historia— queda para otro nodo.
