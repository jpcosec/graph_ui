/**
 * Derived reads over the knowledge graph.
 *
 * Everything the views need that is NOT stored: usages, neighbours, resolved
 * bindings. Kept pure so it can be tested without React.
 */
import type { Atom, Binding, Doc, Knowledge, Relation, Source, Span } from '@/schema/knowledge';

export function atomById(k: Knowledge, id: string): Atom | undefined {
  return k.atoms.find((a) => a.id === id);
}

export function sourceById(k: Knowledge, id: string): Source | undefined {
  return k.sources.find((s) => s.id === id);
}

/** Every relation touching this atom, in either direction. */
export interface Incident {
  relation: Relation;
  direction: 'out' | 'in';
  other: Atom | undefined;
}

export function incidentRelations(k: Knowledge, atomId: string): Incident[] {
  const out: Incident[] = [];
  for (const relation of k.relations) {
    if (relation.from === atomId) out.push({ relation, direction: 'out', other: atomById(k, relation.to) });
    else if (relation.to === atomId) out.push({ relation, direction: 'in', other: atomById(k, relation.from) });
  }
  return out;
}

/**
 * Resolve a binding to the atoms it shows.
 *
 * `list` is explicit and stays put. `query` re-evaluates, which is what keeps a
 * document from ageing: a new atom carrying the tag shows up on its own.
 */
export function resolveBinding(k: Knowledge, binding: Binding): Atom[] {
  if (binding.kind === 'list') {
    return binding.atomIds.map((id) => atomById(k, id)).filter((a): a is Atom => Boolean(a));
  }
  return k.atoms.filter((atom) => {
    const tagged = binding.tags.length === 0 || binding.tags.some((t) => atom.tags.some((at) => at.startsWith(t)));
    if (!tagged) return false;
    if (!binding.relatedTo) return true;
    return k.relations.some(
      (r) =>
        (r.from === atom.id && r.to === binding.relatedTo) ||
        (r.to === atom.id && r.from === binding.relatedTo),
    );
  });
}

/** Where a fact is shown. This is what powers the "editing it changes both" warning. */
export interface Usage {
  doc: Doc;
  sectionId: string;
  heading: string;
  via: Binding['kind'];
}

export function usagesOf(k: Knowledge, atomId: string): Usage[] {
  const usages: Usage[] = [];
  for (const doc of k.docs) {
    for (const section of doc.sections) {
      const shown = resolveBinding(k, section.binding).some((a) => a.id === atomId);
      if (shown) {
        usages.push({ doc, sectionId: section.id, heading: section.heading, via: section.binding.kind });
      }
    }
  }
  return usages;
}

/** Fraction of a source already turned into facts — the work metric in the Reader. */
export function anchoredRatio(source: Source): number {
  if (!source.text.length) return 0;
  const covered = source.anchored.reduce((sum, a) => sum + (a.span.end - a.span.start), 0);
  return Math.min(1, covered / source.text.length);
}

/** Split a source into consecutive segments, flagged as anchored or not. */
export interface Segment {
  text: string;
  span: Span;
  atomId: string | null;
}

export function segmentSource(source: Source): Segment[] {
  const marks = [...source.anchored].sort((a, b) => a.span.start - b.span.start);
  const segments: Segment[] = [];
  let cursor = 0;
  for (const mark of marks) {
    if (mark.span.start > cursor) {
      segments.push({
        text: source.text.slice(cursor, mark.span.start),
        span: { start: cursor, end: mark.span.start },
        atomId: null,
      });
    }
    segments.push({
      text: source.text.slice(mark.span.start, mark.span.end),
      span: mark.span,
      atomId: mark.atomId,
    });
    cursor = Math.max(cursor, mark.span.end);
  }
  if (cursor < source.text.length) {
    segments.push({
      text: source.text.slice(cursor),
      span: { start: cursor, end: source.text.length },
      atomId: null,
    });
  }
  return segments;
}

/** Atoms with no provenance: Health rule 2 violations. */
export function atomsWithoutProvenance(k: Knowledge): Atom[] {
  return k.atoms.filter((a) => !a.provenance);
}

/** Atoms with no relation at all. */
export function isolatedAtoms(k: Knowledge): Atom[] {
  const touched = new Set(k.relations.flatMap((r) => [r.from, r.to]));
  return k.atoms.filter((a) => !touched.has(a.id));
}
