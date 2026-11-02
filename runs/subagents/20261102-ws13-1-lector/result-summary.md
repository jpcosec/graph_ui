# Resultado WS13.1: lector de documento, fuente, contexto, enlaces y foco

Executor Claude Sonnet 5.5, 2026-11-02. Sin commits, sin tocar el Board. Parte del HEAD de main (graph_ui `20e5797`) con solo las tres notas de `desk/inbox` ajenas sin rastrear.

## Archivos

Cambiados (todos dentro de la lista cerrada de la TaskDoc):

- `frontends/mindmap/workspace_routes.py` (modificado)
- `frontends/mindmap/views/workspace/node/workspace-view.js` (modificado)
- `frontends/mindmap/views/workspace/node/workspace.css` (modificado)
- `frontends/mindmap/views/workspace/node/reader.mjs` (nuevo, módulo ahí)
- `tests/test_mindmap_workspace_reader.py` (nuevo, 24 pruebas)
- `tests/e2e_mindmap_workspace.py` (modificado: se conserva la prueba previa y se añaden 3)

Opcionales: NO se editó `sldb_adapter.py` ni `serve.py` (serve.py ya despacha todo `/api/workspace/*` a `WorkspaceRoutes`, `serve.py:320-323`). Por eso `declaracion-archivos.md` no tiene entradas nuevas. No se tocó `workspace.mjs` (sus helpers y `tests/mindmap-workspace.test.mjs` siguen iguales), `shell/api.js`, `frontends/workspace/`, `persistence.py`, `desk/inbox`, tareas hermanas ni los puertos 8090, 8091, 8092.

## Cambios por punto del alcance

| Punto | Dónde |
|---|---|
| Ruta `GET /api/workspace/source` (id o path, excluyentes; ambos o ninguno 400 `seleccion_invalida`) | `workspace_routes.py:113-118` (dispatch), `:711` `workspace_source` |
| Guardias de lectura (mismos estados que `_inspect_file_reference`) y mapa estado a HTTP | `:48` `SOURCE_STATE_HTTP`, `:656` `_guard_markdown_file`, `:686` `_read_markdown_bytes` |
| Identidad Model:name prevalece sobre path (doc_status `local:`+ruta; `ambiguous` visible, 409) | `:703` `_tracked_status`, `:711` |
| Lectura única de bytes: texto, revisión, IR (`build_document_ir_json` con el texto ya leído) y secciones salen de los mismos bytes | `:711-830` |
| Secciones: modelado desde la estructura del IR; no modelado con `extract_sections` de sldb sobre la misma lectura | `:836` `_sections_from_ir`, `:856` `_sections_from_text` |
| Contexto real con `load_edge_index(include_linked=False)`, sin `document_edges` ni rebuild | `:381` `_document_edges`, `:865` `_source_context` |
| Procedencia de aristas (lista; la deduplicación no descarta campos distintos) | `:381` `_document_edges`; también añadida a `/node` en `_build_graph_neighborhood` (`~:410-440`) |
| Enlaces: parse_links, split_anchor, prefijo, `local:` una vez, externo no se abre, dos puntos literal local, relativo al directorio del doc y luego root, contención antes de leer | `:883` `_resolve_links`, `:910` `_classify_link` |
| Referencia de Code con `{doc, field, position, value}` (posición 0-based contando omitidos) | `:~510-527` `_build_code_projection` |
| UI: render (bloques con enlaces vivos), fuente cruda literal sin vínculos, estructura IR, lista de enlaces, contexto, instancia única | `workspace-view.js` `RenderedDocument` `:170`, `RawSource` `:200`, `WorkspaceView` `:225`; `reader.mjs` `renderBlocks` `:35`, `splitInline` `:18` |
| Foco compartido (sección por span, campo por field_path, referencia, arista schema) y barra de correspondencia | `reader.mjs:105-185`; `workspace-view.js` (barra de foco, `edge-item`, `field-focus`, `section-focus`, `code-ref-focus`) |
| Rango local de Code (clic, Shift+clic, vista de archivo completo, estado local sin persistir; el fragmento :N±5 se conserva) | `workspace-view.js:41` `CodeFileView`; `reader.mjs:188` `nextRange` |
| No modelado: Graph y Code muestran estado explícito sin grafo ni referencias | `workspace-view.js` `data-testid="no-graph"` y `"no-code"` |
| Selección por URL `id` o `path` (+ `anchor`, `depth`, `tab`) | `workspace-view.js` `updateUrl`, `reader.mjs:199` `targetFromSearch` |

