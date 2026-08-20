# Projection Grammar — Technical Specification

Companion to `desk/drawer/features/feature-projection-grammar-vision.md` (why) and `desk/drawer/features/feature-projection-grammar-gap-analysis.md` (what exists). This document specifies the *what to build*.

Status: draft, unimplemented. Written from a single design conversation plus a full read of kgdb, spec2viz, deskops, and graph_ui's current source — not yet reviewed against a second opinion or a real integration attempt.

---

## 1. Problem statement

graph_ui has a working, domain-agnostic interactive graph editor (L1/L2/L3, `spec.md`) but no way to define *which slice of a graph* to look at, other than hand-building a new L1 adapter (Match, CV) or a new hardcoded lens (HUM's five presets). Every new "view" today means writing code. The ask is to make "which nodes, which relations, how they're drawn, what layout" a **data-defined, sidebar-editable, savable config** — so a new view is authored, not coded, and the same config can run against different graph databases.

## 2. Canonical data model

Three incompatible contracts exist today (see gap analysis §1 and §5). Before building the grammar, pick one canonical shape. Proposal: **kgdb's `Edge`/`KnowledgeNode` is the canonical shape**, because:

- It already models what the other two approximate (typed relation, open node facets).
- It's the one other producers (sldb, deskops) already target.
- graph_ui's own contracts (`UINode`/`UIEdge`) are explicitly a thin "reference specification" (per `atom-graph-ui.md`'s own open question), not a load-bearing runtime dependency yet — cheaper to adapt than kgdb.

Concretely:

```
kgdb.KnowledgeNode  →  graph_ui.UINode   (adapter, not a rewrite)
kgdb.Edge           →  graph_ui.UIEdge   (adapter, not a rewrite)
graph_ui.UINode/UIEdge → TS ASTNode/ASTEdge  (existing L1 translation pattern, per spec.md §3 — reuse schemaToGraph's role)
```

`UINode.metadata: dict[str, Any]` (`graph_ui/src/contracts/graph_data.py:43-46`) is already loose enough to carry a `KnowledgeNode`'s facet payloads without a schema change. The adapter is additive: a new `kgdb_to_ui_graph(snapshot: GraphSnapshot) -> GraphData` function in `graph_ui/src/`, not a rewrite of either side.

**Do not** invent a fourth contract. If TS `ASTNode`/`ASTEdge` needs new fields for this work, add them there — that's the layer that actually renders.

## 3. Projection grammar

### 3.1 Node selection — extend `FacetFilter`

Already correct in kgdb (`kgdb/src/kgdb/query/language.py:10-22`). No changes needed to filter nodes by facet field. Reuse as-is.

### 3.2 Relation selection — new `RelationFilter` (gap: does not exist today)

```python
class RelationFilter(BaseModel):
    """Filter edges by relation_type membership."""
    relation_types: list[VocabularyTerm]   # allow-list; empty = all
    direction: Literal["outgoing", "incoming", "both"] = "both"
```

Add to `StructuredQuery`:

```python
class StructuredQuery(BaseModel):
    filters: list[FacetFilter] = Field(default_factory=list)
    relations: list[RelationFilter] = Field(default_factory=list)   # NEW
    scope: GraphScope | None = None
```

This is a small, additive change to kgdb's existing query language — not a new system. `executor.py` needs one new branch: after resolving the node set, filter the edge set by `relation_type in relation_types` (and by direction) before handing edges to the caller.

### 3.3 Visual encoding — new, lives in graph_ui not kgdb

Encoding is presentation, not query — it belongs in graph_ui's L2, not in kgdb's query language (keeps kgdb domain-agnostic and reusable outside visualization entirely, e.g. for CLI queries).

```typescript
interface EncodingRule {
  when: { relationType?: string; nodeFacet?: string; facetValue?: unknown };
  style: { strokeColor?: string; strokeStyle?: 'solid' | 'dashed'; strokeWidth?: number; nodeColorToken?: string };
}
```

A list of `EncodingRule`s is the "1.1" part of the vision — secondary to filtering, applied only to whatever the `RelationFilter`/`FacetFilter` already let through. Rendered by extending `NodeShell`/`FloatingEdge` (`graph_ui/spec.md` §3 file list) to consult the active rule list instead of a single hardcoded `colorToken` per type.

### 3.4 Saved views — new registry (gap: does not exist anywhere)

```python
class ProjectionView(BaseModel):
    view_id: str
    label: str
    query: StructuredQuery          # what nodes/relations
    encoding: list[EncodingRule]    # how they're drawn        (§3.3, TS-side type mirrored in Python for storage)
    layout_strategy: str            # which render engine / layout (§4)
    created_by: str
    created_at: datetime
```

