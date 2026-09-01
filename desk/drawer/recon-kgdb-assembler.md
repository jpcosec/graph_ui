# Code Context — kgdb as a PURE assembler

Recon of worktree `/home/jp/proyectos/hum-ecosystem/tools/iso-lab/worktrees/kgdb`.
Goal: understand how kgdb ingests SLDB documents into a `GraphSnapshot` today, and
what it would take to make kgdb a PURE assembler that consumes authored `Relation`
instances instead of re-deriving edges from text/semantic fields.

## Files Retrieved
1. `src/kgdb/ingest/sldb.py` (lines 1-260, whole file) — the ingest path; derives all edges.
2. `src/kgdb/contracts/base.py` (lines 1-38) — `Edge`, `SystemIdentity`, `VocabularyTerm` shapes.
3. `src/kgdb/contracts/node.py` (lines 39-113) — `KnowledgeNode` + `FacetPayload` shapes.
4. `src/kgdb/contracts/io.py` (lines 1-51) — `GraphSnapshot` + `QueryResult` shapes.
5. `src/kgdb/contracts/__init__.py` (lines 1-27) — lazy contract exports.
6. `src/kgdb/query/language.py` (lines 1-70) — `RelationFilter`, `StructuredQuery` (commit cc6b1c9).
7. `src/kgdb/query/executor.py` (lines 1-152) — query execution + relation-filter application.
8. `src/kgdb/graph/utils.py` (lines 1-120) — `add_knowledge_node`, `load_graph`, `save_graph`.
9. `src/kgdb/main.py` (lines 96-180) — CLI `ingest` / `ingest-sldb`; dangling-edge check.
10. `tests/test_sldb_semantic_ingest.py` (lines 1-60) — ingest test pattern.
11. `tests/test_query.py` (lines 75-150) — RelationFilter test pattern.
12. `desk/drawer/tasks/task-relation-as-first-class-...kgdb.md` — the driving intent/spec.

---

## 1. Ingest path — how edges are derived TODAY

**File: `src/kgdb/ingest/sldb.py`.** The public entry is
`sldb_semantic_export_to_snapshot(payload) -> GraphSnapshot` (lines 13-55). It validates
the contract (`sldb_kgdb_semantic_export` v1), then builds one `KnowledgeNode` per store,
semantic tag, model, document, and section.

**Important nuance for this task:** there is NO `allowed_transitions` / `grounding_atoms`
parsing in this repo's code. Those strings appear ONLY in the task/spec doc
(`desk/drawer/tasks/...md:29,42`) as the *problem statement* — the pattern kgdb should
stop doing. The actual code in `ingest/sldb.py` derives edges by **re-reading structured
list fields** on the SLDB payload (models/documents/sections `semantic_tags`,
`semantic_dag.parents`, `semantic_dag.equivalences`, and the model→document containment).
This IS the "re-parse text fields to materialize edges" anti-pattern the task targets;
the edge relation is invented by kgdb, not authored by SLDB.

Edges are constructed inline inside each node builder. Examples:

```python
# store node: one has_model edge per model  (lines 96-105)
edges=[Edge(target_id=_model_id(model["name"]), relation_type="has_model")
       for model in payload["models"]]

# semantic tag node: parents + equivalences (lines 111-136)
edges = [Edge(target_id=_semantic_tag_id(parent), relation_type="semantic_parent")
         for parent in parents_by_tag.get(tag, [])]
edges.extend(Edge(target_id=_semantic_tag_id(eq), relation_type="semantic_equivalent")
             for eq in equivalences)

# model node: has_document + tagged_as (lines 146-158)
edges=[Edge(target_id=_document_id(d["id"]), relation_type="has_document") for d in documents]
    + [Edge(target_id=_semantic_tag_id(t), relation_type="tagged_as") for t in model["semantics"]]

# document node: has_section + tagged_as (lines 175-187)
# section node: tagged_as only (lines 203-207)
```

