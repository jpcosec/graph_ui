/**
 * The knowledge contract — the only thing that must be right.
 *
 * Three layers, deliberately distinct (DESIGN.md §1):
 *
 *   Source      raw text. Evidence. Never edited.
 *   Atom        a curated fact. THE only thing that is edited.
 *   Doc         a composition of atoms. Derived, disposable.
 *
 * Between Source and Atom there is one act: anchoring. Selecting a span of raw
 * text and saying "this is a fact". That is what carries provenance.
 *
 * This file is written against the mock, on purpose. Designing against
 * /document/ir produces an IR viewer instead of a knowledge surface.
 */
import { z } from 'zod';

/** A character span in a source document: [start, end). */
export const spanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  line: z.number().int().positive().optional(),
});
export type Span = z.infer<typeof spanSchema>;

/** Where a fact came from. Rule 2: no provenance, no knowledge. */
export const provenanceSchema = z.object({
  sourceId: z.string(),
  span: spanSchema,
});
export type Provenance = z.infer<typeof provenanceSchema>;

/** Raw material: an email, a transcript, a PDF. Immutable. */
export const sourceSchema = z.object({
  id: z.string(),
  path: z.string(),
  title: z.string(),
  text: z.string(),
  /** Spans already turned into atoms, for the highlight overlay. */
  anchored: z.array(z.object({ span: spanSchema, atomId: z.string() })).default([]),
});
export type Source = z.infer<typeof sourceSchema>;

/** A single fact. The center of the whole model: every path leads here. */
export const atomSchema = z.object({
  id: z.string(),
  title: z.string(),
  answer: z.string(),
  tags: z.array(z.string()).default([]),
  /** Optional so the Health view can report atoms that lack it. */
  provenance: provenanceSchema.nullable().default(null),
});
export type Atom = z.infer<typeof atomSchema>;

/**
 * A typed edge between two atoms.
 *
 * Mirrors RelationDoc: a relation is NOT a hidden field inside content, it is
 * its own document — which is why it carries its own `motive`.
 */
export const relationSchema = z.object({
  id: z.string(),
  type: z.enum(['grounded_by', 'flows_to', 'constrains', 'refines', 'contradicts']),
  from: z.string(),
  to: z.string(),
  motive: z.string().default(''),
});
export type Relation = z.infer<typeof relationSchema>;
export type RelationType = Relation['type'];

/**
 * How a section decides what to show. The central design decision.
 *
 *   list   — I pick the facts. Stays put.
 *   query  — the system picks. Grows on its own, so the doc does not age.
 */
export const bindingSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('list'), atomIds: z.array(z.string()) }),
  z.object({
    kind: z.literal('query'),
    tags: z.array(z.string()).default([]),
    relatedTo: z.string().nullable().default(null),
  }),
]);
export type Binding = z.infer<typeof bindingSchema>;

export const sectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  binding: bindingSchema,
});
export type Section = z.infer<typeof sectionSchema>;

/** A document declares what to show. It does not contain text. */
export const docSchema = z.object({
  id: z.string(),
  title: z.string(),
  sections: z.array(sectionSchema),
});
export type Doc = z.infer<typeof docSchema>;

/** Something written down before knowing where it belongs. */
export const draftSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
});
export type Draft = z.infer<typeof draftSchema>;

export const knowledgeSchema = z.object({
  sources: z.array(sourceSchema),
  atoms: z.array(atomSchema),
  relations: z.array(relationSchema),
  docs: z.array(docSchema),
  drafts: z.array(draftSchema),
});
export type Knowledge = z.infer<typeof knowledgeSchema>;

export const RELATION_LABEL: Record<RelationType, string> = {
  grounded_by: 'se funda en',
  flows_to: 'fluye hacia',
  constrains: 'restringe',
  refines: 'refina',
  contradicts: 'contradice',
};
