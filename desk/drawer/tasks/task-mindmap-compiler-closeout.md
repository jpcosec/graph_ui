# Task: Cierre del paso 8 — compilador mindmap (tests de endpoints, verificación en navegador, contrato de exportación)

## Contexto

El repo es `graph_ui` (raíz del workspace). El editor Mindmap/SLDB vive en
`frontends/mindmap/`. El plan maestro es `docs/mindmap-finalization-plan.md`;
el paso 8 (integrar el compilador) está **en curso**: el commit `8d484d1`
commiteó `compilation.py`, `compiler-dialog.js`, y los endpoints
`/api/validate`, `/api/plan`, `/api/compile`, `/api/export` en `serve.py`,
pero el propio plan declara lo que falta:

> "Antes de considerarlo listo faltan pruebas específicas de endpoints,
> verificación en navegador y revisión del contrato de exportación/recuperación;
> no se debe volver a implementar esa misma superficie desde cero."

Esta tarea cierra exactamente ese hueco. NO reimplementar la superficie.

## Estado actual verificado

- `frontends/mindmap/compilation.py` — clase `CompilationService(backend.adapter)`
  con método `run(mode, request)` donde `mode ∈ {validate, plan, compile, export}`.
- `frontends/mindmap/serve.py` — `do_POST` enruta `/api/save` a
  `editor_store.save(request)` y las 4 rutas del compilador a
  `self.compilation.run(route.rsplit('/',1)[1], request)`. Protección: rechaza
  `Origin` cross-origin (403), body máximo 5 MB (413), body no-dict (400),
  captura `(Exception, SystemExit)` → 500. `make_server(port=8088, store=None)`
  levanta `ThreadingHTTPServer` en 127.0.0.1.
- `frontends/mindmap/compiler.py` — `validate_source(source)` (no escribe),
  `plan_source(source, store)` (dry-run con reporte
  `creates/updates/unchanged/conflicts/invalid_payloads`), `compile_json(source, store)`.
- `frontends/mindmap/compiler-dialog.js` — `CompilerDialog` componente Preact que
  llama a la API y muestra el reporte.
- `frontends/mindmap/editor.js` — botón que hace `POST /api/export` con
  `{documents, view}` y abre el `CompilerDialog`.
- `frontends/mindmap/contract.py` — contrato JSON v1 con `validate_contract`.
- `frontends/mindmap/fixtures/kb-small.json` — fixture canónico.
- Tests existentes: `tests/test_mindmap_compiler.py`, `tests/test_mindmap_contract.py`,
  `tests/test_mindmap_persistence.py`. Pytest: `python -m pytest tests/ -q`
  (pythonpath=src; `python_files` incluye `e2e_*.py`). Todos en verde (40/40).
- El adaptador usa el store real por defecto:
  `SLDB_STORE` env o `<repo>/.sldb`.

## Alcance (qué hacer)

1. **Tests de endpoints HTTP** (nuevo archivo `tests/test_mindmap_endpoints.py`):
   - Levantar `make_server(port=0)` en un thread (obtener puerto real con
     `server.server_address[1]`), hacer requests HTTP reales con `urllib`.
   - Cubrir por cada modo (`validate`, `plan`, `compile`, `export`):
     * caso válido con `frontends/mindmap/fixtures/kb-small.json` como `source`
       (leer el fixture y pasarlo inline como dict; para `compile`/`plan` usar un
       store temporal vacío creado con `tempfile.mkdtemp()`, nunca escribir en `.sldb`);
     * caso inválido (contrato roto, p.ej. `{"version": 99}` o payload sin `model`)
       → verificar que responde error JSON estructurado sin stack trace;
     * body no-JSON → 400; body no-dict (p.ej. lista) → 400.
   - Verificar guardas: `Origin` cross-origin → 403; `Content-Length` simulado
     grande → 413 (se puede enviar un body >5MB con header válido, o testear la
     rama unitariamente si el envío real es costoso; preferir envío real de un
     body de ~5.1 MB).
   - GET `/api/schema` y `/api/graph` responden 200 JSON contra store temporal.
   - Anti-mock: los tests deben golpear el servidor HTTP real, no llamar
     `CompilationService` directamente (eso ya lo cubren los tests de compiler).

2. **Contrato de exportación y round-trip** (extender
   `tests/test_mindmap_compiler.py` o nuevo test):
   - `export` produce un JSON que pasa `validate_contract` del `contract.py`.
   - Round-trip: exportar el grafo proyectado → recompilar (`plan_source`)
     contra un store vacío → el reporte `dry-run` muestra las mismas altas
     (documentos/ids/modelos) que el export contenía; sin conflictos.
   - Documentar en el test el contrato exacto de `export` (claves de entrada
     `{documents, view}` y de salida).

3. **Verificación en navegador (E2E, no simulada)**:
   - Extender o crear `tests/e2e_mindmap_compiler.py` (patrón idéntico a
     `tests/e2e_mindmap_doc_edit.py`: usa Playwright sync, levanta
     `make_server`, navegador headless).
   - Flujo: abrir `/mindmap` → exportar (capturar el JSON de `/api/export` vía
     `page.expect_response`) → abrir el `CompilerDialog` → pegar/cargar un JSON
     de prueba → ejecutar `validate` y `plan` → verificar que el reporte se
     renderiza con las secciones de resultados → si el modo `compile` escribe,
     hacerlo contra un store temporal (inyectar `SLDB_STORE` antes de
     `make_server`).
   - Criterio de fin: el E2E corre dentro de `python -m pytest tests/ -q` sin
     pasos manuales.

4. **Documentación**: actualizar la sección "Estado actual" de
   `docs/mindmap-finalization-plan.md` marcando el paso 8 como listo cuando los
   tests anteriores pasen, listando qué quedó cubierto.

## Fuera de alcance

- Brainstorm (paso 4) y edición de clases (paso 7): tareas separadas.
- Cambiar el contrato JSON v1.
- Modificar `sldb_adapter.py` más allá de lo mínimo si un endpoint necesita
  datos que ya no expone (si hace falta, reportarlo antes de ampliar).

## Guardarraíles

- Pills vinculadas (obligatorias):
  - `desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md`
  - `desk/contexts/pill-guardrail-the-model-descriptor-is-a-real-contract-mirror-not-a-mock.md`
- Atoms vinculados:
  - `desk/atoms/atom-python-backend-why.md`
  - `desk/atoms/atom-python-backend-what.md`
  - `desk/atoms/atom-python-backend-how.md`
  - `desk/atoms/atom-python-backend-how_not.md`
- Prohibido: mocks de red, stubs de `CompilationService`, fixtures que fingan
  respuestas HTTP. Si el store real de SLDB no arranca en CI/local, DETENERSE y
  reportar el bloqueo.
- No escribir nunca en el store real `.sldb` desde los tests; siempre store temporal.
- Comandos de verificación local:
  - `python -m pytest tests/ -q` (desde la raíz del repo)
  - `python -m pytest tests/e2e_mindmap_compiler.py -q` (E2E aislado)

## Criterio de aceptación

1. `python -m pytest tests/ -q` verde con los nuevos tests incluidos.
2. Los 4 endpoints tienen cobertura HTTP real (servidor levantado de verdad).
3. Round-trip export → plan demuestra conservación de documentos y layout.
4. E2E Playwright del diálogo del compilador pasa sin intervención manual.
5. `docs/mindmap-finalization-plan.md` refleja el estado real del paso 8.
