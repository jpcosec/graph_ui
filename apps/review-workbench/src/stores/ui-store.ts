import { create } from 'zustand';

import { DEFAULT_ENCODING_RULES, type EncodingRule } from '@/features/graph-editor/L2-canvas/encoding/encoding-rules';
import { DEFAULT_LAYOUT_STRATEGY_NAME } from '@/features/graph-editor/L2-canvas/layout/layout-strategies';

export type EditorState = 'browse' | 'focus' | 'edit_node' | 'edit_relation';

export interface FilterState {
  hiddenRelationTypes: string[];
  filterText: string;
  attributeFilter: { key: string; value: string } | null;
  hideNonNeighbors: boolean;
}

export interface DeleteTarget {
  kind: "node" | "edge";
  title: string;
  description: string;
}

export interface UIStore {
  editorState: EditorState;
  focusedNodeId: string | null;
  focusedEdgeId: string | null;
  selectedNode: string | null;
  selectedEdge: string | null;
  sidebarOpen: boolean;
  filters: FilterState;
  activeEncodingRules: EncodingRule[];
  activeLayoutStrategy: string;
  activeViewId: string | null;
  copiedNodeId: string | null;
  copiedNodeData: unknown;
  deleteConfirmOpen: boolean;
  deleteTarget: DeleteTarget | null;
  pendingDeleteNodeIds: string[];
  pendingDeleteEdgeIds: string[];
  commandDialogOpen: boolean;

  setEditorState: (state: EditorState) => void;
  setFocusedNode: (id: string | null) => void;
  setFocusedEdge: (id: string | null) => void;
  toggleSidebar: () => void;
  setFilter: (patch: Partial<FilterState>) => void;
  clearFilters: () => void;
  setActiveEncodingRules: (rules: EncodingRule[]) => void;
  resetActiveEncodingRules: () => void;
  setActiveLayoutStrategy: (layoutStrategy: string) => void;
  setActiveViewId: (viewId: string | null) => void;
  copyNode: (id: string, data?: unknown) => void;
  openDeleteConfirm: (target: DeleteTarget, nodeIds?: string[], edgeIds?: string[]) => void;
  closeDeleteConfirm: () => void;
  executePendingDelete: (removeElements: (nodeIds: string[], edgeIds: string[]) => void) => void;
  openCommandDialog: () => void;
  closeCommandDialog: () => void;
}

const defaultFilters: FilterState = {
  hiddenRelationTypes: [],
  filterText: '',
  attributeFilter: null,
  hideNonNeighbors: true,
};

function cloneEncodingRules(rules: EncodingRule[]): EncodingRule[] {
  return rules.map((rule) => ({
    when: { ...rule.when },
    style: { ...rule.style },
  }));
}

export const useUIStore = create<UIStore>((set) => ({
  editorState: 'browse',
  focusedNodeId: null,
  focusedEdgeId: null,
  selectedNode: null,
  selectedEdge: null,
  sidebarOpen: true,
  filters: defaultFilters,
  activeEncodingRules: cloneEncodingRules(DEFAULT_ENCODING_RULES),
  activeLayoutStrategy: DEFAULT_LAYOUT_STRATEGY_NAME,
  activeViewId: 'default-view',
  copiedNodeId: null,
  copiedNodeData: null,
  deleteConfirmOpen: false,
  deleteTarget: null,
  pendingDeleteNodeIds: [],
  pendingDeleteEdgeIds: [],
  commandDialogOpen: false,

  setEditorState: (editorState) => set({ editorState }),
  setFocusedNode: (focusedNodeId) => set({ focusedNodeId }),
  setFocusedEdge: (focusedEdgeId) => set({ focusedEdgeId }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setFilter: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    })),
  clearFilters: () => set({ filters: defaultFilters }),
  setActiveEncodingRules: (activeEncodingRules) => set({ activeEncodingRules: cloneEncodingRules(activeEncodingRules) }),
  resetActiveEncodingRules: () => set({ activeEncodingRules: cloneEncodingRules(DEFAULT_ENCODING_RULES), activeViewId: 'default-view' }),
  setActiveLayoutStrategy: (activeLayoutStrategy) => set({ activeLayoutStrategy }),
  setActiveViewId: (activeViewId) => set({ activeViewId }),
  copyNode: (copiedNodeId, copiedNodeData) => set({ copiedNodeId, copiedNodeData }),
  openDeleteConfirm: (target, nodeIds = [], edgeIds = []) => 
    set({ 
      deleteConfirmOpen: true, 
      deleteTarget: target,
      pendingDeleteNodeIds: nodeIds,
      pendingDeleteEdgeIds: edgeIds,
    }),
  closeDeleteConfirm: () => 
    set({ 
      deleteConfirmOpen: false, 
      deleteTarget: null,
      pendingDeleteNodeIds: [],
      pendingDeleteEdgeIds: [],
    }),
  executePendingDelete: (removeElements) => 
    set((state) => {
      const nodeIds = state.pendingDeleteNodeIds;
      const edgeIds = state.pendingDeleteEdgeIds;
      removeElements(nodeIds, edgeIds);
      return {
        deleteConfirmOpen: false,
        deleteTarget: null,
        pendingDeleteNodeIds: [],
        pendingDeleteEdgeIds: [],
      };
    }),
  openCommandDialog: () => set({ commandDialogOpen: true }),
  closeCommandDialog: () => set({ commandDialogOpen: false }),
}));