## Forma exacta de `GET /api/workspace/source` (para WS13.2 y WS13.3)

Petición: `/api/workspace/source?id=Model:name` (o nombre bare, misma resolución que hoy) o `/api/workspace/source?path=<ruta relativa al root, con />`. Exactamente uno; si no, 400 `{ok:false, error, estado:'seleccion_invalida'}`. Solo GET (otros métodos no están en la ruta). Sin parámetro de alias: toda lectura es del desk del proceso.

Éxito (200):

```
{
  ok: true,
  identity: {
    kind: 'modeled' | 'unmodeled',
    id: 'Model:name' | null,
    model_name: str | null, name: str | null,
    repo: 'local',
    path: 'ruta/relativa.md',            // origen; para un modelado es su ruta en disco
    requested: {id: ...} | {path: ...}   // lo que se pidió; un path rastreado responde kind 'modeled' sin redirección
  },
  revision: sha256 hex de los BYTES leídos,
  size: int (bytes), encoding: 'utf-8' | 'utf-8-replaced', line_count: int,
  text: str,                              // bytes decodificados; con utf-8-replaced no se promete identidad con la revisión
  sections: [{title, slug, level, path, line_start, line_end}],   // spans en líneas 1-based, como el IR
  fields: [{field_path, value, span: {line_start, line_end} | null}],  // solo modelado; vacío si no modelado
  ir: {...} | null, ir_error: str | null, // IR del builder público; null en no modelado o si el builder falló
  descriptor: {payload, semantic_tags} | null,  // solo para campos, como tal
  degraded: bool,                         // modelado cuyo descriptor no se pudo cargar (se sirve igual el texto)
  links: [{raw, target, kind, predicate, line, anchor,
           status: 'ok'|'roto'|'externo'|'no_markdown',
           estado?: 'no_existe'|'fuera_del_repo'|'protegido'|'ambiguous'|'no_markdown'|'directorio'...,
           cause: str, path?: ruta resuelta,
           open: {id} | {path} | null,
           origin: {doc, path, line}}],
  context: {id, name, model_name, repo, path, revision,
            incoming_relations: [edge]|null, outgoing_relations: [edge]|null,
            relations_error: str|null, relations_absent: str|null}
}
edge = {source, target, type, origin, relationDoc,
        provenance: [{origin, field?, declared?, allowed_models?, source_field?, ref_path?, ref_index?, ...}]}
```

Error (JSON `{ok:false, error, estado}`): 404 `no_existe`; 403 `fuera_del_repo` y `protegido` (.git, ignorado por git con fallo cerrado); 415 `binario`, `directorio`, `no_markdown`; 413 `demasiado_grande` (tope 256 KB de `MAX_CODE_BYTES`); 503 `sin_repo_root`; 500 `error_lectura`; 409 `ambiguous` (decisión mía, ver abajo); 400 `ruta_invalida`; un `id` inexistente da 404 y uno ambiguo 400 como en `/node`.

Cambios aditivos en `/api/workspace/node` (que NO recibe path): cada archivo de `projections.code.files[]` lleva `doc`, `field` (`files` o `references`), `position` y `value`; cada arista de `projections.graph.edges[]` lleva `provenance` (lista).

Foco en la UI (estado local de la instancia, no en la URL): `{kind:'section', path, title, line_start, line_end}`, `{kind:'field', field_path}`, `{kind:'reference', doc, field, position, value}`, `{kind:'edge', source, target, type, relationDoc}`. Funciones puras de correspondencia en `reader.mjs`.

## Decisiones de implementación tomadas

