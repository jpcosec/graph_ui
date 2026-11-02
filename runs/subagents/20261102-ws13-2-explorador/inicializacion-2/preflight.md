## REFORMULACION

**Objetivo:** entregar en el host Mindmap un explorador de documentos reales —modelados (vía `indexed_documents`) y Markdown no modelado— navegable sin conocer ID, con refresco explícito, que reutiliza el lector WS13.1 (por `id` o `path`) y tolera modelos que no cargan sin derribar `/nodes` ni el catálogo.

**Alcance:** lista cerrada de archivos (explorer nuevo, `workspace-view.js`/`workspace.css`, `workspace_routes.py`, tres tests nuevos/tocados), permitidos H-02 (`WORKSPACE_EXPLORER_ROOTS`, default `desk,docs`, solo `.md`, exclusiones de punto/`__pycache__`/`node_modules`, symlinks, `git check-ignore`, tope 5000), `GET /api/workspace/explorer` sin caché, catálogo degradado (`modelo_no_carga`), aviso de relaciones en Grafo/contexto. Sin mutaciones, sin shell, sin WS13.3.

**Repo:** `UIs/graph_ui`, base HEAD de main posterior al commit del recibo.

**Límites:** Executor implementa y prueba, sin commit ni Board; commit y demo los hace el Supervisor; Tester es otro agente. Sin mocks/stubs (pill).

## AMBIGUEDADES

1. **«los dos avisos»** (§Scope, archivos) sin enumerar. ¿Son `truncado`, `roots_invalid`, `modelo_no_carga` y el de relaciones? Obliga a inventar cuáles son los "dos".
2. **«Un modelo autorizado que no carga»** (§4). "Autorizado" no define criterio. Obliga a inventar el mecanismo de autorización.
3. **«/node responde degradado, no 500»** (§4): forma del payload no especificada. Obliga a inventar esquema.
4. **«preparar fuera antes»** (§5): verbo ambiguo (¿ejecutar prepare en otro proceso?). Obliga a interpretar.
5. **`tests/test_mindmap_workspace_reader.py`** en lista cerrada pese a "sin lector paralelo": ¿qué se le añade? No se dice.
6. **Puerto 8092**: fuera de alcance (§Fuera) pero el Supervisor hace "demo en 8092". Contradicción directa.
7. **Default `desk,docs`**: comportamiento si la carpeta no existe no se define (¿silencioso o `roots_invalid`?).
8. **«218 previas pasando»**: cifra frágil; no se ancla a commit.

## DRY-RUN

1. Leer bundle y contratos (`navegacion.md` sha256 indicado).
2. `workspace_routes.py`: `__init__` lee `WORKSPACE_EXPLORER_ROOTS` una vez; validar entradas; nuevo handler `GET /api/workspace/explorer` que combina `indexed_documents` + walk de permitidos (sin abrir archivos), aplica exclusiones, `git check-ignore --stdin -z` único, tope 5000, deduce duplicados por `Model:name`, y envuelve cada modelo en try/except → `modelo_no_carga` + texto de excepción.
3. `explorer/`: árbol por carpetas y por modelo, filtro local, abrir → lector WS13.1; botón refresco recarga `/nodes` y `/explorer`.
4. `workspace-view.js`/`.css`: montar explorador, avisos (relaciones y degradado/truncado según se decida) sin tocar el selector existente.
5. Tests: explorer, reader, e2e, `node --test`, suite completa.
6. **Errores esperados:** fallo de validación de roots → `roots_invalid`; store inexistente → error sin crear; `git check-ignore` falla → fallo cerrado; modelo importable falla → entrada degradada, resto vivo.
7. **Resultado esperado:** todas las validaciones del Done When en verde; hashes de `.sldb`, documentos, git status y HEAD idénticos antes/después de cada GET; solo peticiones GET.

## FUTURO

- **Supervisor:** commit y demo en 8092 sobre copia temporal.
- **Tester independiente:** `runs/subagents/20261102-ws13-2-explorador/tester-result-summary.md` con navegador real.
- **Autoridad de contrato:** resolver las ambigüedades 1–5 antes de aceptar, o aceptar la decisión documentada en `result-summary.md`.
- **`result-summary.md`:** forma JSON de `/explorer`, orden del árbol, bloqueos sin workaround.
- **Pendiente:** G_HUMAN_READ y WS16; WS13.3 (pestañas/split) fuera.
