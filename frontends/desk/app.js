// deskops UI shell (core): state, DOM helpers, loading, chrome, routing and the shared
// confirm/advance flow. Every value drawn comes from `deskops view` (served at /api/view/*).
// An element without a real source is not drawn; a failing view shows its cause.
// Screens live in board.js, task.js, drawer.js, inbox.js and agents.js; main.js starts it.
'use strict';

const INSPECT_BASE = 'http://127.0.0.1:8090/';
const DISABLED_ACTIONS = [
  ['Iniciar ejecución', 'Llega con runtime dispatch (fábrica E3).'],
  ['Promover a atom', 'Requiere operación de graduación (no existe).'],
  ['Diferir a drawer', 'No hay operación de deskops para diferir una tarea al drawer.'],
];
const SCREENS = { board: 'Board', task: 'Tarea', drawer: 'Drawer', inbox: 'Inbox', agents: 'Agentes' };
const NAV_SCREEN = { task: 'board' };
const EVIDENCE_LABELS = {
  tests: 'tests',
  commit: 'commit',
  atom_or_materialization_link: 'atom|materialization',
  document: 'document',
  external: 'external',
  unknown: 'tipo desconocido',
};
const STATE_LABELS = { holds: 'cumple', pending: 'pendiente', failing: 'falla' };

const state = {
  desk: new URLSearchParams(location.search).get('desk') || '',
  desks: null,
  views: {},
  failures: {},
  selected: null,
  task: null,
  taskError: null,
  action: null,
  goalOpen: false,
  drawerSelected: null,
  inboxSelected: null,
  inboxAction: null,
};

// ------------------------------------------------------------------ dom helpers
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

function svg(kind, cls) {
  const ns = 'http://www.w3.org/2000/svg';
  const el = document.createElementNS(ns, 'svg');
  el.setAttribute('viewBox', '0 0 16 16');
  el.setAttribute('class', cls || 'mark');
  el.setAttribute('aria-hidden', 'true');
  const paths = {
    holds: ['circle:8,8,6', 'path:M5 8.2l2 2 4-4.2'],
    pending: ['circle:8,8,6', 'path:M8 5v3.2l2 1.3'],
    failing: ['circle:8,8,6', 'path:M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4'],
    lock: ['path:M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7', 'path:M3.5 7h9v6.5h-9z'],
    warn: ['path:M8 2.5l6 11H2z', 'path:M8 6.5v3.2M8 11.6v.2'],
    file: ['path:M4 1.8h5l3 3v9.4H4z', 'path:M9 1.8v3h3'],
  }[kind] || [];
  for (const spec of paths) {
    const [name, value] = spec.split(':');
    const child = document.createElementNS(ns, name);
    if (name === 'circle') {
      const [cx, cy, r] = value.split(',');
      child.setAttribute('cx', cx); child.setAttribute('cy', cy); child.setAttribute('r', r);
    } else child.setAttribute('d', value);
    el.append(child);
  }
  return el;
}

// Inline markdown-lite: `code` and **bold**, as text nodes (never innerHTML).
function inline(text) {
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  for (const match of String(text).matchAll(re)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    parts.push(token.startsWith('`') ? h('code', {}, token.slice(1, -1)) : h('strong', {}, token.slice(2, -2)));
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// Block markdown-lite for TaskDoc sections and note bodies: paragraphs, lists, fences, headings.
function prose(text, cls) {
  const blocks = [];
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.trim().startsWith('```')) {
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) { body.push(lines[i]); i += 1; }
      i += 1;
      blocks.push(h('pre', { class: 'code-block' }, h('code', {}, body.join('\n'))));
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      blocks.push(h('h4', { class: 'prose-heading' }, inline(line.replace(/^#{1,6}\s+/, ''))));
      i += 1;
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i])) {
        items.push(h('li', {}, inline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''))));
        i += 1;
      }
      blocks.push(h(ordered ? 'ol' : 'ul', {}, items));
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^\s*([-*]|\d+\.)\s+/.test(lines[i]) && !lines[i].trim().startsWith('```') && !/^#{1,6}\s/.test(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push(h('p', {}, inline(para.join(' '))));
  }
  return h('div', { class: `prose ${cls || ''}` }, blocks);
}

const qs = (params) => {
  const search = new URLSearchParams();
  if (state.desk) search.set('desk', state.desk);
  for (const [key, value] of Object.entries(params || {})) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
};
const deskQuery = () => (state.desk ? `?desk=${encodeURIComponent(state.desk)}` : '');
const screenHref = (name, params) => {
  const tail = params ? `?${new URLSearchParams(params)}` : '';
  return `${deskQuery()}#/${name}${tail}`;
};
const inspectHref = (id) => `${INSPECT_BASE}?id=${encodeURIComponent(`TaskDoc:${id}`)}`;

