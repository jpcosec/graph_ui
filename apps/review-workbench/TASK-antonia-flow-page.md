# Task: render the REAL Antonia conversation flow in graph_ui, driven by the sldb model

## Goal (what the user wants to SEE)
graph_ui currently only mounts the HUM "observatory" (Lisp topology). The
`conversation-step` node type — generated from Antonia's real sldb model
`ConversationStep` — is registered but NOT visible anywhere. Make it visible:
a working canvas that loads the 12 REAL Antonia conversation steps and their 20
real transitions, rendered through the typed node registry, with ELK layout,
selectable nodes, and the typed detail inspector. This proves graph_ui is a
schema-driven typed editor over real sldb documents.

## Environment
- App root: `/home/jp/proyectos/hum-ecosystem/tools/graph_ui/apps/review-workbench`
- Branch: `iso-lab/graph_ui-antonia-demo` (experimental; master untouched). Edit ONLY here.
- Test baseline that MUST stay green: **graph_ui 77 tests** (`npm test`).
- NO mocks/stubs/fake/placeholder/TODO as deliverable. The data is REAL — it is
  generated from the actual atoms. Do not hand-invent nodes.

## Already done (do not redo)
- `scripts/generate-antonia-fixture.mjs` parses the real atoms at
  `/home/jp/proyectos/gemini_test/knowledge/atoms/step-antonia-*.md` and writes
  `src/features/antonia-flow/antonia-fixture.generated.json`
  (12 nodes typed `conversation-step`, 20 `flows_to` edges). Already generated; verify it exists.
- `conversation-step` is registered via `registerDefaultNodeTypes()` (it iterates `generatedNodeTypes`).
  Its Zod schema has the 12 real fields; renderers use `detailRendererFor(...)`.

## Key facts about the pipeline (verified — use these, do not reinvent)
- The canvas is `GraphEditor` (`src/features/graph-editor/L2-canvas/GraphEditor.tsx`);
  it reads nodes/edges from the graph store, NOT from its props (it calls `void initialNodes`).
- Load data into the store via `useGraphStore.getState().loadGraph(nodes, edges)` (signature `(nodes: ASTNode[], edges: ASTEdge[]) => void`).
- `NodeShell` renders each node by `registry.get(node.data.typeId)` and picks
  detail/label/dot by zoom tier. So a node with `data.typeId = 'conversation-step'`
  will automatically render through the generated renderers. Node `type` for react-flow
  must be `'default'` (GraphCanvas maps non-group to the `default` NodeShell).
- ELK layout: `computeElkLayeredLayout(nodes, edges, { direction: 'LR' })` from
  `src/features/graph-editor/L2-canvas/layout/layout-strategies.ts` returns
  `Array<{id, position}>`. Or reuse the `useGraphLayout()` hook. Positions must be
  applied before/after loadGraph so nodes are not stacked at 0,0.
- `ASTNode` shape (from `src/stores/types.ts`):
  ```ts
  { id: string; type: string; position: {x,y}; data: NodeData }
  // NodeData: { typeId, payload?: {typeId, value}, properties?, label?, category?, visualToken? }
  ```
  Mirror how `src/features/hum-body/lib/adapter.ts` builds ASTNodes (see makeNode): set
  `data.typeId='conversation-step'`, `data.label=title`, `data.category='conversation'`,
  `data.properties=<the fixture node.properties>`, and
  `data.payload={ typeId:'conversation-step', value: { ...properties } }`.
- `ASTEdge` shape: look at `src/stores/types.ts` and how hum-body/schema-to-graph build edges
  (source, target, id; type likely 'floating' or 'button' per GraphCanvas edgeTypes). Use the
  same edge type the existing graph uses so arrows render.

## Implementation
1. Create `src/features/antonia-flow/lib/adapter.ts`:
   - `import fixture from '../antonia-fixture.generated.json'` (ensure `resolveJsonModule` is on in tsconfig; if not, read via a typed import or a small loader — do NOT inline the data).
   - Export `async function buildAntoniaGraph(): Promise<{ nodes: ASTNode[]; edges: ASTEdge[] }>`:
     map fixture.nodes -> ASTNode (typeId 'conversation-step', payload/value = properties),
     map fixture.edges -> ASTEdge, run `computeElkLayeredLayout` (direction 'LR'),
     apply returned positions to the nodes. Node size from the registry def
     (`registry.get('conversation-step')?.defaultSize`), fallback {width:220,height:100}.
2. Create `src/features/antonia-flow/AntoniaFlowPage.tsx`:
   - On mount (`useEffect`), call `buildAntoniaGraph()` then
     `useGraphStore.getState().loadGraph(nodes, edges)`.
   - Render `<GraphEditor onSave={()=>{}} hero={{eyebrow:'Conversation Flow', title:'Antonia — real ConversationStep atoms', description:'12 steps + 20 transitions projected from the sldb model'}} />`.
   - Ensure `registerDefaultNodeTypes()` has run (App already does this? verify; if not, call it once).
3. Route it in `src/App.tsx`:
   - Add a lightweight toggle between the existing `HumBodyPage` and the new
     `AntoniaFlowPage` (e.g. a small top switch, or a `?view=antonia` query param,
     or a Tabs control). Keep HumBodyPage as default so nothing existing breaks.
     The Antonia view must be reachable with a single click / URL.
4. If `registerDefaultNodeTypes()` is not currently called at app startup, add it
   (idempotent; it already guards with registerIfMissing). Confirm `conversation-step`
   ends up in the registry at runtime.

## Validation (do ALL, paste output)
1. Unit/integration tests unchanged:
   `npm test`  -> MUST be 77 passed (or higher if you add tests; ZERO failures).
2. Typecheck/build:
   `npm run build`  -> MUST succeed (tsc + vite).
3. Live proof with Playwright (headless), against `npm run dev` (vite on 5173 or 5174 — detect the port from the dev log). Write a short script under `scripts/` or reuse `scripts/run-user-flow.mjs` with a NEW flow `user_flows/antonia_flow.json` that:
   - opens the app, switches to the Antonia view,
   - asserts `.react-flow__node` count === 12,
   - asserts at least one node shows real Antonia text (e.g. a title like "Saludo inicial" or kind "obtencion_datos"),
   - clicks a node and asserts the typed inspector/detail shows a `conversation-step` field (e.g. "instructions" or "kind"),
   - captures a full-page screenshot to `auto_user_test/antonia_flow/…png`.
   Run it and confirm PASS. Save the screenshot path.

## Done when
- graph_ui 77 tests green (0 failures), build succeeds.
- The Antonia view renders 12 real conversation-step nodes + 20 transition edges via the registry, with ELK layout.
- Playwright confirms count=12, real Antonia text visible, and the typed detail inspector shows conversation-step fields.
- Screenshot saved.

## Commit
When ALL green, commit on the branch:
`git add -A && git commit -m "feat(antonia-flow): render real ConversationStep atoms as a typed schema-driven canvas"`
Do NOT touch master. Do NOT promote. Report: files created/edited, test output, build result, playwright result, screenshot path, commit hash. If blocked, STOP and report — no fake data.
