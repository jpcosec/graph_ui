import { create } from 'zustand';

import type { ProjectionViewDoc, ViewDirection, ViewNodeFilter, ViewNotation } from '@/features/graph-editor/lib/views-provider';

/** The projection view being edited in the sidebar: what the next evaluation or save sends. */
export interface ViewStore {
  draft: ProjectionViewDoc;
  activeRef: string | null;
  storePath: string;
  /** The notation of the last applied view (legend, palette, error), or null without one. */
  notation: ViewNotation | null;
  setNotation: (notation: ViewNotation | null) => void;
  setDraft: (draft: ProjectionViewDoc, activeRef?: string | null) => void;
  setNodeFilters: (nodes: ViewNodeFilter[]) => void;
  setRelations: (relations: string[]) => void;
  setDirection: (direction: ViewDirection) => void;
  setStorePath: (storePath: string) => void;
}

export const EMPTY_VIEW: ProjectionViewDoc = { nodes: [], relations: [], direction: 'both' };

export const useViewStore = create<ViewStore>((set) => ({
  draft: EMPTY_VIEW,
  activeRef: null,
  storePath: '',
  notation: null,
  setNotation: (notation) => set({ notation }),
  setDraft: (draft, activeRef = null) => set({ draft, activeRef }),
  setNodeFilters: (nodes) => set((state) => ({ draft: { ...state.draft, nodes } })),
  setRelations: (relations) => set((state) => ({ draft: { ...state.draft, relations } })),
  setDirection: (direction) => set((state) => ({ draft: { ...state.draft, direction } })),
  setStorePath: (storePath) => set({ storePath }),
}));
