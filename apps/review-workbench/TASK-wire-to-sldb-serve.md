# Task: wire graph_ui to `sldb serve` — live data + type-driven inspector

## Goal (what the user will SEE)
graph_ui stops using mock/fixture data and instead talks to the REAL sldb store
over HTTP via `sldb serve`. Two cables connected at once:
1. DATA cable: the canvas loads the live documents from `GET /graph`.
2. TYPE cable: the node registry + inspector are built from `GET /schema`
   (real model field descriptors), so the inspector renders typed controls
   (enum -> <select>, string -> textarea, stringlist -> chips) instead of a
   blind key/value editor. Editing a node and saving writes back via `POST /save`.

## Environment
- App root: `/home/jp/proyectos/hum-ecosystem/tools/graph_ui/apps/review-workbench`
- Branch: `iso-lab/graph_ui-antonia-demo` (experimental; master untouched). Edit ONLY here.
- Baseline that MUST stay green: **graph_ui 77 tests** (`npm test`). Adding tests is fine; ZERO failures.
- The backend is `sldb serve` (already built on branch iso-lab/sldb). It is Python;
  run it separately. graph_ui talks to it over HTTP.
- NO mocks/stubs/fake/placeholder/TODO as deliverable. Live data only. If blocked, STOP and report.

## REAL payload field shapes (empirically probed from a running server against Antonia — use these exactly)
A ConversationStep `payload` from `GET /graph` arrives as:
- `tags`: **JSON array of strings** e.g. `["conversation:steps.onboarding","system:laboratorio-chile"]`  (kind=stringlist -> array)
- `allowed_transitions`: **string** (comma-separated) e.g. `"conversation:steps.registro_estado"`  (kind=string)
- `grounding_atoms`: **string** (comma-separated)  (kind=string)
- `required_slots`: **string** (comma-separated)  (kind=string)
- `kind`: **string** (the enum value) e.g. `"obtencion_datos"`
- `instructions`, `summary`, `title`, `id`, etc.: **string**
- `embedding`: **array of numbers** (kind=list) — DO NOT render this in the inspector; skip `embedding` and `semantic_anchors` (huge/irrelevant for editing).
SAVE ROUND-TRIP: `/save` renders via the SAME model, so send fields back in the
SAME shapes you received them: `stringlist`(tags) as array; `string` fields as
strings. Do not convert `allowed_transitions` to an array. Echo unchanged fields
back as-is from the original payload so nothing is dropped (build the save payload
by spreading the original payload then overlaying edited fields). This guarantees
render_model_markdown gets a complete, correctly-typed payload.
INSPECTOR SCOPE: only render editable controls for a curated field set
(id readonly, title, kind, instructions, required_slots, handout_target, tool_ref,
allowed_transitions, grounding_atoms, completion_condition, domain_ref, tags).
Skip embedding/semantic_anchors/parent (noise). Drive the SHOWN set from
`def.fields` but filter out the skip-list.

## The backend contract (verified — these are the real response shapes)
`sldb serve --store <path> --pythonpath <path> --port 8787 --cors` exposes:
- `GET /health` -> `{"status":"ok"}`
- `GET /schema` -> `{"models":[ {"id": <modelName>, "model_ref": <ref>,
    "fields":[ {"name","kind","required", "enum"?:[...]} ] } ]}`
  where `kind` ∈ string|enum|stringlist|enumlist|list|integer|number|boolean|object|unknown
- `GET /graph` -> `{"documents":[ {"id","model_name","path","payload":{...},"semantic_tags":[...]} ]}`
- `POST /save` body `{"doc": <id>, "payload": {...}}` -> `{"ok":true,"doc":<id>}`
   (404 unknown doc; 400 on idempotency/validation failure with `{"ok":false,"error"}`)

## Design

### Part A — Vite dev proxy (so the browser can reach the Python server)
Edit `vite.config.js`: add a `server.proxy` entry mapping `/sldb` -> the serve
origin, so the SPA fetches same-origin `/sldb/graph` etc. Make the target
configurable via env `VITE_SLDB_URL` (default `http://127.0.0.1:8787`):
```js
server: {
  host: '127.0.0.1',
  port: 5173,
  proxy: {
    '/sldb': {
      target: process.env.VITE_SLDB_URL || 'http://127.0.0.1:8787',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/sldb/, ''),
    },
  },
  watch: { ignored: ['**/auto_user_test/**'] },
},
```
(Keep existing alias/mock logic intact.)

