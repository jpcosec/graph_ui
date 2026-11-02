# REFORMULACION

**Objetivo.** Entregar en el host Mindmap un lector de solo lectura de un documento (modelado `Model:name` y Markdown no modelado por `path`), con render y fuente cruda íntegra derivados de **una sola lectura de bytes**, contexto real, seguimiento de enlaces del desk propio y foco interno donde WS11 defina correspondencia.

**Alcance.** Nodo WS13.1 (`dag.yaml`), contrato fuente `navegacion.md` sha256 `6a4f85…361e` con nota de aprobación; `operaciones.md` solo como límite (nada de escritura). Definiciones cerradas de identidad, selección en URL, guardias, mismo origen, enlaces, foco, rango local de Code y contexto. Sin edición, sin commit, sin rutas de mutación, sin alias/multidesk, sin 8090/8091.

**Repo y archivos (lista cerrada).** graph_ui: `frontends/mindmap/workspace_routes.py`; `frontends/mindmap/views/workspace/node/` (incluye módulos nuevos ahí); `tests/test_mindmap_workspace_reader.py`; `tests/e2e_mindmap_workspace.py`. Opcionales con declaración previa en `declaracion-archivos.md`: `sldb_adapter.py` (solo añadir función, sin alterar `document_ir`) y `serve.py` (solo despacho de ruta).

**Límites.** Sin mocks/stubs; stores y desks temporales reales; puertos libres ≠ 8090/8091/8092 para el Executor; sin `document_edges` ni `rebuild`; `load_edge_index(include_linked=False)`; criterio observable de no mutación por sha256 antes/después de cada GET; bloqueo concreto en `result-summary.md` si no se sostiene con API pública.

# AMBIGUEDADES

1. «llamando al builder público `build_document_ir_json` con el texto ya leído» — el contrato (§C5b) describe ese builder consumiendo un descriptor `{store, path, name, payload, model, semantic_tags}`, no texto, y declara la reutilización «por verificar». Obliga a inventar firma/API o a releer el archivo, lo que rompe «una sola lectura».
2. «No modelado: `path=<ruta relativa>`, excluyente con `id`» junto a «Si el store rastrea el archivo, `Model:name` prevalece»: no dice qué responde `path=` sobre un archivo rastreado (400, redirección, o servir con identidad `Model:name`). Obliga a fijar un contrato público que WS13.2/13.3 consumirán.
3. «solo sufijo `.md`» (identidad no modelada) frente a «No modelado: resolución protegida de archivo» y las guardias generales, que admiten cualquier texto: no fija si un enlace a `.py`/`.txt` se lee, ni con qué identidad.
4. «resolución protegida de archivo» no fija la base de resolución del destino no rastreado (directorio del documento, `repo_root` = `store.parent`, o root de la URL). Obliga a inventarla.
5. «Base de código: graph_ui `a1b2b22`, HEAD del despacho en esta TaskDoc» choca con el recibo (`base a1b2b22`, `HEAD 20e5797`) y con `status: draft` en frontmatter: no fija desde qué commit se trabaja ni hay evidencia en el bundle de tarea activa en `Board` que el ritual de ejecución exige.
6. «la forma de la respuesta: la decide el Executor con estos campos mínimos»: nombre y ruta del endpoint no se fijan; es delegación explícita, pero deja a WS13.2/13.3 un consumo no contractual.

# DRY-RUN

Un Executor futuro leería TaskDoc, contratos §3.3/§4/§5.2/§6.1/§5.4, código vigente y suplemento. Declararía opcionales, si usa. Haría línea base (`tests/test_mindmap_workspace.py` + `test_parallel_workspace_serve.py`, hoy 17 passed). Implementaría en `workspace_routes.py` una ruta de lectura con parámetros excluyentes `id`/`path`, guardias §3.3, lectura única de bytes, `build_document_ir_json` sobre el texto, respuesta con identidad, ruta, revisión sha256, texto íntegro, secciones con `line_start/line_end` y arrastre de `field`/`position`/`value` en `files`/`references`; sustituiría `document_edges` por `load_edge_index(include_linked=False)`; añadiría enlaces vía `parse_links` → `split_anchor` → clasificación → `doc_status("local:"+resto)` → contención → lectura, y foco en `views/workspace/node/`. Errores esperados: 400 ambos/ninguno y guardias; bloqueo declarado si el builder no acepta texto preleído o si el sha del store cambia tras GET. Resultado esperado: tests nuevos verdes, baseline sin regresión, `result-summary.md` con la forma de respuesta, `validation.log` y handoff al Tester.

# FUTURO

El **Tester** independiente ejecuta y verifica comportamiento y DOM en navegador real. El **Supervisor** levanta la demo en 8092 sobre copia temporal. **WS13.2** consume la forma de respuesta documentada (lista de permitidos y explorador). **WS13.3** consume foco y clave de sesión. **Root** hace checkpoint y decide hojas siguientes; `G_HUMAN_READ` y WS16 siguen pendientes.
