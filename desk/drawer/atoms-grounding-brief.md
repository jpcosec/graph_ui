# Grounding brief for atom authors (graph_ui)

Verified facts. Do NOT invent beyond these. Source: repo code read on 2026-08-24.

## Identity
- graph_ui = reusable, domain-agnostic visual editor for graph-shaped data (nodes, edges, typed attributes).
- The tool is the identity; consuming apps are downstream, never part of its definition.
- Companion tool spec2viz renders architecture from specs (no overlap): graph_ui edits instances, spec2viz renders specs.
- Target data source = kgdb. Relationship one-directional: consume graph data + edit it.

## Backend (Python, src/)
- contracts/graph_data.py: Pydantic GraphData, UINode, UIEdge. Canonical contract.
- editor.py: GraphEditorEngine.apply_node_edit / apply_edge_edit. CRUD with collision + cascade delete.
- auditor.py: StructuralAuditor.audit -> decorates nodes with compliance_status (orphan/terminal/valid) from in/out degree.
- provider.py: GraphProvider.load_fixture(name) reads validated JSON from desk/fixtures/.
- adapters/kgdb_adapter.py: kgdb_to_ui_graph(GraphSnapshot) -> GraphData. Maps KnowledgeNode -> UINode, edges by relation_type + metadata.

## Frontend (apps/review-workbench/, React 18 + Vite + TS)
- Stack: @xyflow/react (ReactFlow) canvas, zustand stores, zod validation, dagre layout, tailwind, Radix UI, TanStack Query.
- 3 layers: L1 app (fetch data, register node types, orchestrate), L2 canvas (ReactFlow, sidebar, layout, encoding, views), L3 content (per node/edge renderers).
- Default mounted page = HumBodyPage (src/App.tsx), NOT the generic GraphEditorPage.

### L1
- GraphEditorPage.tsx: useQuery getSchema + getGraph via graphDataProvider; registerSchemaTypes into registry; loadGraph into store; saveMutation -> graphToDomain -> saveGraph.
- HumBodyPage.tsx: buildHumViewGraph(mode) per HumViewMode = structure|body|routine|trace|compare; builds in-memory draft graphs.

### L2 canvas
- GraphEditor.tsx: composes GraphCanvas, CanvasSidebar, NodeInspector, EdgeInspector, CommandMenu; useKeyboard.
- GraphCanvas.tsx: ReactFlow host; filterGraphByRelationTypes.
- CanvasSidebar sections: CreationSection (drag type cards to create), FiltersSection (text search / relation-type toggles / attribute filter / neighbors-only / clear), EncodingSection (encoding rules), ViewsSection (save/load named projection views), ViewSection (auto-layout trigger), ActionsSection (save / undo / redo).
- panels: NodeInspector (edit name + key/value properties, add/delete props), EdgeInspector (edit relation type).
- components: CommandMenu (Ctrl+K palette: name + type to create).
- hooks: use-keyboard (browse vs edit modes; arrows navigate, Delete removes, Enter opens inspector), use-graph-layout (runs active layout strategy), use-edge-inheritance (reroute child edges to group boundary on collapse).
- layout/layout-strategies.ts: LAYOUT_STRATEGIES registry. dagre-layered (default) + concentric-rings. getLayoutStrategy(name).
- encoding/encoding-rules.ts: EncodingRule { when:{relationType?|nodeFacet?|facetValue?}, style }. DEFAULT_ENCODING_RULES = edge + node rules. resolveEdgeStyle/resolveNodeStyle. Encoding is secondary to filtering.

### Stores (zustand)
- graph-store.ts: GraphStore. nodes, edges, undoStack, redoStack. Actions: loadGraph, addElements, removeElements, updateNode, updateEdge, onNodesChange/onEdgesChange/onConnect, undo, redo, isDirty, markSaved. UpdateOptions.isVisualOnly=true means NOT undoable (pan/zoom/collapse). SemanticAction types: CREATE_ELEMENTS|DELETE_ELEMENTS|UPDATE_NODE|UPDATE_EDGE.
- ui-store.ts: UIStore. EditorState = browse|focus|edit_node|edit_relation. selectedNode, selectedEdge, filters {filterText, relation toggles, attributeFilter, neighbors-only}, clearFilters.
- lib/projection-view-store.ts: ProjectionViewStore over localStorage. save/load/list named views. Views MUST reference facet + relation NAMES, never literal node ids (findLiteralNodeIdReferences guards this).

### Schema
- schema/registry.ts + registry.types.ts: NodeTypeDefinition { typeId, label, icon, category, colorToken, payloadSchema (zod), renderers{dot,label,detail}, defaultSize, allowedConnections }. register-defaults.ts seeds defaults.

### AST contract (stores/types.ts)
- ASTNode { id, type, position{x,y}, data{typeId,payload,properties,visualToken,label,name}, parentId, extent }.
- ASTEdge { id, source, target, type, data{relationType, properties, _original*} }.

## Data source (CURRENT vs TARGET)
- CURRENT: HumBodyPage -> buildHumViewGraph -> humBodyModel (mock-data.ts) -> generated-hum-ast.ts (static TS array baked into bundle). saveGraph is a NO-OP returning {ok:true}. Named views persist only in localStorage.
- hum:sync (scripts/generate-hum-ast.mjs) should regenerate generated-hum-ast.ts from a hum source tree, but repoRoot resolves to apps/../../../hum which does not exist (real source one level up); silently keeps frozen fixture.
- Second unmounted path: GraphEditorPage -> graphDataProvider.getGraph -> mockClient -> src/mock/fixtures/graph_data.json.
- TARGET: kgdb as live source both directions. Read via kgdb_to_ui_graph. Write via a real saveGraph persisting to kgdb. Open questions: kgdb server/API vs on-disk lib; whole-snapshot replace vs incremental mutations.

## Deployment
- Browser runs review-workbench SPA served by Vite dev server on :5173. hum:sync is a build-time step producing the static fixture. kgdb store/API is the target backend (not wired).

## Tags (namespaces only: namespace:value)
- system:graph_ui always.
- topic:<subject> e.g. topic:architecture, topic:editing, topic:data-loading, topic:layout, topic:filtering, topic:stores, topic:contracts, topic:runtime.
- layer:<layer> e.g. layer:backend, layer:frontend, layer:canvas, layer:runtime.
- NEVER use spec:... (invalid namespace). Valid namespaces: system, topic, layer, domain.

## 5WH1+ questions
what | why | how | how_not | when | where | for_whom
- what: definition / responsibility.
- why: reason it exists / problem solved.
- how: mechanism / implementation.
- how_not: anti-patterns, what it must NOT do.
- when: lifecycle timing / when it runs or applies.
- where: location in codebase / architecture layer.
- for_whom: who consumes it (operator, other module, downstream tool).