### Part B — A real GraphDataProvider backed by sldb serve
Create `src/features/graph-editor/lib/sldb-provider.ts` implementing
`GraphDataProvider` (the existing interface in `lib/data-provider.ts`):
- `getSchema()` -> fetch `/sldb/schema`, return the raw `{models:[...]}` (add a new
  return type; do NOT force it into the old mock `GraphSchema` shape — introduce a
  `SldbSchema` type mirroring the backend, and adapt where consumed).
- `getGraph()` -> fetch `/sldb/graph`, return `{documents:[...]}`.
- `saveGraph(...)` is per-node in this model; ALSO add a method
  `saveDoc(docId: string, payload: Record<string, unknown>)` -> POST `/sldb/save`.
  (Extend the provider interface with an optional `saveDoc`; keep `saveGraph` for
  compat but the real write path is `saveDoc`.)
Keep the old `graphDataProvider` (mock) exported so existing tests that import it
do not break. Add a `sldbProvider` export as the live one. Selection of which
provider is used is done in the Antonia page (Part D), NOT globally, to avoid
disturbing the 77-test baseline.

### Part C — Build the node registry + fields from /schema (the TYPE cable)
1. Extend `NodeTypeDefinition` (`src/schema/registry.types.ts`) with an OPTIONAL
   `fields?: FieldDescriptor[]` where
   `FieldDescriptor = { name: string; kind: string; required: boolean; enum?: (string|number)[] }`.
   Optional so nothing existing breaks.
2. Create `src/features/antonia-flow/lib/schema-to-registry.ts`:
   `registerModelsFromSchema(schema: SldbSchema): void` that, for each model,
   builds a `NodeTypeDefinition` and `registry.register`s it (guard: skip if a
   type with that typeId already exists, like registerIfMissing). Map:
   - `typeId` = a slug of model id (e.g. "ConversationStep" -> "conversation-step",
     but for models already registered as generated types, prefer the existing
     typeId; simplest: register under the model id itself AND keep the existing
     conversation-step. To avoid duplication, if `registry.get('conversation-step')`
     exists and model id is ConversationStep, ATTACH the `fields` to that existing
     definition instead of registering a new one).
   - `fields` = the backend field descriptors.
   - `payloadSchema` = a permissive `z.object({}).passthrough()` (validation still
     happens server-side on save; the client schema must not reject live payloads).
   - renderers/color/icon/defaultSize = reuse the existing generated defaults when
     the type already exists; otherwise use sane defaults (detailRendererFor, etc.).
   The point: after this runs, `registry.get('conversation-step').fields` is the
   real field list from the sldb model.

### Part D — Antonia page loads live + selects the live provider
Edit `src/features/antonia-flow/AntoniaFlowPage.tsx`:
- On mount, ORDER MATTERS (fixes gate-flagged contradiction):
  1. `registerDefaultNodeTypes()` FIRST (registers conversation-step + renderers).
  2. `const schema = await sldbProvider.getSchema()`.
  3. `registerModelsFromSchema(schema)` — this MERGES `fields` into the EXISTING
     conversation-step entry via `registry.register({ ...registry.get('conversation-step'), fields })`.
  Never attach fields before the default type exists.
- Then `await sldbProvider.getGraph()`; filter documents to `model_name === 'ConversationStep'`;
  build ASTNodes exactly like the existing `buildAntoniaGraph` adapter but from the
  LIVE documents (reuse the same node/edge shaping + ELK layout — factor the shaping
  out of `lib/adapter.ts` so both the fixture path and the live path share it, OR
  add a `buildAntoniaGraphFromDocuments(documents)` sibling). Edges from each doc's
  `payload.allowed_transitions` (split on comma, map `conversation:steps.<name>` ->
  the doc whose short id matches, same logic as the generator).
- Add a small UI affordance: if the fetch fails (server not running), show a clear
  inline message "sldb serve not reachable at /sldb — start it" instead of a blank
  canvas. (Real error surface, not a silent mock fallback.)
- Keep a `?src=fixture` escape hatch that uses the OLD fixture path, so the page
  still works offline for the existing Playwright fixture test. Default (no param)
  = LIVE.

