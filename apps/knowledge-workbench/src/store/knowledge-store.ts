/**
 * The one mutable place. Rule: only atoms and relations are edited.
 *
 * Documents are never written to — they declare bindings. Sources are evidence
 * and never change.
 */
import { create } from 'zustand';
import { loadKnowledge } from '@/mock/client';
import type { Binding, Knowledge, Relation, Span } from '@/schema/knowledge';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export type ViewName = 'atom' | 'reader' | 'composer' | 'inbox' | 'health';
export type DataSource = 'mock' | 'sldb';

interface KnowledgeState {
  data: Knowledge;
  view: ViewName;
  source: DataSource;
  loading: boolean;
  loadError: string | null;
  selectedAtomId: string | null;
  selectedSourceId: string | null;
  selectedDocId: string | null;

  openAtom: (id: string) => void;
  openReader: (sourceId: string) => void;
  setView: (view: ViewName) => void;
  /** Swap between the fixture and a live sldb serve. */
  useSource: (source: DataSource) => Promise<void>;

  /** The only real edit in the system. */
  updateAtom: (id: string, patch: { title?: string; answer?: string; tags?: string[] }) => void;
  updateRelationMotive: (relationId: string, motive: string) => void;
  addRelation: (relation: Relation) => void;

  /** Reader: a span of raw text becomes a fact, carrying its provenance. */
  anchorSelection: (input: {
    sourceId: string;
    span: Span;
    title: string;
    answer: string;
    tags: string[];
  }) => string;

  /** Composer: sections declare what to show; they never hold text. */
  selectDoc: (docId: string) => void;
  setBinding: (docId: string, sectionId: string, binding: Binding) => void;
  removeFromSection: (docId: string, sectionId: string, atomId: string) => void;
  moveInSection: (docId: string, sectionId: string, from: number, to: number) => void;

  /** Inbox: loose notes. */
  addDraft: (text: string) => void;
  discardDraft: (draftId: string) => void;
  promoteDraft: (draftId: string, target?: { docId: string; sectionId: string }) => void;
}

const initial = loadKnowledge();

