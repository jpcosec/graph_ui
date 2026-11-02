## REFORMULACION

**Encargo:** implementar en el host Mindmap un explorador de documentos reales modelados y Markdown no modelado, navegable sin conocer ID, con refresco explícito, que consume el lector WS13.1 y tolera modelos que no cargan.

**Objetivo:** entregar `GET /api/workspace/explorer`, módulo `views/workspace/explorer/`, montaje en `workspace-view.js`/`.css`, catálogo degradado y aviso de relaciones indexadas.

**Alcance:** permitidos H-02 (`WORKSPACE_EXPLORER_ROOTS`, por defecto `desk` y `docs`, solo `.md`, exclusiones, symlinks, gitignored, tope 5000); listado sin caché; apertura vía lector WS13.1; modelo no cargable con `modelo_no_carga`; pruebas listadas. Fuera: shell/api.js, `frontends/workspace/`, mutaciones, render Markdown, WS13.3, multidesk, API nueva, puertos 8090-8092, contrato.

**Repo:** árbol de trabajo actual (`frontends/mindmap`, `tests`, referencias `desk`/`deskops`). Base: HEAD de main al despacho. Sin commits ni Board por el Executor; stores/repos temporales reales, sin mocks ni stubs.

## AMBIGUEDADES

1. **«El cliente nunca aporta rutas»** frente a **«Abrir navega con id o path al lector WS13.1 existente»**. Obliga a inventar cómo viaja el `path` al lector y quién lo valida.
2. **«Un modelo autorizado que no carga»** y **«con la causa recibida»**: no define cómo se detecta “no carga” ni de dónde/formato llega la causa. Obliga a inventar el mecanismo de comprobación y propagación del error.
3. **«Donde se muestren relaciones o grafo»**: condicional; no aclara si el explorador debe mostrar grafo/relaciones o solo el aviso. Obliga a decidir si se implementa vista o únicamente aviso.
4. **«El selector actual se conserva»**: no identifica el selector. Obliga a inspeccionar la UI y adivinar cuál es el elemento intocable.
5. **«Se declara en la respuesta»** (sin repo git / entradas inválidas): no fija campo ni ubicación; la forma JSON se delega a `result-summary.md`, pero no el lugar de estos avisos. Obliga a inventar parte del esquema.
6. **«Prueba que falla contra la base donde aplique»**: no enumera qué pruebas deben fallar antes del cambio. Obliga a elegir casos.

## DRY-RUN

El ejecutor futuro: leería el bundle y contratos citados; inspeccionaría `WorkspaceRoutes`, `workspace-view.js/.css`, lector WS13.1 y tests; crearía `views/workspace/explorer/`; añadiría `GET /api/workspace/explorer` con raíz del store, permitidos desde entorno, filtros, git check-ignore por lote y truncado; listaría modelados desde `indexed_documents` y no modelados por recorrido; montaría árbol/filtro, apertura por id/path y botón de refresco que recarga `/nodes` y `/explorer`; añadiría estado degradado y aviso de relaciones; escribiría pruebas nuevas y ajustaría las existentes. Errores esperables: entrada de entorno inválida, fallo de git check-ignore (cerrado), store inexistente, modelo no importable, truncado. Resultado esperado: explorador funcional sobre stores reales, sin mutaciones, suite indicada verde, `result-summary.md` y handoff.

## FUTURO

El Supervisor haría commit y demo en 8092 sobre copia temporal. Un Tester independiente ejecutaría y dejaría `runs/subagents/20261102-ws13-2-explorador/tester-result-summary.md`. Quedan para otros nodos WS13.3 (pestañas/split), WS16 y G_HUMAN_READ. Cualquier bloqueo por contrato o API nueva debe documentarse en `result-summary.md`, sin workaround.
