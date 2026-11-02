## REFORMULACION

**Encargo:** implementar en el host Mindmap (graph_ui, base a1b2b22) el nodo WS13.1: lector de solo lectura con render y fuente cruda íntegra del mismo origen, para Markdown modelado (`Model:name`) y no modelado (`path` relativo); contexto real; seguimiento de enlaces `[[…]]` con la composición de navegación §5.2; y foco interno por documento limitado al dominio 6.1 (sección+span, `field_path`, referencia por {doc, field, position, value}, arista schema con procedencia), sin inventar mapeos.

**Alcance:** lista cerrada de archivos (workspace_routes.py, views/workspace/node/, dos tests nuevos); opcionales sldb_adapter.py y serve.py solo con línea de motivo en declaracion-archivos.md. Sin escritura, sin commits, sin tocar 8090/8091, sin WS13.2/13.3, sin Changes/Agents/Integrity.

**Límites:** contratos navegacion (sha 6a4f85…) y operaciones (sha 754546…) como autoridad; guardias §3.3; `include_linked=False`; no `document_edges`; criterio H-14 por sha256 del store antes/después de cada GET, con bloqueo declarado si no se sostiene; sin mocks.

## AMBIGUEDADES

1. **Demo y puerto.** «Fuera de alcance: … puertos 8090 y 8091 y sus stores». La TaskDoc no exige demo, pero review-source-2 pide «URLdemo8092» y la aceptación exige Tester en navegador real sobre el host. Obligaría a inventar: si se levanta servidor, con qué store temporal, quién lo mantiene y qué URL se entrega.
2. **Fixture del render no modelado.** «una prueba sobre un Markdown no modelado real del fixture muestra secciones correctas». No se define el fixture ni qué secciones son «correctas»; obligaría a inventar el documento de prueba y el criterio de corrección.
3. **Una sola lectura frente a `document_ir`.** «sldb_adapter.py, solo añadiendo una función … sin alterar document_ir para otros consumidores». `document_ir` lee el archivo por dentro; no se dice si la función nueva puede duplicar su cuerpo ni si basta una envoltura, ni si «una función» es límite literal. Obligaría a decidir el mecanismo de mismo origen sin contrato.
4. **Observable de «sin abrir copia».** «foco que sobrevive al alternar Document, Graph y Code sin abrir copia». No se define cómo se comprueba (¿un solo GET?, ¿misma revisión?, ¿DOM?). Obligaría a inventar el aserto del test.

## DRY-RUN

Ejecutor futuro: lee bundle (TaskDoc, navegacion, suplemento-8090, átomos, rituales), baseline de `tests/test_mindmap_workspace.py`+`test_parallel_workspace_serve.py`, declara opcionales. En `workspace_routes.py`: resolver `path` con guardias §3.3, lectura única de bytes, sha256 de revisión, secciones vía `extract_sections`/builder sobre esa lectura, `_build_code_projection` preservando {doc, field, position, value} antes de concatenar, sustituir `document_edges` por `load_edge_index(include_linked=False)`, enlaces con `parse_links`+`split_anchor`+`doc_status(store,"local:"+resto)`. En `views/workspace/node/`: pestaña Documento con texto crudo y foco local (sección/campo/referencia/arista), rango C14a en Code. Tests nuevos con store y desk temporales reales (incluye repo git para `.git`/gitignore y symlink que escapa). Errores esperados: 400 por ambos/ningún parámetro, guardias, referencia rota E5, y posible bloqueo H-14 si `open_store` escribe. Resultado: ruta y UI verdes, `result-summary.md` + `validation.log`, handoff al Tester.

## FUTURO

Tester independiente produce `tester-result-summary.md` con navegador real; el Supervisor (no el Executor) decide closeout y commit atómico; root revisa el checkpoint y promueve WS13.2/13.3 por el DAG; G_HUMAN_READ y WS16 siguen pendientes de recorrido humano. La demo en localhost se entrega con URL, commit y capturas.
