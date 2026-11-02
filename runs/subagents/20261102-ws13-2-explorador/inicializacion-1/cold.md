## REFORMULACION
**Objetivo:** entregar en el host Mindmap un explorador de documentos reales —modelados del store y Markdown no modelado del desk— navegable sin conocer ID, con refresco explícito, consumiendo el lector WS13.1 (`/api/workspace/source`) y tolerando modelos que no cargan.
**Alcance:** ruta `GET /api/workspace/explorer` en `WorkspaceRoutes`; módulo nuevo en `views/workspace/explorer/`; montaje y dos avisos en `workspace-view.js`/`workspace.css`; lista cerrada de archivos y tests (backend, node --test, e2e). Sin caché, sin migrar/reconstruir/crear store, sin tocar módulos de modelos.
**Repo/base:** graph_ui; base declarada «HEAD de main al despacho».
**Límites:** fuera de alcance shell/api.js, `frontends/workspace/`, mutaciones, render Markdown, WS13.3, multidesk, API nueva de sldb, Changes/Integrity/Scion, push y puertos 8090/8091/8092; sin mocks ni datos inventados; Executor no commitea.

## AMBIGUEDADES
1. «variable de entorno WORKSPACE_EXPLORER_ROOTS leída una vez al arrancar» — no existe tal punto en `WorkspaceRoutes.__init__` ni en `configured_workspace_routes`; obligaría a inventar dónde se lee y cómo se propaga.
2. «se informa en la respuesta», «se declara en la respuesta», «truncado con indicador visible» — sin campo ni forma; obligaría a inventar nombres del JSON de `/explorer` más allá de los que la hoja deja libres (forma, orden y presentación).
3. «un modelo autorizado que no carga» — no distingue `load_registered_model` de `extract_model_data`; hoy ambos se capturan juntos en `_extract_payload`; obligaría a inventar el discriminante que navegacion §7.5 (E7) prohíbe.
4. «ignorados por git… en una sola invocación por lote con argv fijo y sin shell» — no fija tamaño de lote ni si `--stdin` cuenta como argv fijo para hasta 5000 rutas; obligaría a inventar la estrategia.
5. Base: «HEAD de main al despacho» frente a `graph_ui HEAD a2f0bba` del recibo G_UI_READ; obligaría a elegir una.
6. «Donde se muestren relaciones o grafo» — no dice si el aviso va también en el explorador o solo en las vistas de nodo existentes.

## DRY-RUN
Crear `views/workspace/explorer/explorer.mjs` (árbol y filtro) y montarlo en `workspace-view.js` con reutilización del selector; añadir rama `/api/workspace/explorer` en `dispatch` (405 no-GET) y método `workspace_explorer()`: `_explorer_roots()` desde la env, `_indexed()` para modelados con `Model:name` prevaleciente, recorrido `os.walk(followlinks=False)` con filtros (sufijo `.md`, partes con punto, `__pycache__`, `node_modules`, symlink fuera de raíz), lote de `git check-ignore` con fallo cerrado y tope 5000. En `workspace_nodes`, envolver `_extract_payload` por entrada: `estado='modelo_no_carga'` con la causa recibida, sin propagar 500. `/node` ya responde degradado y `/source` ya extrae secciones con texto leído. Añadir el aviso de origen de índice en relación/grafo.
Errores esperables: ruta 404 al inicio; `test_mindmap_workspace_explorer.py` falla contra la base (hoy `/nodes` daría 500 con modelo no importable); luego verde.
Resultado: nueva suite backend, `node --test` del árbol, e2e y `tests/` con 218 previas pasando; `result-summary.md` con forma JSON y decisión de orden.

## FUTURO
Tester independiente con navegador real → `runs/subagents/20261102-ws13-2-explorador/tester-result-summary.md`; Supervisor → commit y demo 8092 en copia temporal; P01/root → acta de recepción (el recibo G_UI_READ ya existe, no es firma). `G_HUMAN_READ`/WS16 siguen pendientes. Quedan para otros nodos: WS13.3 (pestañas/split), WS15.1 (estados E1-E3), render Markdown y WS41/multidesk.
