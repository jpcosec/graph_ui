import {
  DEFAULT_ENCODING_RULES,
  type EncodingRule,
} from '@/features/graph-editor/L2-canvas/encoding/encoding-rules';
import { DEFAULT_LAYOUT_STRATEGY_NAME } from '@/features/graph-editor/L2-canvas/layout/layout-strategies';

export interface ProjectionView {
  view_id: string;
  label: string;
  encoding: EncodingRule[];
  layout_strategy: string;
  created_by?: string;
  created_at?: string;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const STORAGE_KEY = 'graph-ui:projection-views';
const DEFAULT_VIEW_ID = 'default-view';
const NODE_ID_PATTERN = /^(?:node|n)-[a-z0-9][a-z0-9._-]*$/i;

function cloneEncodingRules(rules: EncodingRule[]): EncodingRule[] {
  return rules.map((rule) => ({
    when: { ...rule.when },
    style: { ...rule.style },
  }));
}

function createDefaultView(): ProjectionView {
  return {
    view_id: DEFAULT_VIEW_ID,
    label: 'Default View',
    encoding: cloneEncodingRules(DEFAULT_ENCODING_RULES),
    layout_strategy: DEFAULT_LAYOUT_STRATEGY_NAME,
    created_by: 'system',
    created_at: '1970-01-01T00:00:00.000Z',
  };
}

function createMemoryStorage(): StorageLike {
  const state = new Map<string, string>();
  return {
    getItem(key) {
      return state.get(key) ?? null;
    },
    setItem(key, value) {
      state.set(key, value);
    },
    removeItem(key) {
      state.delete(key);
    },
  };
}

const fallbackStorage = createMemoryStorage();

function resolveStorage(): StorageLike {
  if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
    return globalThis.localStorage;
  }

  return fallbackStorage;
}

function readStoredViews(storage: StorageLike): ProjectionView[] {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ProjectionView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredViews(storage: StorageLike, views: ProjectionView[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(views));
}

function readRuleReferences(rule: EncodingRule): string[] {
  const refs = [rule.when.relationType, rule.when.nodeFacet, rule.when.facetValue]
    .filter((value): value is string => typeof value === 'string')
    .filter((value) => NODE_ID_PATTERN.test(value));

  return refs;
}

export function findLiteralNodeIdReferences(view: ProjectionView): string[] {
  return view.encoding.flatMap((rule) => readRuleReferences(rule));
}

export function createProjectionViewStore(storage: StorageLike = resolveStorage()): ProjectionViewStore {
  return new ProjectionViewStore(storage);
}

export class ProjectionViewStore {
  constructor(private readonly storage: StorageLike = resolveStorage()) {}

  private ensureSeeded(): ProjectionView[] {
    const storedViews = readStoredViews(this.storage);
    if (storedViews.some((view) => view.view_id === DEFAULT_VIEW_ID)) {
      return storedViews;
    }

    const seededViews = [createDefaultView(), ...storedViews];
    writeStoredViews(this.storage, seededViews);
    return seededViews;
  }

  load(view_id: string): ProjectionView | null {
    return this.ensureSeeded().find((view) => view.view_id === view_id) ?? null;
  }

  save(view: ProjectionView): ProjectionView {
    const literalReferences = findLiteralNodeIdReferences(view);
    if (literalReferences.length > 0) {
      console.warn(
        `Projection view ${view.view_id} contains literal node id references: ${literalReferences.join(', ')}`,
      );
      throw new Error('Projection views must not reference literal node IDs in encoding rules.');
    }

    const nextView: ProjectionView = {
      ...view,
      encoding: cloneEncodingRules(view.encoding),
      created_at: view.created_at ?? new Date().toISOString(),
    };

    const views = this.ensureSeeded();
    const existingIndex = views.findIndex((storedView) => storedView.view_id === nextView.view_id);
    const nextViews = [...views];

    if (existingIndex >= 0) {
      nextViews[existingIndex] = nextView;
    } else {
      nextViews.push(nextView);
    }

    writeStoredViews(this.storage, nextViews);
    return nextView;
  }

  list(): ProjectionView[] {
    return this.ensureSeeded().map((view) => ({
      ...view,
      encoding: cloneEncodingRules(view.encoding),
    }));
  }

  delete(view_id: string): void {
    if (view_id === DEFAULT_VIEW_ID) {
      return;
    }

    const nextViews = this.ensureSeeded().filter((view) => view.view_id !== view_id);
    writeStoredViews(this.storage, nextViews);
  }
}

export const projectionViewStore = createProjectionViewStore();
export { DEFAULT_VIEW_ID, STORAGE_KEY as PROJECTION_VIEW_STORAGE_KEY, NODE_ID_PATTERN as PROJECTION_VIEW_NODE_ID_PATTERN };