ID minting is centralized (lines 246-260):
```python
def _model_id(name):        return f"sldb://model/{name}"
def _document_id(id):       return f"sldb://document/{id}"
def _section_id(id):        return f"sldb://section/{id}"
def _semantic_tag_id(tag):  return f"sldb://semantic_tag/{tag}"
```

Relation vocabulary currently emitted: `has_model`, `has_document`, `has_section`,
`tagged_as`, `semantic_parent`, `semantic_equivalent`.

**To make kgdb a PURE assembler:** the per-builder `Edge(...)` list-comprehensions
(store lines 100-103, tag lines 121-129, model lines 149-158, document lines 178-187,
section lines 204-207) would be replaced by consuming an authored `edges`/`relations`
collection from the payload (`node-docs ∪ edge-docs = GraphSnapshot`, per task §1).
Node builders would keep minting `identity` + `semantics` + `source`, but `edges=[]`
would be filled from authored `Relation` instances, not derived here.

---

## 2. Edge and KnowledgeNode contract definitions

**File: `src/kgdb/contracts/base.py`.**
```python
VocabularyTerm = Annotated[str, Field(min_length=1,
    pattern=r"^[A-Za-z][A-Za-z0-9_.:-]*$", ...)]   # relation/type token grammar

class Edge(BaseModel):
    target_id: str
    relation_type: VocabularyTerm
    metadata: dict[str, Any] = {}

class SystemIdentity(BaseModel):
    node_id: str
    node_type: VocabularyTerm
```
Note: `Edge` has NO `source_id` — it lives *inside* a node's `edges` list, so the source
is implicit (the owning node). An authored `Relation` doc would need an explicit source id;
the assembler would attach it to the correct owning node's `edges`.

**File: `src/kgdb/contracts/node.py`.**
```python
class KnowledgeNode(BaseModel):
    identity: SystemIdentity
    edges: list[Edge] = []
    semantics: FacetPayload | None = None
    ast / io_ports / compliance / adr / test_map / git / source   # code-wiki facets
```
`FacetPayload` (lines 11-37) is `extra="allow"` with lazy defaults via `__getattr__`.
The task (§1) flags `ast/git/test_map/compliance/adr` as code-wiki-biased/inert for
non-code domains — open question whether to slim `KnowledgeNode` to
`identity + edges + semantics` or register facets per domain.

**File: `src/kgdb/contracts/io.py`.**
```python
class GraphSnapshot(BaseModel):
    version: str
    created_at: datetime = now(utc)
    nodes: list[KnowledgeNode]
    metadata: dict[str, Any] = {}
```
Edges are NOT a top-level `GraphSnapshot` field — they are embedded per node. A pure
assembler that consumes separate edge-docs must route each authored edge onto its source
node's `edges` list during assembly (or the snapshot schema must grow a top-level edge list).

Exports are lazy via `src/kgdb/contracts/__init__.py` (`Edge`, `GraphSnapshot`,
`KnowledgeNode`, `SystemIdentity`, `QueryResult`, `VocabularyTerm`, persistence types).

---

## 3. RelationFilter (commit cc6b1c9)

Commit `cc6b1c99` "feat(query): add RelationFilter to StructuredQuery" (Fri Aug 21 2026).
Changed `query/language.py`, `query/executor.py`, `query/server.py`, `tests/test_query.py`.

**Lives in: `src/kgdb/query/language.py` (lines 33-70).**
```python
class RelationFilter(BaseModel):
    relation_types: list[str] = []                       # allow-list; empty = all pass
    direction: Literal["outgoing","incoming","both"] = "both"

class StructuredQuery(BaseModel):
    filters: list[FacetFilter] = []
    relations: list[RelationFilter] = []                 # empty = no edge filtering
    scope: GraphScope | None = None
```

**How StructuredQuery uses it — `src/kgdb/query/executor.py`:**
- `execute_query` (lines 13-23): scope → facet match → `_apply_relation_filters(node, graph, query.relations)`, mutating each result node's `edges` in place.
- `_apply_relation_filters` (lines 103-125): if no filters, keep all edges; else keep an
  edge if it matches ANY filter (OR across filters).
