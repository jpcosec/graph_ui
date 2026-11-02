## REFORMULACION

**Objetivo:** entregar en el host Mindmap un lector de solo lectura con render y fuente cruda íntegra desde una única lectura de bytes, contexto real, seguimiento de enlaces y foco compartido donde exista procedencia.

**Alcance:** solo el nodo WS13.1 del plan de deskops (dag revisión 10); contrato de navegación sha256 `6a4f8518…` y operaciones solo como límite de no escritura.

**Repo:** HEAD de main que hereda `a1b2b22`. Archivos cerrados: `frontends/mindmap/workspace_routes.py`, `frontends/mindmap/views/workspace/node/`, `tests/test_mindmap_workspace_reader.py`, `tests/e2e_mindmap_workspace.py`; opcionales `sldb_adapter.py` (solo una función) y `serve.py` (solo despacho), declarados antes en `declaracion-archivos.md`.

**Límites:** sin commits, sin cerrar ni avanzar el Board, sin mocks ni stubs, puertos libres distintos de 8090/8091/8092, sin edición, mutación, Changes, Integrity, Agents, multidesk, Scion, Kimun ni push. La demo en 8092 la levanta el Supervisor.

## AMBIGUEDADES

1. «Encargo: runs/subagents/20261102-ws13-1-lector/review-source.md y review-source-2.md»: `review-source-2.md` no aparece en `references` ni en el bundle. Obligaría a inventar su contenido o a bloquear con lo declarado.
2. «ambos o ninguno dan 400»: no fija código ni cuerpo para `path` inexistente, fuera del root, denegado por guardia o no `.md`. Obligaría a inventar el contrato de error que consumirá la UI.
3. «doc_status(<directorio del store>, "local:" + ruta)» frente a «sha256 de todos los archivos bajo .sldb»: no queda fijado si el argumento es el root del repo o el directorio `.sldb`. Elegir mal altera el rastreo y la línea base de mutación.
4. «guardias … 256 KB, binario, codificación»: no define cómo se detecta binario, qué codificación se acepta ni el error asociado. Obligaría a inventar heurística y mensaje.
5. «objeto {doc, field, position, value}»: `position` no se define (índice de lista, offset o línea). Obligaría a inventar su semántica y su aserción.

## DRY-RUN

1. Leer bundle: TaskDoc, `review-source.md`, `suplemento-8090.md`, contratos citados y `ws13-1-g-ui-read.md`; verificar sha256.
2. Línea base: `pytest` de las suites de Validation; anotar fallos previos.
3. Confirmar firmas reales: `parse_links`, `split_anchor`, `doc_status`, `build_document_ir_json`, `extract_sections`, `load_edge_index`.
4. En `workspace_routes.py`, añadir `GET /api/workspace/source`: validar `id`/`path` (400), leer bytes una vez, aplicar guardias (resolve, `.git`, check-ignore con fallo cerrado, directorio, 256 KB, binario, codificación), resolver identidad (`doc_status` → `Model:name`), construir render con `build_document_ir_json(runtime_doc, texto, template)` y devolver fuente íntegra, sha256 y secciones con `line_start`/`line_end`.
5. Enlaces: `parse_links` → `split_anchor` → clasificar prefijo; `local:` con `doc_status` y contención antes de leer; externo solo se muestra; otro prefijo literal; no modelado relativo al documento y luego al root.
6. UI en `views/workspace/node/`: un único lector, foco por procedencia, alternancia Document/Graph/Code sin cambiar URL ni revisión, rango local de Code.
7. Opcionales solo si son imprescindibles, con línea de motivo en `declaracion-archivos.md`.
8. Pruebas nuevas con stores y desks temporales reales; e2e en navegador real en puerto libre; hash de `.sldb` y del archivo antes/después de cada GET; comparar `pytest` con la línea base.
9. Entregar `result-summary.md` (forma de respuesta, bloqueos), `validation.log` y handoff al Tester.

**Errores esperados:** 400 por parámetros, denegaciones de guardia, revisión distinta entre render y fuente, mutación detectada, lector duplicado en DOM. **Resultado esperado:** suites verdes, cero mutación, sin mocks.

## FUTURO

El Tester independiente ejecuta y deja `tester-result-summary.md`. El Supervisor levanta la demo en `127.0.0.1:8092` sobre copia temporal. WS13.2 consume la forma de respuesta y define la lista de permitidos; WS13.3 pestañas y split; WS15.1 shell. No se hace commit ni se avanza el Board.
