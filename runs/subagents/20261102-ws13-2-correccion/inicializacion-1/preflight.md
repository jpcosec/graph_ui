REFORMULACION (encargo: objetivo, alcance, repo, límites)

Objetivo: corregir WS13.2 en el explorador de `graph_ui`: frontera API del refresco, filtro de raíces prohibidas, identidad visible ante títulos repetidos y estado honesto de modelo. Repo: `/home/jp/proyectos/SLDB_1/UIs/graph_ui`. Alcance cerrado: `workspace_routes.py`; `explorer-view.js` y `explorer.mjs`; `workspace-view.js` y `workspace.css` solo estados/identidad; tres tests indicados. Límites: sin `shell/api.js`, persistencia, edición, `frontends/workspace/`, WS13.3, API nueva de sldb, mocks/stubs, commits ni suite general por el Executor; stores temporales reales. Autoridad: `review-source.md`; contrato `navegacion.md` §2.2, §3.3, §5.4, H-02.

AMBIGUEDADES

1. “calibrar el hook de escrituras” y “control positivo del hook”: no se define hook, archivo ni procedimiento. Obligaría a inventar instrumentación y ubicación.
2. “un identificador secundario: nombre de documento o ruta”: no fija cuál elegir, prioridad ni formato visible. Obligaría a inventar regla de presentación.
3. “estado honesto de modelo sin confirmar”: no da texto, icono ni condición visual exacta. Obligaría a inventar copy/UI.
4. “las mismas pruebas de cero escrituras”: remite a `review-source.md`, no transcrito aquí. Sin leerlo, obligaría a inventar el conjunto de pruebas.
5. “HEAD de main al despacho, que contiene dacf5ad”: hash corto y HEAD móvil. Obligaría a inventar el commit exacto si no se registra.

DRY-RUN

Un ejecutor leería primero `review-source.md` y el contrato. En `workspace_routes.py` sustituiría `_fresh_listing` por comprobación previa de existencia y `sldb.api.open_store(<.sldb explícito>, mode="readonly")`, eliminando `sldb.store` del refresco; probaría alta, baja, track y untrack entre procesos y cero escrituras por observación de operaciones. En raíces validaría cada componente prohibido antes de enumerar, conservaría válidas en configuración mixta y probaría centinelas con/sin git. En `explorer-view.js`/`explorer.mjs` añadiría identificador secundario visible y prueba DOM con títulos iguales. En `workspace-view.js`/`workspace.css` mostraría modelo no confirmado mientras `/nodes` esté pendiente/fallido, sin borrar error global, actualizando al llegar. Ejecutaría los tres comandos de Validation. Errores esperados: escritura detectada, import residual, fuga de raíz prohibida, identidad no visible o estado que afirme carga. Resultado esperado: pruebas verdes y `result-summary.md` con handoff; si hay bloqueo, reproductor preciso y parada de ese punto.

FUTURO

El Tester independiente produce `tester-result-summary.md` con control positivo del hook. El Supervisor decide el intake si hay escrituras, hace commit, ejecuta una vez la suite general sobre bytes finales y demo en 8092. Quedan pendientes G_HUMAN_READ y WS16; WS13.3 no se inicia.
