# Resultado — task cierre paso 8 (compilador mindmap)

## Alcance ejecutado

1. **Tests HTTP reales de endpoints** (`tests/test_mindmap_endpoints.py`, 13 tests):
   servidor levantado con `make_server(port=0)` + `urllib` real. Cubre los 4
   modos (`validate/plan/compile/export`), planToken 409, contrato roto 422,
   JSON malformado 400, no-objeto 400, Origin cruzado 403, body >5MB 413,
   GET schema/graph.
2. **Bug de producto corregido**: un store sin inicializar hacía que
   `/api/graph` y el token del plan fallaran con "No store_index.yaml".
   Ahora `EditorStore` inicializa la KB vacía (`init_store`) y la UI muestra
   "Tu KB está vacía" como promete; `CompilationService._token` trata el store
   vacío como KB vacía (mismo criterio que `plan_source`).
3. **Round-trip export → plan**: el export pasa `validate_contract`, contiene
   los documentos del grafo y, planificado contra un store vacío, produce
   exactamente las mismas altas, sin conflictos, conservando layout (`view`).
4. **E2E Playwright** (`tests/e2e_mindmap_compiler.py`): importa el fixture
   kb-small.json desde el `CompilerDialog` (Validar → Calcular plan → Aplicar),
   verifica los documentos renderizados en el mapa y captura `/api/export`
   verificando round-trip UI → SLDB → export. Cero pasos manuales.

## Evidencias

- `validation.log`: pytest completo (54 passed), incluye E2E de compilador.
- Vitest: 76/76 (sin cambios en frontend del workbench).

## Notas

- `creates/updates/unchanged` del plan reportan ids como strings, no objetos;
  los tests validan ambas formas por robustez del contrato real.
- El body >5MB hace que el servidor cierre la lectura (pipe roto en cliente);
  el test lo acepta como 413 tras verificar que el servidor sigue vivo.