1. `ambiguous` de `doc_status` para un `path`: 409 `{estado:'ambiguous'}`, visible y sin abrir. En un enlace, el destino ambiguo se marca `roto` con `estado:'ambiguous'`.
2. Orden de guardias: contención (resolve siguiendo symlinks), `.git`, existencia, ignorado por git, directorio, sufijo `.md`, tope, byte nulo. `.git` va antes que la existencia para no revelar nada; un archivo ignorado inexistente responde `no_existe`. Un `path` absoluto dentro del root se relativiza; fuera del root da `fuera_del_repo`.
3. Las mismas guardias se aplican a la lectura por `id` de un modelado (ruta del descriptor).
4. Un modelado degradado (el descriptor no carga) se sirve con texto y secciones de `extract_sections`, `ir: null` y `degraded: true`.
5. Las secciones de un modelado salen de `ir.structure` (aplanada); la prueba verifica que coinciden con `extract_sections` sobre el texto devuelto. Para no modelado, `extract_sections` coincidió con lo escrito (títulos, niveles, `line_start`; `line_end` por la regla de sldb), por lo que NO hizo falta render propio de secciones.
6. Render legible: no existe un renderizador Markdown en el repo y el cliente no debe parsear. `reader.mjs` parte el texto de la misma lectura en bloques (frontmatter, encabezados, listas, código, párrafos) y sustituye `[[...]]` por vínculos según la resolución del servidor (`links`). Es presentación; secciones y spans vienen de la ruta. Los enlaces con ancla navegan con `?anchor=` y la UI enfoca la sección por título o slug (sin coincidencia: aviso visible).
7. `/api/workspace/node` conserva su llamada previa a `document_edges` (reconstruye el índice). La TaskDoc dice que esa ruta no cambia y que `tests/test_mindmap_workspace.py` (fuera de la lista cerrada) escribe documentos sin pasar por la API pública y espera el grafo reconstruido. La procedencia se añade con `load_edge_index` aparte. Ver bloqueos y límites.
8. La UI de un modelado carga `/source` (render, fuente, IR, enlaces, contexto) y `/node` (grafo y código); lo documental sale solo de `/source`, de modo que el render y la fuente son de la misma revisión. El panel Documento queda siempre montado (con `hidden`) para que alternar pestañas no añada ni quite lectores: `[data-testid="document-reader"]` es único.
9. Robustez de fuentes en `workspace.css`: el `monospace` genérico de Chromium en este equipo resuelve a una fuente de alto cero (el texto de `code`, identificadores y tabla de código salía en blanco; es probablemente lo que root observó como valores vacíos). Se fijó una pila con fuentes concretas para `code`, `pre` y los usos de `monospace`. Comprobado con capturas.

## Resultados reales (comandos y conteos)

Todo en `validation.log` (idéntico a `stdout.log`); `stderr.log` tiene 2 líneas, sin trazas.

| Comando | Resultado |
|---|---|
| `python -m pytest -q tests/test_mindmap_workspace_reader.py` | 24 passed (87.06 s) |
| `python -m pytest -q tests/test_mindmap_workspace.py tests/test_parallel_workspace_serve.py` | 17 passed (58.05 s) |
| `python tests/e2e_mindmap_workspace.py` | exit 0, pero ese archivo no tiene `__main__`: ejecuta cero pruebas. La verificación real es la siguiente línea |
| `WORKSPACE_SCREENSHOT_DIR=runs/.../capturas python -m pytest -q tests/e2e_mindmap_workspace.py` | 4 passed (46.94 s): la prueba previa y 3 nuevas |
| `node --test tests/mindmap-workspace.test.mjs` | exit 0 (los 7 helpers existentes) |
| `python -m pytest -q tests` | **204 passed**, 2 warnings (10 min 58 s). Línea base: 177 passed. Diferencia: +24 del lector, +3 e2e nuevas = +27, ninguna previa rota |

Capturas (reales, de Chromium sobre el host Mindmap con servidor temporal) en `runs/subagents/20261102-ws13-1-lector/capturas/`: `reader-unmodeled-document.png`, `reader-unmodeled-no-graph.png`, `reader-modeled-document.png`, `reader-modeled-graph-focus.png`, `reader-code-range.png`, `workspace-desktop.png`, `workspace-mobile.png`. Revisé visualmente `reader-unmodeled-document`, `reader-modeled-graph-focus` y `reader-code-range`.

Cobertura de "Pruebas que deben existir" (`tests/test_mindmap_workspace_reader.py` salvo indicación):

