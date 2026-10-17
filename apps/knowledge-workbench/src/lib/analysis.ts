/**
 * Analysis over the knowledge graph.
 *
 * Similarity here is honest token overlap (Jaccard), not embeddings. The real
 * thing lives in sldb's networkx layer; this mock only needs to prove the
 * interaction — duplicate detection in the Reader, suggestions in the Inbox.
 */
import type { Atom, Knowledge } from '@/schema/knowledge';
import { resolveBinding } from './queries';

const STOP = new Set([
  'el','la','los','las','de','del','y','o','a','en','que','no','se','un','una','es','por','con',
  'para','al','lo','su','sus','como','mas','pero','the','of','to','and','in','is','it','be','on',
]);

export function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/)
      // 3 letters is the floor on purpose: SAP, API, IVA, OC are the words that
      // carry the most meaning in this domain.
      .filter((t) => t.length >= 3 && !STOP.has(t)),
  );
}

function shared(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

/**
 * Jaccard: symmetric. For comparing two things of comparable length — which is
 * what duplicate detection between atoms needs.
 */
export function similarity(a: string, b: string): number {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (!ta.size || !tb.size) return 0;
  const n = shared(ta, tb);
  return n / (ta.size + tb.size - n);
}

/**
 * Overlap coefficient: asymmetric. "How much of the shorter one is contained in
 * the longer one".
 *
 * Jaccard is wrong for a short quote against a long atom: the atom's own length
 * drives the score to zero even on a perfect quote. That is the measure to use
 * whenever a selection or a note is matched against curated content.
 */
export function containment(needle: string, haystack: string): number {
  const tn = tokenize(needle);
  const th = tokenize(haystack);
  if (!tn.size || !th.size) return 0;
  return shared(tn, th) / Math.min(tn.size, th.size);
}

export interface Similar {
  atom: Atom;
  score: number;
}

/** Atoms resembling a piece of text, best first. */
export function similarAtoms(k: Knowledge, text: string, exclude?: string, min = 0.3): Similar[] {
  return k.atoms
    .filter((a) => a.id !== exclude)
    .map((atom) => ({ atom, score: containment(text, `${atom.title} ${atom.answer}`) }))
    .filter((s) => s.score >= min)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export interface Home {
  docId: string;
  docTitle: string;
  sectionId: string;
  heading: string;
  score: number;
}

/**
 * Where a loose note would belong: the section whose current content resembles
 * it most. Neighbourhood, not magic.
 */
export function suggestHomes(k: Knowledge, text: string, max = 2): Home[] {
  const homes: Home[] = [];
  for (const doc of k.docs) {
    for (const section of doc.sections) {
      const atoms = resolveBinding(k, section.binding);
      const corpus = [section.heading, ...atoms.map((a) => `${a.title} ${a.answer}`)].join(' ');
      homes.push({
        docId: doc.id,
        docTitle: doc.title,
        sectionId: section.id,
        heading: section.heading,
        score: containment(text, corpus),
      });
    }
  }
  return homes.filter((h) => h.score > 0).sort((a, b) => b.score - a.score).slice(0, max);
}

/** Relation cycles: circular reasoning. */
export function findCycles(k: Knowledge): string[][] {
  const adj = new Map<string, string[]>();
  for (const r of k.relations) adj.set(r.from, [...(adj.get(r.from) ?? []), r.to]);

  const cycles: string[][] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  const onStack = new Set<string>();

  const walk = (node: string) => {
    seen.add(node);
    stack.push(node);
    onStack.add(node);
    for (const next of adj.get(node) ?? []) {
      if (onStack.has(next)) cycles.push([...stack.slice(stack.indexOf(next)), next]);
      else if (!seen.has(next)) walk(next);
    }
    stack.pop();
    onStack.delete(node);
  };

  for (const atom of k.atoms) if (!seen.has(atom.id)) walk(atom.id);
  return cycles;
}

/** Atoms no document shows. Not necessarily wrong — but worth knowing. */
export function unusedAtoms(k: Knowledge): Atom[] {
  const shown = new Set<string>();
  for (const doc of k.docs) {
    for (const section of doc.sections) {
      for (const atom of resolveBinding(k, section.binding)) shown.add(atom.id);
    }
  }
  return k.atoms.filter((a) => !shown.has(a.id));
}

/** Near-duplicate pairs: the same fact written twice. */
export function duplicatePairs(k: Knowledge, min = 0.3): { a: Atom; b: Atom; score: number }[] {
  const out: { a: Atom; b: Atom; score: number }[] = [];
  for (let i = 0; i < k.atoms.length; i += 1) {
    for (let j = i + 1; j < k.atoms.length; j += 1) {
      const a = k.atoms[i];
      const b = k.atoms[j];
      const score = similarity(`${a.title} ${a.answer}`, `${b.title} ${b.answer}`);
      if (score >= min) out.push({ a, b, score });
    }
  }
  return out.sort((x, y) => y.score - x.score);
}