- `_collect_allowed_types` (128-136): union of allow-lists; any empty list ⇒ `None` (no type filtering).
- `_edge_matches_filter` (139-152): only checks `relation_type ∈ allowed_types`.

**RISK / finding (medium):** `RelationFilter.direction` is declared but **NOT enforced** —
`_edge_matches_filter` ignores direction, and `KnowledgeNode.edges` only holds outgoing
edges anyway, so "incoming" is not currently expressible from a single node's edge list.
Relevant if the pure-assembler flow-view work (task §2) relies on directional projection.

---

## 4. How GraphSnapshot is built and emitted

- **Built:** `sldb_semantic_export_to_snapshot` returns a `GraphSnapshot(version="1.0",
  nodes=[...], metadata={source_contract, producer, store, generated_from})`
  (`ingest/sldb.py:47-54`).
- **Emitted to NetworkX + disk:** CLI `main.py`.
  - `ingest-sldb` (lines 148-180): parse JSON → `sldb_semantic_export_to_snapshot` →
    dangling-edge check → `add_knowledge_node` per node → `save_graph`.
  - `ingest` (lines 96-146): consumes an already-formed `GraphSnapshot` JSON directly
    (version-gated to 1.0), same dangling-edge check, same assembly. **This `ingest` path is
    effectively the "pure assembler" seam** — it takes `GraphSnapshot` nodes+edges and lays
    them into the graph without re-deriving anything.
- **NetworkX projection:** `graph/utils.py::add_knowledge_node` (lines 14-31) adds a node
  (`type`, `status`, `schema=node.model_dump()`) and one `graph.add_edge(src, edge.target_id,
  relation=..., metadata=...)` per edge. `save_graph` writes node-link JSON.
  `load_graph` (34-79) reads either GraphSnapshot format or NetworkX node-link format.

---

## 5. Where kgdb tests live and the pattern

Tests in `tests/` (pytest, function-style, no classes):
- `test_sldb_semantic_ingest.py` — loads real fixture
  `contracts/fixtures/sldb_kgdb_semantic_export.v1.json`, calls
  `sldb_semantic_export_to_snapshot`, asserts on `nodes_by_id[...]` identity/edges/semantics.
  Pattern: `nodes_by_id = {n.identity.node_id: n for n in snapshot.nodes}` then edge/relation asserts.
- `test_query.py` — RelationFilter tests (lines 75-150) ingest a substrate graph to a
  `tmp_path` file, write a JSON query file, `monkeypatch` `sys.argv`, run `main()`, capture
  stdout via `redirect_stdout`, assert on parsed edges. e.g. `{"relations":[{"relation_types":["depends_on"]}]}`.
- Others: `test_ingest.py`, `test_integration.py`, `test_io.py`, `test_sldb_semantic_contract.py`,
  `test_sldb_semantic_query_examples.py`, `test_vocabulary.py`.
- Fixtures/contracts: `contracts/fixtures/`, `contracts/schemas/`
  (`sldb_kgdb_semantic_export.schema.json`, `kgdb_graph_bundle.schema.json`,
  `sldb_document_payload.schema.json`), `contracts/queries/sldb/*.json`.
- GUARDRAIL from task doc: "sin mocks — requiere GraphSnapshot real, no fixtures fabricados."

---

## 6. Referential-integrity handling (orphan / dangling edges)

Handled ONLY at the CLI ingest layer, as a **non-fatal warning** (not an error, not a filter):

```python
# main.py:126-131 (ingest) and main.py:161-166 (ingest-sldb) — identical pattern
node_ids = {node.identity.node_id for node in snapshot.nodes}
for node in snapshot.nodes:
    for edge in node.edges:
        if edge.target_id not in node_ids:
            print(f"Warning: dangling edge from '{node.identity.node_id}' "
                  f"to nonexistent node '{edge.target_id}'", file=sys.stderr)
```

