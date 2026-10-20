/**
 * Projection views on the graph_ui server (`/api/views*`, frontends/mindmap/views_routes.py).
 * A view is a `ViewDoc` of the store (model in spec2viz); the server evaluates it with
 * sldb.api.graph, so the UI never filters store data itself. `store` points the same view at
 * another `.sldb` (empty: the server's store).
 */

export interface ViewNodeFilter {
  model: string;
  where: string;
}

export type ViewDirection = 'both' | 'outgoing' | 'incoming';

export interface ViewLayout {
  kind?: string;
  style?: 'layered' | 'rings';
  direction?: string;
  ring_field?: string;
  [key: string]: unknown;
}

export interface ProjectionViewDoc {
  title?: string;
  nodes: ViewNodeFilter[];
  relations: string[];
  direction: ViewDirection;
  notation?: string;
  layout?: ViewLayout;
  description?: string;
}

export interface EvaluatedNode {
  id: string;
  model: string;
  name: string;
  title: string;
  payload: Record<string, unknown>;
}

export interface EvaluatedEdge {
  source: string;
  target: string;
  relation_type: string;
}

/** A colour per theme, as spec2viz resolves it (a literal hex is the same on both sides). */
export interface Themed {
  light?: string;
  dark?: string;
}

export interface NotationStyle {
  fill?: Themed;
  stroke?: Themed;
  icon?: string;
  source?: unknown;
}

/** How the view's notation draws one node (spec2viz `resolve_documents`, contract §13). */
export interface NodeNotation {
  glyph: string;
  shape: string;
  function?: string;
  keyword?: string;
  label?: string;
  style: NotationStyle;
}

/** How it draws one edge: its LinkDoc's line, colour and arrowhead. */
export interface EdgeNotation {
  link: string;
  draw?: string;
  line?: 'solid' | 'dashed' | 'dotted' | string;
  color?: Themed | null;
  source_end?: string;
  target_end?: string;
  label?: string;
}

export interface NotationLegend {
  glyphs: { glyph: string; title: string; shape: string; function?: string; style: NotationStyle }[];
  links: { link: string; title: string; relation?: string; line?: string; color?: Themed | null }[];
  kinds: { kind: string; style: NotationStyle }[];
}

/** The view's notation applied by the server; `error` when it could not be (spec2viz missing, bad notation). */
export interface ViewNotation {
  error?: string;
  notation?: string;
  palette?: string;
  ink?: Themed | null;
  nodes?: Record<string, NodeNotation>;
  edges?: (EdgeNotation | null)[];
  legend?: NotationLegend;
  skipped?: string[];
}

export interface EvaluatedView {
  ok: true;
  store: string;
  view: ProjectionViewDoc;
  nodes: EvaluatedNode[];
  edges: EvaluatedEdge[];
  layout: ViewLayout;
  notation?: ViewNotation;
}

export interface StoredView {
  ref: string;
  payload: ProjectionViewDoc & { name: string };
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error ?? `${input} answered ${response.status}`);
  }
  return body as T;
}

function post<T>(route: string, body: unknown): Promise<T> {
  return requestJson<T>(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}

export const viewsProvider = {
  async list(store = ''): Promise<StoredView[]> {
    const query = store ? `?store=${encodeURIComponent(store)}` : '';
    return (await requestJson<{ views: StoredView[] }>(`/api/views${query}`)).views;
  },
  evaluate(view: ProjectionViewDoc | string, store = ''): Promise<EvaluatedView> {
    return post<EvaluatedView>('/api/views/evaluate', store ? { view, store } : { view });
  },
  save(name: string, view: ProjectionViewDoc, store = ''): Promise<{ ok: true; ref: string; view: ProjectionViewDoc }> {
    return post('/api/views/save', store ? { name, view, store } : { name, view });
  },
};