- fuente íntegra byte a byte, modelado y no modelado; misma revisión en render y fuente (y en `/node`): `test_modeled_source_is_byte_exact_and_same_origin`, `test_unmodeled_source_sections_match_written_text`
- identidad Model:name para un path rastreado, id/path excluyentes, `/node` no recibe path: `test_tracked_path_prevails...`, `test_selection_requires_exactly_one...`
- contexto real: `test_modeled_context_has_real_relations_with_provenance`
- enlace que resuelve, roto, con ancla, externo, no `.md`, escape, `local:`, relativo primero y luego root, enlace a modelado, y dos puntos sin saltar de store (el fixture tiene el store `deskops` enlazado y `[[deskops:task-fantasma]]` queda roto): `test_links_*`
- referencia por campo y posición (con un elemento omitido que desplaza la posición): `test_code_references_keep_field_and_position`
- multiplicidad de procedencias (una arista, `depends_on` e `inherits_from`): `test_edge_provenance_keeps_every_field` y e2e
- contención, symlink que escapa, `.git`, gitignorado, no `.md`, directorio, binario, demasiado grande, no existe, UTF-8 con reemplazo: `test_read_guards` (10 casos), `test_invalid_utf8_...`, `test_absolute_path_...`
- store y archivos sin cambios tras cada GET (sha256 de todo `.sldb` y de los archivos leídos antes y después de cada GET, incluidos `/nodes`, `/source` y `/node` depth 2): `test_reads_do_not_modify_store_or_files`; POST no está en la ruta: `test_source_route_rejects_mutating_methods`
- foco que sobrevive al alternar Document, Graph y Code con la misma identidad en URL, misma revisión y un solo lector; foco de campo, referencia y arista con correspondencia; rango local de Code (clic, Shift+clic, sin tocar la URL, persiste al alternar); seguir enlace con ancla y atrás; refresco sin copia; error visible `.git/config`: `test_reader_*` en `tests/e2e_mindmap_workspace.py`

## Transferencia explícita

A WS13.2 (explorador):
- Abrir sin conocer el id: usar la URL `/workspace/node?path=<ruta>` o `?id=Model:name`; `/api/workspace/source` ya sirve cualquier `.md` del desk del proceso aplicando las guardias, sin lista de permitidos (la lista y el listado de Markdown no modelado son suyos; no se inventó ninguna).
- `GET /api/workspace/nodes` sigue siendo el catálogo de modelados; no hay endpoint que liste no modelados.
- La selección vive en el componente `WorkspaceView` (`target` = `{id}` o `{path}`; `openTarget`); `targetFromSearch` y `targetKey` en `reader.mjs` son los puntos de entrada.

A WS13.3 (pestañas y split):
- Un lector es una instancia de `WorkspaceView`; el estado (`target`, `source`, `nodeData`, `focus`, `ranges`) es local al componente. Para varias pestañas habrá que elevarlo o instanciarlo por pestaña; hoy se asume un solo lector (el e2e lo aserta).
- Si se añaden vistas en paralelo que comparten foco, las funciones de correspondencia (`correspondence`, `*Highlighted`) son puras y reutilizables.

## Bloqueos y límites (concretos)

1. `GET /api/workspace/node` no cumple "sin mutación en lectura": sigue llamando `document_edges`, que reconstruye el índice (`rebuild_edges`). Es legado; la TaskDoc dice que esa ruta no cambia y no está en las rutas del delta. Con un store canónico no escribe (la prueba de hashes incluye `/node` y pasa), pero sobre un store con shards viejos podría escribir. Sustituirlo por `load_edge_index` rompería `tests/test_mindmap_workspace.py::test_workspace_cycle_and_2hops_real_edges`, que escribe un documento fuera de la API pública y espera la reconstrucción, y ese archivo no está en la lista cerrada. Queda para quien decida ese cambio (con ajuste de esa prueba).
2. `python tests/e2e_mindmap_workspace.py` (comando literal de done_when) devuelve exit 0 sin ejecutar nada porque el archivo es de pytest. Corrí el archivo con pytest como verificación real.
3. No se adoptó ningún otro bloqueo: el criterio de store sin cambios se sostuvo con API pública (`open_store` readonly, `doc_status`, `load_edge_index`), sin workaround de formato interno.

## Lo que no verifiqué

- No hay Tester independiente: este resultado no es PASS de Tester. Los e2e los escribí y ejecuté yo.
- Solo Chromium de Playwright, en Linux; sin Firefox ni WebKit; no probé con la CDN `esm.sh` caída.
- La captura móvil existente (`workspace-mobile.png`) no se revisó visualmente tras mis cambios; el e2e previo asegura que no hay desbordamiento horizontal.
- No probé la UI contra el store real de graph_ui ni contra 8090/8091/8092 (no los toqué).
- Sin pruebas en JavaScript de las funciones puras de `reader.mjs` (solo cubiertas por el e2e); un `.test.mjs` nuevo estaba fuera de la lista cerrada.
- Archivos Markdown de más de 256 KB se rechazan (413); no medí el rendimiento del render con documentos grandes cercanos al tope.
- `parse_links` no entrega posición: la línea de cada enlace es la primera aparición del texto crudo; con el mismo enlace repetido muestra solo la primera línea y resuelve una vez.
- No contrasté el render propio de bloques con otros motores Markdown (tablas, citas y énfasis se muestran como texto de párrafo).
- G_HUMAN_READ y WS16 siguen pendientes; esto no los cumple.
