// Panel lateral de workers vivos (chrome del shell, no una vista): consulta
// GET /api/workers cada POLL_MS, agrupa por space (shared/workers.mjs) y pinta
// pane/kind/name/status/cwd de cada worker. Solo lectura, sin botones.
// Nunca rompe el resto de la UI: cualquier fallo de red o del endpoint se
// muestra dentro del panel y el polling sigue reintentando.
import {useState, useEffect} from 'react';
import {html} from '../shared/html.js';
import {request} from './api.js';
import {basename, groupBySpace, normalizeStatus, statusLabel} from '../shared/workers.mjs';

const POLL_MS = 2500;

const STATUS_CLASS = {
  working: 'is-working',
  idle: 'is-idle',
  done: 'is-done',
  blocked: 'is-blocked',
  unknown: 'is-unknown',
};

function transportError(error) {
  const body = error && error.body;
  return (body && body.error) || (error && error.message) || 'No se pudo consultar /api/workers';
}

function badge(status) {
  const normalized = normalizeStatus(status);
  return html`<span className=${'workers-status ' + STATUS_CLASS[normalized]} title="status: ${status || normalized}">${statusLabel(status)}</span>`;
}

function workerRow(w) {
  if (!w || typeof w !== 'object') return null;
  const name = w.name ? html`<span className="workers-name" title=${String(w.name)}>${w.name}</span>` : '';
  const kind = w.kind ? html`<span className="workers-kind" title="kind: ${String(w.kind)}">${w.kind}</span>` : '';
  return html`<li className="workers-item" key=${w.pane || w.seq}>
    <div className="workers-item-line"><span className="workers-pane" title=${w.title || w.pane}>${w.pane}</span>${badge(w.status)}</div>
    <div className="workers-item-meta">${name}${kind}<span className="workers-cwd" title=${w.cwd ? 'cwd: ' + w.cwd : undefined}>${basename(w.cwd)}</span></div>
  </li>`;
}

function workersList(groups) {
  return html`${groups.map(g => html`<section className="workers-space" key=${g.workspace || g.label}>
    <h3 className="workers-space-head"><span className="workers-space-label" title=${g.workspace || g.label}>${g.label}</span>${g.number != null ? html`<span className="workers-space-num" title="número de space">${g.number}</span>` : ''}${g.status ? badge(g.status) : ''}</h3>
    <ul className="workers-list">${g.workers.map(workerRow)}</ul>
  </section>`)}`;
}

export function WorkersPanel() {
  const [state, setState] = useState({phase: 'loading', error: null, payload: null});

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const tick = async () => {
      try {
        const payload = await request('/api/workers');
        if (!cancelled) setState({phase: 'ok', payload, error: null});
      } catch (error) {
        if (!cancelled) setState({phase: 'error', payload: null, error: transportError(error)});
      } finally {
        if (!cancelled) timer = setTimeout(tick, POLL_MS);
      }
    };
    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const error = state.error || (state.payload && state.payload.error);
  let body;
  if (state.phase === 'loading') {
    body = html`<p className="workers-empty">Consultando…</p>`;
  } else {
    const groups = state.payload ? groupBySpace(state.payload) : [];
    const sections = error
      ? html`<p className="workers-error" role="alert">${error}</p>${groups.length ? workersList(groups) : ''}`
      : groups.length ? workersList(groups) : html`<p className="workers-empty">Sin workers activos.</p>`;
    body = sections;
  }

  return html`<aside className="workers-panel" aria-label="Workers vivos">
    <header className="workers-panel-head"><span>Workers</span></header>
    <div className="workers-body">${body}</div>
  </aside>`;
}