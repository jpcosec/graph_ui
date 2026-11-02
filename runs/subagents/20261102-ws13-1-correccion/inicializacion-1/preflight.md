## REFORMULACION

**Objetivo:** corregir los cinco hallazgos de WS13.1 en el lector de `graph_ui` con pruebas reales y casos negativos: (1) GET sin mutación, (2) guardias antes de leer, (3) foco con documento propietario, (4) estados ligados a identidad/generación sin mezcla, (5) anclas verificadas antes de navegar. Sin implementar hojas siguientes.

**Alcance:** autoridad `review-source.md`; contrato `navegacion.md` sha256 indicado (§3.3, §5.2, §5.4, §6, §6.1, H-14). Lista cerrada de archivos: `workspace_routes.py`, `views/workspace/node/`, cuatro tests y un `.mjs` nuevo; `sldb_adapter.py` solo funciones de lectura, previa declaración motivada. Base: HEAD de main con bf55151.

**Repo:** implícito en el cwd `graph_ui`; las referencias `../../deskops/...` apuntan fuera del árbol.

**Límites:** fuera `shell/api.js`, `frontends/workspace/`, mutaciones, render Markdown, WS13.2/WS13.3, multidesk, API nueva de sldb, aceptación de WS13.1, Scion, push, puertos 8090-8092 y tareas hermanas. Executor no commitea ni toca Board; sin mocks/stubs, stores temporales reales.

## AMBIGUEDADES

1. *"Archivos, lista cerrada (...) frontends/mindmap/sldb_adapter.py solo añadiendo funciones de lectura"*: la lista se declara cerrada pero admite una excepción condicionada a declaración. Obliga a decidir si el adapter está dentro o fuera; no a inventar contenido.
2. *"load_registered_model y la extracción pública del modelo; comprobar cuál existe en sldb.api"*: no nombra la función de extracción. Obliga a inspeccionar el API; si no existe, la propia tarea ordena bloqueo, no workaround.
3. *"Una sola instancia."*: no dice instancia de qué (store, vista, contenedor de estado). Obligaría a inventar el sujeto y el alcance del singleton.
4. *"con generación"*: no define mecanismo (contador, token, versión). Obliga a elegir implementación, no conducta.
5. *"comprobado con extract_section sobre bytes obtenidos por lectura protegida (...) para destino (...) no modelado"*: no aclara cómo verificar un destino no autorizado sin abrirlo, ni si un destino ilegible produce ancla rota. Obligaría a inventar política de lectura.
6. *"correspondences no cuenta correspondencias falsas"*: no define correspondencia falsa. Obliga a fijar el criterio.
7. *"documentos atrasados"*: no define el mapeo desde `EdgeIndex.stale`. Obliga a interpretar su semántica.
8. Baseline *"204 passed"* depende del entorno; obliga a asumir misma configuración.

## DRY-RUN

1. Leer bundle (`review-source.md`, checkpoints, contrato) y verificar `HEAD` contiene bf55151.
2. Escribir `declaracion-archivos.md` antes de tocar `sldb_adapter.py`, solo si hace falta lectura pública.
3. En `workspace_routes.py`: sustituir `document_edges`/rebuild por `load_edge_index(store, include_linked=False)`; si `EdgeIndex.stale` no vacío, responder `ok false`, `store_no_preparado` y documentos atrasados sin escribir; fuente autorizada sigue legible.
4. Sustituir identidad/metadata desde `indexed_documents`; aplicar guardias §3.3 antes de leer; leer fuentes autorizadas una a una; no llamar `editor_store.documents`, `resolve_runtime_doc` ni `load_runtime_documents`; payload desde bytes con API pública; no autorizado aparece en catálogo sin título y nunca se abre.
5. Vistas de nodo: procedencia con propietario; resaltar solo si propietario = documento abierto; conservar procedencias reales; estado con identidad y generación, descartar respuestas atrasadas y mostrar carga.
6. Anclas: clasificar con `extract_section` antes de navegar; si falta, `ancla_inexistente` con origen y causa, no navegable, sin transcluir.
7. Corregir `test_workspace_cycle_and_2hops_real_edges` para preparar store antes del GET y añadir rechazo; crear casos negativos de los cinco puntos; ejecutar los cuatro comandos de validación y comparar con 204 passed.
8. Entregar `result-summary.md` y handoff; sin commit.

Errores esperables: ausencia de API pública de extracción → bloqueo documentado; layout no canónico → bloqueo con observación, sin `_already_canonical`.

## FUTURO

Supervisor: commit y demo en 8092 sobre copia temporal. Tester independiente: ejecuta y escribe `tester-result-summary.md`. Root: decide aceptación de WS13.1. sldb: recibe intake sobre layout no canónico/API de extracción. Quedan pendientes WS13.2, WS13.3, WS16 y G_HUMAN_READ.