Observations / findings:
- The assembler function `sldb_semantic_export_to_snapshot` itself performs **no**
  integrity validation — dangling edges pass straight through into the `GraphSnapshot`.
- Dangling edges are still materialized: `add_knowledge_node` calls `graph.add_edge(...)`
  which auto-creates a phantom target node in NetworkX with no `schema`.
- The task doc explicitly names this open tension: *"integridad referencial de aristas
  colgantes (validar en ensamblado)"* — i.e., a pure assembler should validate/reject
  orphan authored edges at assembly time, not warn at CLI time.

---

## Architecture
SLDB export JSON → `ingest/sldb.py` (node builders derive edges from list fields) →
`GraphSnapshot` (nodes with embedded `edges`) → `main.py` CLI (dangling-edge warn) →
`graph/utils.add_knowledge_node` → NetworkX `DiGraph` → `save_graph` JSON. Queries load the
graph and run `query/executor.execute_query`, where `RelationFilter` prunes each node's
edge list in place. To become a PURE assembler, the edge-derivation in `ingest/sldb.py`
must be replaced by consumption of authored `Relation`/edge-docs (routed onto source nodes),
and referential integrity must move from CLI warning into assembly-time validation.

## Start Here
Open `src/kgdb/ingest/sldb.py` first — it holds every edge-derivation site that must change,
plus the `GraphSnapshot` assembly boundary. Then `src/kgdb/contracts/base.py` (Edge shape,
which lacks `source_id`) to design how authored `Relation` docs bind to node `edges`.

## Supervisor coordination
Not blocked; no decision needed. Findings returned normally.

---

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Reported concrete file paths + line ranges + snippets for ingest path (src/kgdb/ingest/sldb.py), Edge/KnowledgeNode/GraphSnapshot contracts (contracts/base.py, node.py, io.py), RelationFilter+StructuredQuery from commit cc6b1c9 (query/language.py, executor.py), snapshot build/emit (main.py, graph/utils.py), test patterns (tests/), and orphan-edge handling (main.py:126-131,161-166). Flagged two findings with severity."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {"command": "git show --stat cc6b1c9", "result": "passed", "summary": "confirmed RelationFilter commit scope and files"},
    {"command": "grep allowed_transitions|grounding_atoms", "result": "passed", "summary": "confirmed those strings exist only in task doc, not in code"}
  ],
  "validationOutput": [
    "No code changes made; read-only recon. Report written to desk/drawer/recon-kgdb-assembler.md"
  ],
  "residualRisks": [
    "medium: RelationFilter.direction is declared but not enforced in executor._edge_matches_filter; KnowledgeNode.edges holds only outgoing edges, so 'incoming' projection is not currently expressible.",
    "medium: referential integrity for dangling edges is only a CLI stderr warning (main.py), not assembly-time validation; dangling edges still create phantom NetworkX nodes.",
    "low: no literal allowed_transitions/grounding_atoms parsing exists in this repo; the anti-pattern is edge-derivation from SLDB list fields in ingest/sldb.py — confirm the task's intended target with the parent if it expected literal transition-string parsing.",
    "low: Edge has no source_id; authored Relation docs will need routing onto owning node edges, or GraphSnapshot needs a top-level edge list."
  ],
  "noStagedFiles": true,
  "diffSummary": "No diff; read-only recon, single report file written to the mandated output path.",
  "reviewFindings": [
    "no blockers",
    "finding: src/kgdb/query/executor.py:139-152 - RelationFilter.direction ignored (medium)",
    "finding: src/kgdb/main.py:126-131,161-166 - dangling edges only warned, not validated at assembly (medium)"
  ],
  "manualNotes": "kgdb already has a 'pure assembler' seam: the CLI `ingest` command (main.py:96-146) consumes a pre-formed GraphSnapshot without re-deriving edges. The refactor is essentially making `ingest-sldb`/ingest/sldb.py consume authored edge-docs like `ingest` does, plus moving integrity checks into assembly."
}
```
