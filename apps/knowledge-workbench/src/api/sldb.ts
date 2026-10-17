/**
 * SLDB adapter: the store's shapes translated into the knowledge contract.
 *
 * Deliberately a translation layer, not a passthrough. The views speak
 * Source/Atom/Relation/Doc; SLDB speaks documents, payloads and edges. Leaking
 * SLDB's shapes into the views would turn this back into an IR viewer.
 *
 * Endpoints verified against `sldb serve` (routes.py):
 *   GET /models                    registered models
 *   GET /document?id=<name>        payload + path + model_name
 *   GET /find?q=<term>             physical/semantic search
 *   GET /edges?from=<id>           outgoing edges
 *   GET /stores/check              divergence diagnosis
 *   POST /save                     payload write with `expected` -> 409
 */
import type { Atom, Knowledge, Relation } from '@/schema/knowledge';

const BASE = import.meta.env.VITE_SLDB_URL || '/sldb';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  const body = await res.json();
  if (body?.ok === false) throw new Error(`${path} → ${body.error}`);
  return body as T;
}

interface SldbDocument {
  id: string;
  model_name: string;
  path: string;
  payload: Record<string, unknown>;
  content_hash?: string;
}

interface SldbFindResult {
  kind: string;
  name: string;
  model: string;
  doc: string;
  path: string;
}

/** Atom-bearing models, in preference order, with the semantic tag each carries. */
const ATOM_MODELS: { name: string; semanticTag: string }[] = [
  { name: 'AtomDoc', semanticTag: 'type.knowledge.atom' },
  { name: 'DomainAtom', semanticTag: 'type.knowledge.domain' },
  { name: 'KnowledgeAtom', semanticTag: 'type.knowledge.atom' },
];

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function strList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/**
 * An SLDB document becomes an Atom.
 *
 * `provenance` in SLDB is a free-text path, not an offset range, so it cannot
 * fill our `{sourceId, span}` on its own: a real span only exists once the text
 * has been anchored. Rather than fake it, the raw string is kept on
 * `provenanceHint` and Health reports the atom as lacking a resolvable origin.
 */
export function documentToAtom(doc: SldbDocument): Atom & { provenanceHint?: string } {
  const p = doc.payload ?? {};
  const hint = str(p.provenance);
  return {
    id: str(p.id) || doc.id,
    title: str(p.title) || doc.id,
    answer: str(p.answer) || str(p.summary) || str(p.body),
    tags: strList(p.tags),
    provenance: null,
    ...(hint ? { provenanceHint: hint } : {}),
  };
}

/** Which registered model actually holds atoms in this store. */
export async function detectAtomModel(): Promise<{ name: string; semanticTag: string }> {
  const { models } = await get<{ models: { name: string }[] }>('/models');
  const names = models.map((m) => m.name);
  const found = ATOM_MODELS.find((m) => names.includes(m.name));
  if (!found) throw new Error(`No atom model in store. Registered: ${names.join(', ')}`);
  return found;
}

/**
 * Document names for a model.
 *
 * `sldb serve` exposes NO listing route: `/models/detail` returns only the
 * contract, and `/find` rejects an empty query with HTTP 400. The way in is the
 * semantic index — every document carries its model's `__semantics__` as tags,
 * so searching the model's own tag enumerates its documents.
 *
 * Results are deduplicated: sections and fields each produce a separate hit for
 * the same document (938 hits for 64 documents in the MEPU store).
 */
export async function listDocuments(model: { name: string; semanticTag: string }): Promise<string[]> {
  const { results } = await get<{ results: SldbFindResult[] }>(
    `/find?q=${encodeURIComponent(model.semanticTag)}&in=semantic`,
  );
  return [...new Set(results.filter((r) => r.model === model.name && r.doc).map((r) => r.doc))];
}

export async function fetchDocument(id: string): Promise<SldbDocument> {
  return get<SldbDocument>(`/document?id=${encodeURIComponent(id)}`);
}

interface SldbEdge {
  from?: string;
  to?: string;
  predicate?: string;
  type?: string;
}

const RELATION_TYPES: Relation['type'][] = [
  'grounded_by',
  'flows_to',
  'constrains',
  'refines',
  'contradicts',
];

function toRelationType(raw: string): Relation['type'] {
  const found = RELATION_TYPES.find((t) => t === raw);
  return found ?? 'flows_to';
}

/** Outgoing edges for one atom, mapped to the relation vocabulary. */
export async function fetchRelations(atomId: string): Promise<Relation[]> {
  const { edges } = await get<{ edges: SldbEdge[] }>(`/edges?from=${encodeURIComponent(atomId)}`);
  return edges.map((e, i) => ({
    id: `${atomId}-${i}`,
    type: toRelationType(str(e.predicate ?? e.type)),
    from: str(e.from) || atomId,
    to: str(e.to),
    motive: '',
  }));
}

export interface DivergenceReport {
  name: string;
  /** Text moved but fields held still: a reformat, not a data change. */
  contentOnly: boolean;
}

/**
 * Divergence between the markdown and the index.
 *
 * Markdown and store carry the SAME information — the model defines a bijection
 * between them. A mismatch is a stale index or a bug, never a question of which
 * side wins. `hash_c` signs the text, `hash_d` signs the extracted payload:
 * text moving while fields hold still is a reformat.
 */
export async function fetchDivergences(): Promise<DivergenceReport[]> {
  try {
    const body = await get<{ documents?: { name: string; content_ok?: boolean; fields_ok?: boolean }[] }>(
      '/stores/check',
    );
    return (body.documents ?? [])
      .filter((d) => d.content_ok === false || d.fields_ok === false)
      .map((d) => ({ name: d.name, contentOnly: d.content_ok === false && d.fields_ok !== false }));
  } catch {
    return [];
  }
}

/** Load the store into the knowledge contract. Sources and docs stay empty: SLDB has no notion of either yet. */
export async function loadFromSldb(limit = 40): Promise<Knowledge> {
  const model = await detectAtomModel();
  const names = (await listDocuments(model)).slice(0, limit);
  const documents = await Promise.all(names.map((n) => fetchDocument(n).catch(() => null)));
  const atoms = documents.filter((d): d is SldbDocument => Boolean(d)).map(documentToAtom);

  const relationLists = await Promise.all(atoms.map((a) => fetchRelations(a.id).catch(() => [])));
  const known = new Set(atoms.map((a) => a.id));
  const relations = relationLists.flat().filter((r) => known.has(r.to) && known.has(r.from));

  return { sources: [], atoms, relations, docs: [], drafts: [] };
}

/** Write a payload back. `expected` gives optimistic concurrency: 409 on conflict. */
export async function saveAtom(
  docId: string,
  payload: Record<string, unknown>,
  expected?: string,
): Promise<{ ok: boolean; conflict: boolean; error?: string }> {
  const res = await fetch(`${BASE}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes: [{ id: docId, payload, ...(expected ? { expected } : {}) }] }),
  });
  if (res.status === 409) return { ok: false, conflict: true, error: 'Conflicto: otro cambio llegó primero.' };
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok && body?.ok !== false, conflict: false, error: body?.error };
}
