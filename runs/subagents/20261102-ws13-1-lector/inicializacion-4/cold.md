## REFORMULACION

**Objetivo:** entregar en el host Mindmap un lector de solo lectura de documento modelado y de Markdown no modelado, con render y fuente cruda del mismo origen, contexto real, seguimiento de enlaces y foco compartido solo donde exista procedencia real.

**Alcance (lista cerrada):** `frontends/mindmap/workspace_routes.py`; `frontends/mindmap/views/workspace/node/` (workspace-view.js, workspace.mjs, workspace.css y módulos nuevos ahí); `tests/test_mindmap_workspace_reader.py`; `tests/e2e_mindmap_workspace.py`. Opcionales declarados antes de editar: `sldb_adapter.py` (solo añadir función) y `serve.py` (solo despachar ruta).

**Repo:** graph_ui, base `a1b2b22`, HEAD al despacho; contratos WS11 en deskops solo como lectura.

**Límites:** sin edición, commit, mutación, alias multidesk, Changes/Integrity/Agents, `shell/api.js`, `frontends/workspace/` como destino, puertos 8090/8091/8092; sin tocar tareas hermanas; sin mocks ni stubs.

## AMBIGUEDADES

1. «La fuente se devuelve íntegra y su sha256 coincide con la revisión» junto a la guardia «utf-8-replaced»: si los bytes no son UTF-8 válido, un campo de texto no puede ser byte-idéntico. Obligaría a inventar un transporte (base64, escapes) que nadie fija.
2. «Forma de la respuesta: la decide el Executor con estos campos mínimos: identidad, ruta, revisión, texto, secciones con span»: no fija nombres, anidamiento ni ubicación. El Executor inventa el esquema que consumirán WS13.2/13.3.
3. «el fixture prepara el store fuera del request» frente a «open_store puede migrar»: no dice con qué API pública se obtiene un store canónico. Obligaría a inventar el procedimiento.
4. «Contexto: identidad, ruta y relaciones de context y graph actuales, más la procedencia de campo cuando exista»: no aclara si son las del contexto, las de la proyección graph o ambas, ni deduplicación.
5. «referencia de archivo como objeto {doc, field, position, value}»: no fija si `position` es índice 0-based, 1-based o el ordinal original tras omitir elementos no textuales.
6. «clic en una línea y mayúsculas más clic para extender»: no dice qué ocurre con el resaltado `:N±5` existente ni si el rango cruza el fragmento.

## DRY-RUN

Ejecutor futuro: (1) añadir en `WorkspaceRoutes` la rama `GET /api/workspace/source`, leer bytes una vez con las guardias de navegación §3.3 (resolve, `.git`, check-ignore con fallo cerrado, directorio, 256 KB, NUL, codificación), calcular sha256 y llamar `build_document_ir_json(runtime_doc, markdown, template)` con ese texto, sin releer; validar `id` XOR `path` (400). (2) Componer enlaces: `parse_links` → `split_anchor` → prefijo → `doc_status(store,"local:"+resto)` o resolución protegida de archivo; rechazar http(s), informar rotos y no-`.md`. (3) Conservar `files`/`references` con campo y posición antes de concatenar; usar `load_edge_index(include_linked=False)` conservando metadata y multiplicidad. (4) En `node/`: vista de fuente con líneas, foco por sección/campo/referencia/arista, rango local de Code y estado único por documento. (5) Escribir ambas pruebas con stores y desks temporales reales.

Errores previstos: 400 por selector doble/ausente, 404, 503, estados `protegido`/`fuera_del_repo`/`demasiado_grande`/`binario`. Si no logra cero escrituras del store, bloqueo concreto en `result-summary.md`, sin workaround.

Resultado esperado: pytest del lector verde, e2e verde, baseline sin regresión, DOM con un solo lector.

## FUTURO

El Tester independiente ejecuta y verifica DOM/píxeles, y produce `tester-result-summary.md`. El Supervisor levanta la demo en `127.0.0.1:8092` sobre copia temporal. Root revisa el checkpoint y decide WS13.2/WS13.3; el esquema de respuesta les llega vía `result-summary.md`. `G_HUMAN_READ` y WS16 siguen pendientes.