### Part E — Type-driven inspector (make editing behave)
Edit `src/features/graph-editor/L2-canvas/panels/NodeInspector.tsx`:
- Look up `const def = registry.get(typeId)`. If `def?.fields` exists, render a
  TYPED form: iterate fields in order; for each:
  - `enum` -> `<select>` with the enum options (shadcn Select or native select with data-testid `field-<name>`)
  - `string` -> `<textarea>` if the field looks long (instructions/summary/*_condition) else `<input>`
  - `stringlist`/`list` -> a simple multiline input (one item per line) rendered as chips is a nice-to-have; a textarea is acceptable as long as it round-trips
  - `boolean` -> checkbox; `integer`/`number` -> number input
  - required fields marked; readonly `id` is fine to keep as text
  The field VALUES come from the node payload (`node.data.payload.value` or
  `node.data.properties`). Keep the existing generic PropertyEditor as a FALLBACK
  for types with no `fields` (so nothing else breaks).
- On Save: assemble the payload from the typed fields and call
  `sldbProvider.saveDoc(node.id, payload)`. On success, also update the in-memory
  node so the canvas reflects it. On 400 (idempotency/validation), surface the
  server error text to the user (toast or inline) — do NOT swallow it.
- IMPORTANT: this must not break the 77 tests. The existing NodeInspector tests
  assume the generic editor. Keep the generic path as fallback and gate the typed
  path on `def?.fields` being present, which is only true when schema was loaded.
  If a test needs adjustment, prefer adding new tests over changing existing
  assertions; if you must touch an existing test, keep its intent.

## Validation (do ALL, paste output)
1. `npm test` -> 77 passed (0 failures; more if you add tests).
2. `npm run build` -> succeeds.
3. LIVE end-to-end proof (this is the money shot). You must run the real backend:
   a. Start `sldb serve` against the real Antonia store. Because sldb needs its
      deps, run it inside the sealed image, publishing the port to the host:
      ```
      docker run --rm -p 8787:8787 \
        -v /home/jp/proyectos/hum-ecosystem/tools/iso-lab/worktrees/sldb:/src:ro \
        -v /home/jp/proyectos/gemini_test:/gemini:ro \
        iso-lab:base bash -c '
          cp -a /src /w && rm -f /w/.git && pip install --no-deps -e /w >/dev/null 2>&1
          cp -a /gemini/knowledge /kb; mkdir -p /pp && cp -a /gemini/kb_agent /pp/kb_agent
          cd /w && python -m sldb serve --host 0.0.0.0 --port 8787 --store /kb/.sldb --pythonpath /pp --cors'
      ```
      (Runs in foreground; start it in the background of your shell or a separate one.)
   b. Verify from host: `curl -s localhost:8787/health` and `.../schema | head -c 300`.
   c. Start `npm run dev` (vite on 5173) with the proxy. Confirm `/sldb/health`
      via the dev server proxies through: `curl -s localhost:5173/sldb/health`.
   d. Playwright: create `user_flows/antonia_live_flow.json` (or a scripts mjs) that:
      - opens `http://127.0.0.1:5173/?view=antonia` (LIVE, no ?src=fixture),
      - asserts `.react-flow__node` count === 12 (live ConversationStep docs),
      - zooms/clicks a node, asserts the inspector shows a TYPED control for `kind`
        (a <select> with the 4 StepKind options) and a field for `instructions`,
      - EDITS instructions (or toggles kind) and clicks Save,
      - asserts the save succeeded (no error surfaced),
      - reloads and asserts the change persisted (proves POST /save hit the store),
      - screenshot to auto_user_test/antonia_live/*.png.
   Run it; confirm PASS; save the screenshot path.
   NOTE: after the persistence test, the Antonia store on disk will be modified.
   That is EXPECTED (it proves the write). The store lives under /kb inside the
   container copy (from /gemini mounted read-only), so the host gemini_test is NOT
   modified — verify the mount is :ro so the real files are safe. If you need
   writes to actually persist across a reload within the SAME server run, that
   works because the container copy /kb is writable for the server process.

## Done when
- graph_ui 77 green (0 failures), build succeeds.
- With `sldb serve` running, the Antonia view loads 12 LIVE ConversationStep nodes
  from `/sldb/graph` (not the fixture).
- Clicking a node shows a TYPE-DRIVEN inspector (kind as <select> of the 4 real
  StepKinds, instructions as text) built from `/sldb/schema`.
- Editing + Save round-trips through `POST /sldb/save` and persists (verified by reload).
- Screenshot saved.

## Commit
When ALL green, commit on the branch:
`git add -A && git commit -m "feat(antonia-flow): live data + type-driven inspector via sldb serve (real store over HTTP)"`
Do NOT touch master. Do NOT promote. Report: files created/edited, npm test output,
build result, the curl proofs, playwright result + screenshot path, commit hash.
If blocked (e.g. server unreachable), STOP and report exactly where — no mock fallback.
