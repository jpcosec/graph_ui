# Cold review: Deskops workflow view

Reviewed task-deskops-workflow-view, its atom, active Board, all four local rituals, applicable local pills, Mindmap server/bootstrap/router/registry/source, existing endpoint/skin/route E2E tests, and real DeskopsOperations/task service. Read-only review; no implementation changes.

Verdict: implementable in graph_ui with the following concrete resolutions. No need for a new Vite app or changes to deskops/sldb.

## Required before or during implementation

1. Bind `desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md`. Its When explicitly applies to every executor/tester dispatch, while task and Board currently have empty pills. Task already expresses its substance; record the binding. The model-descriptor pill is not relevant to this workflow UI.
2. Reconcile Board Notes: currently says no graph_ui delivery task is open despite routing this task. Local closeout requires Board reflect reality.
3. Missing lifecycle must not appear as a successfully evaluated empty gate set. `DeskopsOperations.show_task()` catches lifecycle transition failures and returns [] both for terminal tasks and graph errors. Distinguish missing/unreadable lifecycle configuration through an existing lifecycle operation or explicit validity check, without adding a parser or inventing gates; report unavailability. Gate reevaluation in advance_task remains authoritative.
4. Board reference validation must precede task selectors. Deskops uses glob-based selectors internally. Resolve references within selected root, reject escaping/ambiguous references, and use exact routed identity; test duplicate/ambiguous selectors and orphan references. Browser-supplied id is never a filesystem path.
5. Origin comparison must include scheme and authority (null/foreign origins rejected), not merely netloc copied from existing views route. Serialize stale check plus advance under one per-server lock. Keep the stated CLI-writer race limitation explicit.

## Routing and bootstrap checks

- There is no static route whitelist in current serve.py. Its fallback serves index.html for any nonexistent extensionless path. `/workflow/deskops` therefore needs registry entry, not a new SPA whitelist. Add a real direct-URL test.
- GET `/api/desk/*` must dispatch before generic remote `/api/*`; otherwise requests are forwarded incorrectly to sldb. POST needs its explicit branch before generic handlers. Unknown desk routes should return JSON 404.
- `make_server` must compute root from the actually selected store argument, not module-global environment alone. A remote server has no local editor_store; do not dereference one for workflow.
- Registry eagerly imports every view; use browser-valid ES modules and shared/html.js, no TSX/JSX or Node-only dependencies. One broken import breaks all views. Register descriptor styles and use existing skin variables.
- SourceProvider unconditionally fetches graph/schema, but Shell always mounts the selected view even on document error. The workflow component can load independently; retain an honest SLDB error banner rather than waiting for documents.ready. This matters for DESKOPS_ROOT paired with unavailable remote SLDB.
- Existing package-data includes recursive JS/MJS/CSS, so new view assets require no packaging glob change. deskops is already listed in pyproject dependency configuration; inspect section before adding another extra.
- WorkersPanel already mounts once in Shell. Do not instantiate another in the view.

## Validation plan details

- Existing endpoint tests run make_server(0, store=temporary_store), threading, and urllib against a real compiled store. Reuse this pattern with a real deskops-initialized sandbox; set environment with isolation so external DESKOPS_ROOT/SLDB_BACKEND cannot leak into tests.
- Existing pytest configuration collects both test_*.py and e2e_*.py. Full pytest includes browser tests, some fixed ports, and legacy suites. Capture baseline failures separately; no false-green closeout.
- E2E route tests use real Chromium and CDN imports. Prove actual browser mounting plus console errors, not just HTTP 200 for index.html. Port 0 is safer for new tests than copying fixed 8151.
- Skin tests recursively validate every CSS variable against skins and prohibit hex outside skins. Use existing vars; adding custom vars may fail even if CSS technically works.
- Include remote-without-root, local explicit-store root, empty Board, broken reference, missing lifecycle, blocked gate, stale POST, foreign origin, successful sandbox advance, and terminal-closeout presentation.
- Node tests should cover pure filtering/counting/presentation transformations; server integration tests establish real lifecycle behavior. No service mocks needed.

No implementation was performed by this review. Remaining choices (API envelope and Spanish labels) are routine implementation decisions already bounded by the task.
