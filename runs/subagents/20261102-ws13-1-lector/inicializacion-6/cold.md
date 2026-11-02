## REFORMULACION

- **Objetivo**: entregar en el host Mindmap (graph_ui) el lector WS13.1 de solo lectura: Markdown modelado y no modelado con render y fuente cruda íntegra desde una sola lectura de bytes, revisión sha256, contexto real, enlaces del texto y foco interno por documento.
- **Alcance**: ruta `GET /api/workspace/source` en `WorkspaceRoutes`; UI en `views/workspace/node/`; foco por sección/span, `field_path`, referencia `{doc, field, position, value}` y arista `schema` con todas sus procedencias; rango local de Code; una sola instancia documental al alternar Document/Graph/Code.
- **Repo**: graph_ui, base `a1b2b22`, HEAD al despacho.
- **Límites**: lista cerrada de archivos; opcionales (`sldb_adapter.py`, `serve.py`) solo con línea de motivo previa; sin escritura, sin `document_edges`/`rebuild`, `load_edge_index(include_linked=False)`; Executor en puertos libres ≠8090/8091/8092; fuera Changes, Integrity, Agents, WS41, WS19, Scion, Kimun, shell/api.js.

## AMBIGUEDADES

1. «Se usa `extract_sections` si la prueba comprueba que títulos, niveles y spans coinciden con lo escrito en el fixture; si no, render propio sobre la misma lectura» — el Executor redacta a la vez el juez y el juicio; obligaría a inventar el criterio de coincidencia (extensión del span de `extract.py`, tolerancias).
2. «Rastreo: `doc_status(...)`; si la consulta falla, se trata como no rastreado» — no cubre los estados `ok/ambiguous/link-broken`; obligaría a inventar si `ambiguous` cuenta como rastreado o como error.
3. «Forma de la respuesta: la decide el Executor con estos campos mínimos» — nombre y forma de identidad, revisión y span quedan abiertos; WS13.2/13.3 dependen de ello; obligaría a inventar el contrato de consumo si no se documenta en `result-summary.md`, como la propia TaskDoc exige.
4. «Fixture: un Markdown real escrito en el store temporal» — el no modelado no vive en `.sldb` sino en el repo/desk; obligaría a inventar si el fixture va bajo `repo_root` o bajo `.sldb`.

## DRY-RUN

Ejecutor futuro: 1) leer bundle y medir baseline; 2) en `workspace_routes.py` despachar `/api/workspace/source` (`id` XOR `path`), helpers de guardias y lectura única de bytes; 3) en `views/workspace/node/` módulos nuevos de lector, fuente cruda, enlaces y foco; 4) `tests/test_mindmap_workspace_reader.py` con store y desk temporales reales y `tests/e2e_mindmap_workspace.py` con Playwright y `serve.py` temporal; 5) `result-summary.md`, `validation.log` y handoff. Errores esperados: 400 (`id`+`path` o ninguno), 403 (`fuera_del_repo`/`protegido`), 404 (`no_existe`), 413 (`demasiado_grande`), 415 (`binario`/`directorio`/`no_markdown`). Resultado: pytest verde y sha256 del store y del archivo leído iguales antes y después de cada GET.

## FUTURO

El Tester independiente produce `tester-result-summary.md` con ejecución real; el Supervisor levanta la demo en 127.0.0.1:8092 sobre copia temporal y abre checkpoint. WS13.2 decide la lista de permitidos y el explorador; WS13.3, pestañas e historia; WS41, lectura multidesk. `G_HUMAN_READ` y WS16 siguen pendientes ante P01.
