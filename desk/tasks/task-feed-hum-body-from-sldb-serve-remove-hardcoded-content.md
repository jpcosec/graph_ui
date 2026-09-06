---
id: task-feed-hum-body-from-sldb-serve-remove-hardcoded-content
status: active
summary: ''
tags:
- workspace:desk
- artifact:task
- source:drawer
routine: routine-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content
current_node: checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-execution-ready
history: []
references:
- desk/drawer/tasks/task-hum-body-live-sldb.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
- desk/contexts/pill-guardrail-the-model-descriptor-is-a-real-contract-mirror-not-a-mock.md
files: []
checklists:
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-execution-ready
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-testing-ready
- checklist-task-feed-hum-body-from-sldb-serve-remove-hardcoded-content-closeout-ready
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms:
- desk/atoms/atom-hardcoded-static-lenses-are-the-anti-pattern-for-projection.md
- desk/atoms/atom-graph-ui-is-a-schema-driven-typed-editor-not-a-generic-canvas.md
---

# Feed hum-body from sldb serve (remove hardcoded content)

## Rationale

_Explain why this task exists or the business driver behind it._

Not provided.

## Goal

_Describe the concrete result this task must produce._

Promote deferred work from task-hum-body-live-sldb.md.

## Scope

_State what is in scope and what is out of scope._

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

## Implementation Path

_Outline the expected implementation route or affected surface._

Promoted from desk/drawer/tasks/task-hum-body-live-sldb.md.

## Validation

_List the checks required before this task can close._

- ```bash
- cd apps/review-workbench
- npx tsc -p tsconfig.app.json --noEmit
- npm test -- --run          # Vitest; hum-body adapter.test.ts se actualiza al contrato live
- ```
- Smoke manual: `npm run dev` con `sldb serve` activo → `?view=hum` carga sin
- errores de red y sin imports de `mock-data`.

## Done When

_Name the observable condition that makes the task complete._

Promoted work is completed, validated, and closed with a commit.
