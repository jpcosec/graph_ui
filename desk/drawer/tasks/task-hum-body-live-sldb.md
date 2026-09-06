---
id: task-hum-body-live-sldb
scope: graph_ui
kind: task
status: draft
priority: p1
depends_on: []
created: 2026-09-06
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
- desk/contexts/pill-guardrail-the-model-descriptor-is-a-real-contract-mirror-not-a-mock.md
atoms: []
files:
- apps/review-workbench/src/features/hum-body/lib/adapter.ts
- apps/review-workbench/src/features/hum-body/lib/mock-data.ts
- apps/review-workbench/src/features/hum-body/lib/generated-hum-ast.ts
- apps/review-workbench/src/features/hum-body/HumBodyPage.tsx
- apps/review-workbench/src/features/graph-editor/lib/sldb-provider.ts
---

# Feed hum-body from sldb serve (remove hardcoded content)

## Objective

Eliminar todo el contenido hardcodeado de la vista HUM y alimentarla en vivo
desde `sldb serve`, replicando el patrón live de `antonia-flow`.
El contenido mismo (órganos, rutinas, trazas) es descartable: si el store no lo
modela, la vista muestra lo que haya en el store y nada más. NO se migra ni
re-autora el contenido del modelo hum.

## Current state (verified)

- `apps/review-workbench/src/features/hum-body/lib/mock-data.ts` (389 líneas):
  array literal `humBodyModel` con `organs`, `capabilities`, `artifacts`,
  `routines`, `traces`.
- `apps/review-workbench/src/features/hum-body/lib/generated-hum-ast.ts`
  (1258 líneas): `astFiles` / `astForms` estáticos baked en el bundle.
- `HumBodyPage.tsx` importa `humBodyModel` y `STORAGE_KEY =
  'hum-body-view-drafts'` persiste drafts solo en `localStorage`.
- `saveGraph` de `sldbProvider` (`graph-editor/lib/sldb-provider.ts`) es un
  NO-OP `{ ok: true }`; `saveDoc` SÍ persiste vía `POST /sldb/save`.

## Live pattern a replicar (antonia-flow)

- `sldbProvider.getSchema()` → `GET /sldb/schema`
- `sldbProvider.getGraph()` → `GET /sldb/graph`
- `sldbProvider.saveDoc(docId, payload)` → `POST /sldb/save`
- `AntoniaFlowPage.tsx`: `loadLiveGraph()` con `LoadState`
  loading/ready/error, fallback `?src=fixture`.
- Adapter: `buildAntoniaGraphFromDocuments(documents)` en
  `antonia-flow/lib/adapter.ts`; registro de modelos desde schema en
  `antonia-flow/lib/schema-to-registry.ts`.

## Scope

1. Reescribir `hum-body/lib/adapter.ts` para construir el grafo desde los
   documentos que devuelve `/sldb/graph` (tipos organ/capability/artifact/
   routine/trace/file/form si existen; los que no existan, simplemente no
   producen nodos).
2. `HumBodyPage.tsx` deja de importar `humBodyModel`; carga live vía
   `sldbProvider` con manejo de estado loading/ready/error igual que
   `AntoniaFlowPage`. Sin fallback a fixture (no queda fixture).
3. Borrar `mock-data.ts` y `generated-hum-ast.ts`. Actualizar `presets.ts`,
   `types.ts` y cualquier import colateral (verificar con
   `grep -rn "mock-data\|generated-hum-ast" apps/`).
4. Si un modo de vista (structure/body/routine/trace/compare) no tiene datos
   en el store, renderiza vacío con copy honesto (estado vacío real, no fake).

## Out of scope

- Autorar documentos hum en ningún store (cross-repo, se delega vía inbox si
  aplica).
- Cambiar el tema visual ni los renderers `renderers.tsx` más allá de lo que
  exija el compile.

## Guardarraíles

- Anti-mock (pill vinculada): prohibido reemplazar datos del store por
  literales; el empty state es honesto.
- Sin `TODO` ni stubs como entregable.
- El save path, si se toca, usa `POST /sldb/save` real — nunca no-op.

## Validation

```bash
cd apps/review-workbench
npx tsc -p tsconfig.app.json --noEmit
npm test -- --run          # Vitest; hum-body adapter.test.ts se actualiza al contrato live
```

Smoke manual: `npm run dev` con `sldb serve` activo → `?view=hum` carga sin
errores de red y sin imports de `mock-data`.