Stored as JSON files under `graph_ui/desk/fixtures/views/` initially (matches the existing fixture-file convention in `provider.py` — no new storage system needed for v1). A `ProjectionViewStore` (new, small — `load(view_id)`, `save(view)`, `list()`) is the "registry" the vision calls for. **Portability requirement**: `query.filters[].facet` and `relations[].relation_types` must reference facet/relation *names*, never literal node ids — that's what makes a view re-runnable against a different kgdb instance (per the vision's "aplicable a distintas bases de datos").

### 3.5 UI surface

Extends the existing `FiltersSection` (`graph_ui/spec.md` §5 file list, already has relation-type toggles spec'd per `spec.md` §2 "Filters" section) rather than replacing it — the sidebar filter UX described in the product spec is already close to right; it's missing the *save this as a named view* action and the *encoding rule* editor. Two new sidebar sections: `EncodingSection` (rule list editor) and `ViewsSection` (load/save/list `ProjectionView`s), sitting alongside the existing `FiltersSection`/`ViewSection` per the file structure in `spec.md` §5.

## 4. Render engine — architecture-style layout

### 4.1 Strategy registry, mirroring spec2viz's pattern

```typescript
interface LayoutStrategy {
  id: string;                     // 'elk-layered' | 'elk-rings' | 'force' | 'tree'
  computeLayout(nodes: ASTNode[], edges: ASTEdge[], config: unknown): Promise<ASTNode[]>;
}
const LAYOUT_REGISTRY: Record<string, LayoutStrategy> = { /* ... */ };
```

This is the TS-side equivalent of `spec2viz/renderers/__init__.py:19-28`'s `RENDERER_MAP` — same shape, same rationale (swap implementation, same interface). `ProjectionView.layout_strategy` (§3.4) selects a key into this registry.

### 4.2 Two concrete strategies to start with (not all of them — per vision 1.3, do these well before adding more)

- **`elk-layered`**: already exists (`use-graph-layout.ts`), just needs to be registered under a name instead of being the only option.
- **`elk-rings`**: new ELK configuration (ELK supports a `radial` layout algorithm natively — no new dependency), constrained so that nodes sharing a `layer`/`ring` facet value are placed on the same radius, and edges are only drawn between adjacent rings unless the edge's relation type is explicitly marked as an "interface" relation (config, not hardcoded) — this is the concrete mechanism behind vision point 2 ("conectada solo por interfaces").

Do not build a general "architecture style DSL" yet. Two strategies, proven against the sldb test domain (§5), is the right scope per vision point 1.3.

## 5. Test domain: sldb

sldb is the proving ground, not the destination (per user direction). Concretely:

1. Extend sldb's AST export so it produces kgdb `Edge`/`KnowledgeNode` data (today it goes straight to spec2viz's `ComponentIR`, bypassing kgdb entirely — gap analysis §5). This reuses the `defines`/`imports`/`is_kind` relation types spec2viz's generators already emit (gap analysis §1) — just needs a new sink, not new extraction logic.
2. Build one `ProjectionView` by hand against that data: filter to `relation_type: imports`, encode `imports` edges one way, layout with `elk-layered`.
3. Build a second view: filter to `defines` (class membership, vision point 1.2), different encoding, same or different layout.
4. That's the "prove it end to end" milestone — not full coverage of sldb's AST, not all relation types, not both layout strategies polished. Two views, working, is the target.

## 6. Non-goals (explicit, to prevent scope creep)

- Not building a general-purpose graph query language beyond `RelationFilter` + existing `FacetFilter`/`GraphScope`.
- Not replacing HUM's five lenses immediately — they're a working, shipped UX for a different, narrower purpose (hum-core self-inspection). They become *optional presets expressible in the new grammar* later, not a day-one migration.
- Not building more than two layout strategies in the first pass (§4.2).
- Not solving multi-tenant/permissions on saved views — single-user, file-based, per §3.4.
- Not touching the Match/CV product surface (`spec.md`'s original PhD-workbench scope) — orthogonal, already shipped, leave it alone.

## 7. Open technical risks

- ELK's radial/rings algorithm may not natively support "edges only between adjacent rings unless marked interface" — needs a short spike before committing to §4.2's `elk-rings` design as described; may need post-processing on top of ELK's layout output rather than ELK config alone.
- `StructuredQuery`'s new `relations: list[RelationFilter]` field (§3.2) needs a corresponding executor change in kgdb (`kgdb/src/kgdb/query/executor.py`) — this spec proposes the shape but the executor implementation is unverified against kgdb's actual graph traversal internals (NetworkX-backed, per the ecosystem discovery this spec is based on) — read `executor.py` in full before implementing, not just `language.py`.
