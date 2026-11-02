## REFORMULACION

**Objetivo:** corregir cuatro defectos de WS13.2 en el explorador de graph_ui: (1) sustituir `_fresh_listing` por la vía pública `sldb.api.open_store(..., mode="readonly")` solo si se demuestra cero escrituras; (2) rechazar raíces con componentes prohibidos; (3) mostrar siempre la ruta relativa como identidad secundaria; (4) no afirmar carga de modelo mientras `/nodes` esté pendiente o falle.

**Alcance:** lista cerrada de archivos: `workspace_routes.py`, `explorer-view.js`, `explorer.mjs`, `workspace-view.js`/`workspace.css` solo estados e identidad, y tres suites de prueba. Quedan fuera shell/api.js, persistencia, edición, `frontends/workspace/`, WS13.3, Markdown, API nueva, Scion, push, puertos 8090-8092 y tareas hermanas.

**Repo:** `/home/jp/proyectos/SLDB_1/UIs/graph_ui`, rutas relativas a esa raíz; base `ec0eb43` en `main` o posterior, SHA registrado por el Executor.

**Límites:** sin mocks/stubs; stores temporales reales; sin commits ni suite general por el Executor; sin preguntar al solicitante.

## AMBIGUEDADES

1. «Base: ec0eb43 en main o posterior»: no fija repositorio ni rama exacta; obligaría a inventar cuál `main` y si vale un descendiente no verificado.
2. «que termina llamando las dos new_operation (sldb api/stores/open_store.py:40-41)»: no identifica ambas operaciones ni su contrato; obligaría a inferir la API interna de sldb.
3. «registrando open con modo de escritura, os.remove, os.rename, os.mkdir y equivalentes»: «equivalentes» es abierto; obligaría a inventar la lista cerrada de eventos auditados.
4. «Un store inexistente sigue dando su error sin crearlo: comprobarlo antes de llamar open_store»: no dice cómo comprobar existencia sin carreras; obligaría a inventar el mecanismo.
5. «El Executor registra el SHA que encuentra»: no define dónde ni formato; obligaría a inventar ubicación del registro.
6. `summary: ''`, Rationale/Goal/Scope/Validation con placeholders: el contenido real está en prosa posterior; obligaría a decidir si los placeholders son exigencias.

## DRY-RUN

1. Leer los siete archivos y registrar SHA de partida.
2. Crear store canónico temporal real; preparar hook `sys.addaudithook` en proceso `serve.py`; ejecutar `open_store` explícito readonly y observar escrituras, hashes y refresco entre procesos (alta/baja/track/untrack).
3. Si hay escrituras: dejar `_fresh_listing`, escribir reproductor en `result-summary.md` y continuar puntos 2-4. Si no: sustituir y eliminar imports de `sldb.store` del refresco.
4. Añadir validación de componentes prohibidos antes de enumerar, conservando válidas en configuración mixta.
5. Renderizar ruta relativa visible siempre en cada entrada.
6. Introducir `modelo_sin_confirmar` con texto «modelo sin confirmar» y preservar error de `/nodes`; actualizar al llegar respuesta.
7. Ejecutar las tres suites. Errores esperados: escritura detectada, store inexistente creado, pruebas DOM/e2e en rojo. Resultado: cambios y `result-summary.md`/handoff; sin commit.

## FUTURO

El **Tester** independiente ejecutará la calibración positiva del hook y producirá `runs/subagents/20261102-ws13-2-correccion/tester-result-summary.md`. El **Supervisor** decidirá commit, ejecutará una vez la suite general sobre bytes finales y hará demo en 8092; si hubo escrituras, lo llevará a root. **Root** decidirá el fallback. Quedan pendientes G_HUMAN_READ y WS16; WS13.3 no se inicia.
