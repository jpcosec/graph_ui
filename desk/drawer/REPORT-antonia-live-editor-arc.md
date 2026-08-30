# Report — Antonia live typed editor arc (sldb serve + graph_ui + flow_editor bridge)

Date: 2026-08-29
Scope: `hum-ecosystem/tools/` (sldb, graph_ui) with read-only reuse of `gemini_test`.

## Thesis proven
sldb+kgdb (the store) is the ecosystem nucleus: sldb = content/document layer,
kgdb = graph assembler, render layers are pluggable "legos". graph_ui was a
"Mercedes with flat tires" — good design but behaving as a generic property-bag
editor. Fixed by connecting it to the **real store** over HTTP using the exact
same methods the CLI uses. No mocks; empty source fields stay empty.

## What we built (in order)

### 1. Store Codec refactor — `sldb` `49b9d49`
- `StoreCodec` Protocol + `RuntimeCodec` (own file, 1-class/file) + `default_codec`.
- `StoreError` in `store/exceptions.py`; `SLDBStoreError(SLDBError, StoreError)`
  preserves CLI `except` identity.
- Removed top-level store imports of runtime.validation/structured_doc/core.exceptions
  (local in-function imports at raise sites).
- Tests: sldb 411 -> 414 (+3).

### 2. `sldb serve` — `sldb` `fdcc7ab`
- New CLI command, **stdlib only** (http.server/json/urllib; no flask/fastapi).
- Endpoints: `GET /health`, `GET /schema` (real `model_fields` introspection),
  `GET /graph` (`load_runtime_documents`), `POST /save` (`save_payload`:
  render + validate idempotency + hashes + lock), `GET /kgdb/snapshot`, `--cors`.
- The server IS the CLI: exposes the real read/write methods, not a reimplementation.
  `save_payload` = idempotency validation + lock, so the UI cannot corrupt the store.
- Comprehension gate (gpt-5.4) caught a CRITICAL bug: `save_payload` re-resolves the
  store context; must pass explicit `str(store_path)` + `effective_pythonpath` so
  read and write hit the SAME store.
- Tests: sldb 414 -> 422 (+8).

### 3. graph_ui wired to the live store — `graph_ui` `11ba23f`..`26a5c5b`
- `vite.config.js` `/sldb` proxy -> `VITE_SLDB_URL || :8787`.
- `sldb-provider.ts` (getSchema/getGraph/saveDoc), `schema-to-registry.ts`
  (merge live `model_fields` into the `conversation-step` type),
  `adapter.ts` (buildAntoniaGraphFromDocuments).
- `AntoniaFlowPage.tsx` (live load, `?src=fixture` escape hatch).
- `NodeInspector.tsx`: typed form gated on `def?.fields` (enum -> select,
  string -> textarea, stringlist), Save -> `saveDoc`; generic fallback intact.
- Default view = live Antonia (`ce01267`); HUM/Lisp observatory opt-in via `?view=hum`.
- Full flow projection (`26a5c5b`): fixed 2 arrastre bugs — alias map lost 11/20
  edges (transition refs use `_`, doc ids use `-`; added `canonicalKey()`), and
  edges near-invisible (encoding rule was `flows-to` but relationType is `flows_to`;
  added amber style). Now 20/20 edges visible.

### 4. StepCard — `graph_ui` `0071e4b`
- Ported flow_editor's StepNode card design: icon + color per StepKind
  (interaccion_simple 💬, obtencion_datos 📝, handout 🤝, llamado_tool ⚙️),
  colored left border, kind label, instructions preview. No raw payload/embedding dump.

### 5. Warm/amber theme — `graph_ui` `4664c66`
- Adopted gemini_test's design system: remapped Tailwind tokens (same keys, warm
  values; primary cyan #00f2ff -> amber #d4a574), Inter font, warm charcoal
  #0a0a0f, amber scrollbars, warm glass panels. HUM view tokens left intact.
- Verified: body bg rgb(10,10,15); Save button rgb(212,165,116) (amber, not cyan).

### 6. flow_editor brought in verbatim — `graph_ui` (this commit)
- Copied gemini_test's `frontends/flow_editor/index.html` UNMODIFIED ->
  `vendor/flow-editor/app.html.tpl`, plus its assets (theme.css, hotkeys.js,
  demo-tour.js) -> `public/static/`.
- `vendor/flow-editor/flow-editor-plugin.js`: a Vite dev plugin that serves the
  HTML at `/flow-editor` and bridges its `/api/*` surface to THIS workbench's
  `sldb serve`: `/api/flow` reshapes `/graph` into the flow.json shape
  `export_flow.py` emits (split() semantics preserved); `/api/config`,
  `/api/health`, `/api/tools` stubbed.
- Zero gemini_test runtime: no server, no API key. Data comes from `sldb serve`
  (real Antonia store: 12 ConversationStep, 20 edges). flow_editor is read-only
  (its Save is decorative).

## iso-lab (reproducible sandbox) — `hum-ecosystem` `2f28a88`
- `tools/iso-lab/`: manifest.yaml, docker/ (Dockerfile + requirements.lock),
  bin/lab-{build,up,test,status,down}.sh. Branches as git worktrees (share object
  store, never touch primary). Read-only mounts + throwaway container copy keep the
  host pristine. Image `iso-lab:base` (270MB, pytest 8.3.4, python 3.13.15).

## Test baselines (all 0 failures)
- sldb: 411 -> 414 (Codec) -> 422 (serve)
- kgdb: 23 (unchanged)
- deskops: 140 (unchanged)
- graph_ui: 77 -> 79

## Live stack
- `sldb serve` on :8787 against the Antonia store.
- vite dev on :5173, `/sldb` proxied to :8787.
- `http://localhost:5173/` = graph_ui typed editor (warm theme, default Antonia).
- `http://localhost:5173/flow-editor` = gemini_test flow_editor verbatim, live data.
- `?view=hum` = HUM/Lisp observatory (opt-in).

## Branch state at promotion
- sldb: `iso-lab/sldb` @fdcc7ab -> merging to main.
- graph_ui: `iso-lab/graph_ui-antonia-demo` @head -> merging to master.
- kgdb / deskops: iso-lab == main (no diff, nothing to merge).
- gemini_test: untouched by us (its dirty `demo_mode` is the owner's edit).
- hum-ecosystem: iso-lab lives on `feature/weltgraph-spec-core`; the large dirty
  tree is pre-existing and unrelated.

## Deferred (need explicit design approval — core-contract changes)
- Store physical separation.
- Document/Codec plugin generalization.
- Relations as a first-class content-blind sldb model.