async function getJSON(url) {
  let response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new Error(`Sin respuesta del servidor (${err.message}).`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Respuesta no JSON (${response.status}).`);
  }
  if (!response.ok || data.ok === false) {
    const message = typeof data.error === 'string' ? data.error : data.error?.message;
    throw new Error(message || `HTTP ${response.status}`);
  }
  return data;
}

async function postJSON(url, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return { status: 0, data: { ok: false, error: `Sin respuesta del servidor (${err.message}).` } };
  }
  let data;
  try {
    data = await response.json();
  } catch {
    data = { ok: false, error: `Respuesta no JSON (${response.status}).` };
  }
  return { status: response.status, data };
}

// ------------------------------------------------------------------ loading
async function loadDesks() {
  try {
    state.desks = await getJSON('/api/desks');
  } catch (err) {
    state.desks = { desks: [], default: null, errors: [{ reference: '/api/desks', cause: err.message }] };
  }
  if (!state.desk) state.desk = state.desks.default || '';
  const select = document.getElementById('desk-select');
  select.replaceChildren(...state.desks.desks.map((desk) => h('option', { value: desk.id, selected: desk.id === state.desk }, desk.id)));
  const current = state.desks.desks.find((desk) => desk.id === state.desk);
  document.getElementById('desk-path').textContent = current ? current.path : '';
}

async function loadViews() {
  const names = ['board', 'drawer', 'inbox', 'agents'];
  const results = await Promise.allSettled(names.map((name) => getJSON(`/api/view/${name}${qs()}`)));
  names.forEach((name, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      state.views[name] = result.value;
      delete state.failures[name];
    } else {
      delete state.views[name];
      state.failures[name] = result.reason.message;
    }
  });
}

async function loadTask() {
  if (!state.selected) {
    state.task = null;
    state.taskError = null;
    return;
  }
  try {
    state.task = await getJSON(`/api/view/task${qs({ id: state.selected })}`);
    state.taskError = null;
  } catch (err) {
    state.task = null;
    state.taskError = err.message;
  }
}

async function refresh() {
  await loadViews();
  await loadTask();
  render();
}

// ------------------------------------------------------------------ routing
function route() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name, query] = raw.split('?');
  return { screen: SCREENS[name] ? name : 'board', params: new URLSearchParams(query || '') };
}
const screen = () => route().screen;

async function onRoute() {
  const { screen: name, params } = route();
  if (name === 'task') {
    const id = params.get('id');
    if (id && id !== state.selected) {
      await select(id, { focusCard: false });
      return;
    }
  }
  render();
}

// ------------------------------------------------------------------ chrome
function renderChrome() {
  const current = NAV_SCREEN[screen()] || screen();
  for (const link of document.querySelectorAll('.nav-item[data-screen]')) {
    if (link.dataset.screen === current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.setAttribute('href', screenHref(link.dataset.screen));
  }
  const { board, drawer, inbox, agents } = state.views;
  const counts = {
    tasks: board ? board.counts.tasks : '',
    drawer: drawer ? drawer.count : '',
    inbox: inbox ? inbox.open : '',
    workers: agents && agents.live_workers !== null ? agents.live_workers : '',
  };
  for (const el of document.querySelectorAll('[data-count]')) el.textContent = counts[el.dataset.count];
  const chipDrawer = document.getElementById('chip-drawer');
  chipDrawer.hidden = !drawer;
  if (drawer) { chipDrawer.textContent = `Drawer ${drawer.count}`; chipDrawer.href = screenHref('drawer'); }
  const chipInbox = document.getElementById('chip-inbox');
  chipInbox.hidden = !inbox;
  if (inbox) { chipInbox.textContent = `Inbox ${inbox.open} sin reconocer`; chipInbox.href = screenHref('inbox'); }
  const inspect = document.getElementById('inspect-link');
  inspect.href = state.selected ? inspectHref(state.selected) : INSPECT_BASE;
}

function errorNotice(title, cause) {
  return h('div', { class: 'notice is-error', role: 'alert' }, h('strong', {}, title), ' ', cause);
}

function referenceNotice(errors, label) {
  if (!errors || !errors.length) return null;
  return h('details', { class: 'notice', 'data-testid': 'view-errors' },
    h('summary', {}, `${errors.length} ${errors.length === 1 ? 'referencia no resuelve' : 'referencias no resuelven'} en ${label}`),
    h('ul', {}, errors.map((item) => h('li', {}, h('code', {}, item.reference), item.task ? [' (', h('code', {}, item.task), ')'] : null, ': ', item.cause))));
}

function metric(label, value, testid, unavailable) {
  return h('div', { class: 'metric', 'data-testid': testid },
    h('span', { class: 'metric-label' }, label),
    h('span', { class: `metric-value${unavailable ? ' is-unavailable' : ''}` }, value));
}

function pageHead(title, lede, extra) {
  return h('div', { class: 'page-head' },
    h('div', {},
      h('div', { class: 'eyebrow' }, `${state.desk || 'desk'} / `, h('b', {}, title)),
      h('h1', {}, title),
      lede ? h('p', { class: 'lede' }, lede) : null),
    extra || null);
}

function section(title, note, ...body) {
  return h('section', { class: 'section' },
    h('div', { class: 'section-head' }, h('span', {}, title), note ? h('small', {}, note) : null), ...body);
}

function foldList(items, shown = 2) {
  if (!items.length) return null;
  if (items.length <= shown + 1) return h('ul', {}, items);
  return [h('ul', {}, items.slice(0, shown)),
    h('details', { class: 'more' }, h('summary', {}, `${items.length - shown} más`), h('ul', {}, items.slice(shown)))];
}

// ------------------------------------------------------------------ confirm dialog
function confirmAction({ title, body, okLabel, onOk }) {
  const dialog = document.getElementById('confirm');
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').replaceChildren(...[body].flat());
  document.getElementById('confirm-ok').textContent = okLabel;
  dialog.returnValue = '';
  dialog.onclose = () => {
    if (dialog.returnValue === 'ok') onOk();
  };
  dialog.showModal();
  document.getElementById('confirm-ok').focus();
}

// ------------------------------------------------------------------ advance (Board and Task page)
function holdingGate(task) {
  return task.gates.find((gate) => gate.holds) || null;
}

function advanceBlockReason(task) {
  const gate = holdingGate(task);
  if (!task.on_board) return 'La tarea no está en el Board; no se avanza desde aquí.';
  if (!task.gates.length) return 'No hay transición que salga de este nodo.';
  if (!gate) return `Ningún gate se cumple: ${task.gates.map((g) => g.condition || g.relation_type).join('; ')}`;
  return null;
}

function advanceButton(view, cls) {
  const task = view.task;
  const gate = holdingGate(task);
  const reason = advanceBlockReason(task);
  return h('button', {
    type: 'button', class: `btn btn-primary ${cls || ''}`, id: 'advance', disabled: reason ? true : null,
    title: reason, onclick: () => confirmAdvance(view),
  }, gate ? `Avanzar a ${gate.target}` : 'Avanzar');
}

function actionStatus(id) {
  const status = state.action && state.action.id === id ? state.action : null;
  if (!status) return null;
  return h('p', { class: `action-status is-${status.kind}`, role: status.kind === 'error' ? 'alert' : 'status', 'data-testid': 'action-status' }, status.message);
}

function confirmAdvance(view) {
  const task = view.task;
  const gate = holdingGate(task);
  confirmAction({
    title: 'Avanzar tarea',
    okLabel: 'Avanzar',
    body: ['Se avanzará ', h('code', {}, task.id), ` de ${task.current_node} a ${gate ? gate.target : '—'} con deskops (guarda de revisión `,
      h('code', {}, view.revision.slice(0, 12)), ').'],
    onOk: () => advance(task.id, view.revision),
  });
}

async function advance(id, revision) {
  state.action = { id, kind: 'pending', message: 'Avanzando…' };
  render();
  const { status, data } = await postJSON(`/api/desk/advance${qs()}`, { id, revision });
  if (status === 200) {
    const node = data.task ? data.task.current_node : '';
    state.action = { id, kind: 'ok', message: `Avanzó a ${node}.` };
    await refresh();
    return;
  }
  const message = data && data.error ? data.error : `HTTP ${status}`;
  state.action = { id, kind: 'error', message: status === 409 ? `Conflicto: ${message}` : `Error: ${message}` };
  render();
}

// ------------------------------------------------------------------ render
function render() {
  renderChrome();
  const main = document.getElementById('main');
  const renderers = { board: renderBoard, task: renderTaskPage, drawer: renderDrawer, inbox: renderInbox, agents: renderAgents };
  const name = screen();
  const content = [renderers[name]()].flat();
  const scroll = main.scrollTop;
  main.dataset.screen = name;
  main.replaceChildren(...[state.desks && state.desks.errors.length ? referenceNotice(state.desks.errors, 'el registro de desks') : null, ...content].filter(Boolean));
  main.scrollTop = scroll;
}

async function select(id, { focusCard = true } = {}) {
  state.selected = id;
  state.goalOpen = false;
  state.task = null;
  state.taskError = null;
  if (state.action && state.action.id !== id) state.action = null;
  render();
  if (id) {
    await loadTask();
    render();
    if (focusCard) {
      const card = document.querySelector(`.card[data-task-id="${CSS.escape(id)}"]`);
      if (card) card.focus();
    }
  }
}
