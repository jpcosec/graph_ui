# Task-only preflight: Deskops workflow view in Mindmap

Source read: `desk/tasks/task-deskops-workflow-view.md` only (updated active task).

## Intended deliverable, step by step

1. Add a Spanish-language `/workflow/deskops` view to the existing Mindmap UI. Reuse its shell, router, skin, request helper, and WorkersPanel; register facet `workflow`, id `deskops`, label `Deskops`, with `shell.primary=false`.
2. Bind the workflow to one explicit desk root. Use absolute `DESKOPS_ROOT` when set; otherwise in local mode derive the root as the parent of the effective store passed to the server. In remote mode, missing configuration must return an explanatory error. Never fall back to cwd or another store. Local/remote is explicitly the existing `GRAPH_UI_BACKEND` / `BACKEND_MODE` distinction in `serve.py`.
3. Implement `GET /api/desk/board`: read `BoardDoc` through SLDB/deskops; include only task references on that board, never orphan-scanning `list_tasks`; return desk identity, board, and actual task data including `current_node`, status, and goal. Make reference-level errors visible and distinguish an empty board from a global failure.
4. Implement `GET /api/desk/task?id=...`: resolve only a task present on the board; return task payload, authoritative gates (holds/condition/target) from `show_task`, and next action from `next_action_report`. Do not write a YAML/Markdown parser.
5. Implement `POST /api/desk/advance`: accept task id and detail revision; reject stale revision with 409; enforce same-origin Origin, body size and types; serialize advances; call `advance_task(id)` without target; refresh detail. Show blocked gates; perform no commit or close. Revision is SHA256 of current Board.md bytes concatenated with current task bytes using a separator. Verify within a shared `threading.RLock` around read-check-advance-refresh. This lock protects this UI's requests only; document that it does not provide atomicity against external CLI writers.
6. Build an accessible view with click/keyboard selection, search, status filter, real counters, readable task detail (goal, scope, validations, declared evidence, pills, dependencies, next steps, gates), refresh, and loading/empty/error states. Enable advance only when `gates.some(g => g.holds && g.target !== "complete")` and `current_node !== "ritual-closeout"`; backend still applies real rules and accepts no client target. For terminal tasks, explain CLI closeout; do not show a false close button. Do not mount the generic SLDB editor to change status.
7. Reuse existing SLDB operations and UI surfaces; do not clone SLDB surface or retired editors. Support responsive layout at 390px and desktop, dark/light skins, and use skin tokens rather than hex colors.
8. Document route, limits, and SLDB relationship, plus reproducible command `SLDB_STORE=/abs/deskops/.sldb DESKOPS_ROOT=/abs/deskops graph-ui 8091`.
9. Validate using real deskops operations/scaffold and real tasks in an isolated `tmp_path` desk only. Verify orphan exclusion, broken-reference diagnostics, stale/cross-origin/blocked/successful advance, and do not close tasks or mutate the real desk. Use real Playwright browser coverage for route, selection, filters, error/empty, advance, and screenshot.

## Exact scope

Only graph_ui: `frontends/mindmap/deskops_routes.py`, `frontends/mindmap/serve.py`, `frontends/mindmap/shell/registry.js`, `frontends/mindmap/views/workflow/deskops/{deskops-view.js,deskops.mjs,deskops.css}`, `tests/test_mindmap_deskops.py`, `tests/e2e_mindmap_deskops.py`, `tests/mindmap-deskops.test.mjs`, `README.md`, `docs/deskops-ui.md`, and optionally `pyproject.toml` for an appropriate deskops extra. Minimal existing-test adjustments are allowed only to register the view.

Do not touch SLDB, deskops, other UIs, or unrelated inbox content. Do not create tasks, edit documents, or close tasks over HTTP. Do not ship mocks as product or replace real-service tests with mocks. Reuse WorkersPanel without duplication.

## Acceptance and validation

Run `pytest`, `node --test tests/mindmap-deskops.test.mjs`, and `pytest tests/test_mindmap_deskops.py tests/e2e_mindmap_deskops.py -q`. Run graph-ui 8091 against a real desk in read-only mode and perform real-browser Playwright checks with screenshot. The task separately requires a real successful advance in a sandbox temporary desk. Save evidence in `runs/subagents/20261030-deskops-ui/{validation.log,result-summary.md,desktop.png,mobile.png}`, plus phase logs.

Completion means direct URL loads board-backed data, authoritative gates are visible, advance works in sandbox, relevant tests and graph_ui pytest pass (or pre-existing failures are demonstrated and accurately reported), and docs/evidence are saved.

## Remaining interpretation

The button rule's phrase “literal complete” is concretely represented by the appended predicate `g.target !== "complete"`; terminal closeout is concretely excluded by `current_node !== "ritual-closeout"`. The read-only real-desk run and mutating sandbox run are distinct required validations. The main implementation and acceptance decisions are now explicit. The task metadata is active and states it is already on the Board.

## Verdict

**PASS — task is implementation-ready.** The prior ambiguities about server mode, revision calculation, UI serialization and CLI-writer limitation, button eligibility, temporary desk setup, and evidence location are resolved in the updated task text. No implementation performed; this is a task-document-only preflight.