export const useKnowledge = create<KnowledgeState>((set, getState) => ({
  data: initial,
  view: 'reader',
  source: 'mock',
  loading: false,
  loadError: null,
  selectedAtomId: initial.atoms[0]?.id ?? null,
  selectedSourceId: initial.sources[0]?.id ?? null,
  selectedDocId: initial.docs[0]?.id ?? null,

  openAtom: (id) => set({ selectedAtomId: id, view: 'atom' }),
  openReader: (sourceId) => set({ selectedSourceId: sourceId, view: 'reader' }),
  setView: (view) => set({ view }),

  useSource: async (source) => {
    if (source === getState().source && !getState().loadError) return;
    if (source === 'mock') {
      const data = loadKnowledge();
      set({
        source,
        data,
        loading: false,
        loadError: null,
        selectedAtomId: data.atoms[0]?.id ?? null,
        selectedSourceId: data.sources[0]?.id ?? null,
        selectedDocId: data.docs[0]?.id ?? null,
      });
      return;
    }
    set({ loading: true, loadError: null });
    try {
      const { loadFromSldb } = await import('@/api/sldb');
      const data = await loadFromSldb(60);
      set({
        source,
        data,
        loading: false,
        selectedAtomId: data.atoms[0]?.id ?? null,
        selectedSourceId: null,
        selectedDocId: null,
        view: 'atom',
      });
    } catch (e) {
      set({ loading: false, loadError: (e as Error).message });
    }
  },

  updateAtom: (id, patch) =>
    set((s) => ({
      data: { ...s.data, atoms: s.data.atoms.map((a) => (a.id === id ? { ...a, ...patch } : a)) },
    })),

  updateRelationMotive: (relationId, motive) =>
    set((s) => ({
      data: {
        ...s.data,
        relations: s.data.relations.map((r) => (r.id === relationId ? { ...r, motive } : r)),
      },
    })),

  addRelation: (relation) =>
    set((s) => ({ data: { ...s.data, relations: [...s.data.relations, relation] } })),

  anchorSelection: ({ sourceId, span, title, answer, tags }) => {
    const id = `atom-${slugify(title)}`;
    set((s) => ({
      data: {
        ...s.data,
        atoms: [...s.data.atoms, { id, title, answer, tags, provenance: { sourceId, span } }],
        sources: s.data.sources.map((src) =>
          src.id === sourceId
            ? { ...src, anchored: [...src.anchored, { span, atomId: id }].sort((a, b) => a.span.start - b.span.start) }
            : src,
        ),
      },
    }));
    return id;
  },

  selectDoc: (docId) => set({ selectedDocId: docId, view: 'composer' }),

  setBinding: (docId, sectionId, binding) =>
    set((s) => ({
      data: {
        ...s.data,
        docs: s.data.docs.map((d) =>
          d.id === docId
            ? { ...d, sections: d.sections.map((sec) => (sec.id === sectionId ? { ...sec, binding } : sec)) }
            : d,
        ),
      },
    })),

  // Removing from a section does NOT delete the fact. That distinction is why
  // people dare to tidy up.
  removeFromSection: (docId, sectionId, atomId) =>
    set((s) => ({
      data: {
        ...s.data,
        docs: s.data.docs.map((d) =>
          d.id !== docId
            ? d
            : {
                ...d,
                sections: d.sections.map((sec) =>
                  sec.id === sectionId && sec.binding.kind === 'list'
                    ? { ...sec, binding: { ...sec.binding, atomIds: sec.binding.atomIds.filter((a) => a !== atomId) } }
                    : sec,
                ),
              },
        ),
      },
    })),

  moveInSection: (docId, sectionId, from, to) =>
    set((s) => ({
      data: {
        ...s.data,
        docs: s.data.docs.map((d) =>
          d.id !== docId
            ? d
            : {
                ...d,
                sections: d.sections.map((sec) => {
                  if (sec.id !== sectionId || sec.binding.kind !== 'list') return sec;
                  const ids = [...sec.binding.atomIds];
                  if (to < 0 || to >= ids.length) return sec;
                  const [moved] = ids.splice(from, 1);
                  ids.splice(to, 0, moved);
                  return { ...sec, binding: { ...sec.binding, atomIds: ids } };
                }),
              },
        ),
      },
    })),

  addDraft: (text) =>
    set((s) => ({
      data: {
        ...s.data,
        drafts: [{ id: `draft-${Date.now()}`, text, createdAt: new Date().toISOString() }, ...s.data.drafts],
      },
    })),

  discardDraft: (draftId) =>
    set((s) => ({ data: { ...s.data, drafts: s.data.drafts.filter((d) => d.id !== draftId) } })),

  promoteDraft: (draftId, target) =>
    set((s) => {
      const draft = s.data.drafts.find((d) => d.id === draftId);
      if (!draft) return s;
      const title = draft.text.length > 60 ? `${draft.text.slice(0, 57)}…` : draft.text;
      const id = `atom-${slugify(title)}`;
      // A promoted draft has no provenance yet: it was typed, not anchored.
      // Health reports it, which is the point.
      const atoms = [...s.data.atoms, { id, title, answer: draft.text, tags: [], provenance: null }];
      const docs = target
        ? s.data.docs.map((d) =>
            d.id !== target.docId
              ? d
              : {
                  ...d,
                  sections: d.sections.map((sec) =>
                    sec.id === target.sectionId && sec.binding.kind === 'list'
                      ? { ...sec, binding: { ...sec.binding, atomIds: [...sec.binding.atomIds, id] } }
                      : sec,
                  ),
                },
          )
        : s.data.docs;
      return {
        data: { ...s.data, atoms, docs, drafts: s.data.drafts.filter((d) => d.id !== draftId) },
        selectedAtomId: id,
      };
    }),
}));
