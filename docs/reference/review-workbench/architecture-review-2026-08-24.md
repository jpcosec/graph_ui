> **Estado al 2026-10-18.** Revisión de arquitectura de `apps/review-workbench` hecha el
> 2026-08-24. Sus issues vivían en `desk/drawer/issues/`; cada uno se trianguló contra el código y se
> cerró como task de deskops (o se retiró con evidencia). Los enlaces de abajo apuntan a archivos
> que ya no existen; el historial está en git.
>
> | Issue | Resolución |
> |---|---|
> | 01 KnowledgeGraph.tsx sin usar | retirado, 2383c8e |
> | 02 GraphEditorPage huérfana | **pendiente de decisión del dueño**: cuál es la página L1 |
> | 03 API pública falsa de GraphEditor | props de grafo quitadas, contrato manejado por el store, 41e0fcb |
> | 04 filtros y foco sin efecto | aplicados en el lienzo, 9674e5a |
> | 05 plegado en los datos del nodo | movido a ui-store, 555fccc |
> | 06 vista HUM con fixtures | obsoleto: la vista se borró en 9f64f0f |
> | 07 persistencia | los borradores de localStorage se fueron con HUM; `saveGraph` sigue siendo no-op: **pendiente de la misma decisión** que 02 |
> | 08 NodeData abierto | cerrado, con un solo acceso a `payload.value`, a083068 |
> | 09 título de nodo duplicado | un solo resolvedor, 79931bb |
> | 10 layout sin tamaños medidos | usa los tamaños de React Flow, 4865788 |
>
> La narrativa de abajo (que el runtime vive en `HumBodyPage`) ya no aplica: App.tsx monta
> `AntoniaFlowPage`.

# Architecture review index

The codebase has a **partially sound base**: the intended `L1-app / L2-canvas / L3 content` folder split is visible, the architecture lint currently passes, and several lower-level helpers have focused tests. That means this is not a hopeless rewrite case. There is a real architecture to recover.

The bigger problem is **drift between the declared architecture and the runtime architecture**. The mounted app does not actually flow through the nominal L1 entrypoint, a legacy editor still exists as a massive parallel implementation, and the live editor depends heavily on global stores and static HUM fixtures. In other words, the repo has a clean-looking structure, but too much of the behavior is still carried by hidden coupling, demo data, and dead parallel paths.

I would **not recommend a full rewrite first**. I would recommend consolidation: remove or quarantine the unused editor paths, make one entrypoint authoritative, tighten the data model, and separate persistent/domain state from view state. The clean parts are worth preserving; the rotten parts are the parallel flows, fake persistence, and cast-driven node data handling.

## Issues
- [issue-01-unused-legacy-knowledgegraph-god-component.md](./issue-01-unused-legacy-knowledgegraph-god-component.md) — **high** — A 2949-line legacy editor remains in-tree as an unmounted parallel implementation.
- [issue-02-orphaned-graph-editor-page-and-bypassed-translation-layer.md](./issue-02-orphaned-graph-editor-page-and-bypassed-translation-layer.md) — **high** — The intended L1 page is not the runtime entrypoint and its translation layer is explicitly bypassed.
- [issue-03-graph-editor-public-api-is-fake-and-l2-is-globally-coupled.md](./issue-03-graph-editor-public-api-is-fake-and-l2-is-globally-coupled.md) — **high** — `GraphEditor` exposes props it ignores while L2 components read/write global stores directly.
- [issue-04-filters-and-focus-mode-are-mostly-dead-affordances.md](./issue-04-filters-and-focus-mode-are-mostly-dead-affordances.md) — **medium** — Sidebar filter/focus controls set state that the canvas rendering path mostly never uses.
- [issue-05-collapse-state-pollutes-data-and-uses-manual-height-hacks.md](./issue-05-collapse-state-pollutes-data-and-uses-manual-height-hacks.md) — **high** — Collapse behavior writes stringly view state into node data and hardcodes group height across files.
- [issue-06-hum-body-projection-is-driven-by-static-fixtures-and-hardcoded-geometry.md](./issue-06-hum-body-projection-is-driven-by-static-fixtures-and-hardcoded-geometry.md) — **high** — The HUM view is built from static fixtures, fixed coordinates, and label-matched edges.
- [issue-07-persistence-is-only-localstorage-or-a-no-op.md](./issue-07-persistence-is-only-localstorage-or-a-no-op.md) — **high** — Saves are only local browser drafts or a provider that drops the payload.
- [issue-08-open-ended-node-data-type-forces-cast-driven-code.md](./issue-08-open-ended-node-data-type-forces-cast-driven-code.md) — **high** — The core node data type is too loose, forcing repeated `unknown`/record casts across the editor.
- [issue-09-node-title-resolution-is-duplicated-and-inconsistent.md](./issue-09-node-title-resolution-is-duplicated-and-inconsistent.md) — **medium** — Title extraction logic is duplicated and already disagrees between shell and inspector.
- [issue-10-auto-layout-ignores-measured-dimensions-and-never-runs-on-load.md](./issue-10-auto-layout-ignores-measured-dimensions-and-never-runs-on-load.md) — **medium** — Layout depends on generic fallback sizes and is only applied manually.