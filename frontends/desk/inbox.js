// Inbox screen (UI05): notes of desk/inbox with sender → target, kind, date and ack state.
// Actions run deskops operations through the server (POST /api/inbox/{ack,promote}) with an
// explicit confirmation and the note's revision (sha256 of its bytes) as guard.
'use strict';

const INBOX_FILTERS = [
  ['all', 'Todas', () => true],
  ['open', 'Sin reconocer', (note) => !note.acknowledged],
  ['acked', 'Reconocidas', (note) => note.acknowledged],
];

function noteDate(note) {
  return note.date ? note.date.replace('T', ' ') : 'sin fecha';
}

function firstLine(text) {
  const line = String(text || '').split('\n').map((l) => l.trim()).find((l) => l && !/^_.*_$/.test(l) && !l.startsWith('#'));
  return line || '';
}

function inboxStatus(note) {
  const status = state.inboxAction && state.inboxAction.note === note ? state.inboxAction : null;
  return status ? h('p', { class: `action-status is-${status.kind}`, role: status.kind === 'error' ? 'alert' : 'status', 'data-testid': 'inbox-status' }, status.message) : null;
}

async function inboxAction(action, note) {
  const label = action === 'ack' ? 'Reconociendo…' : 'Pasando al drawer…';
  state.inboxAction = { note: note.id, kind: 'pending', message: label };
  render();
  const { status, data } = await postJSON(`/api/inbox/${action}${qs()}`, { note: note.id, revision: note.revision });
  if (status === 200) {
    const done = action === 'ack' ? 'Nota reconocida con deskops message ack.' : `Pasada al drawer con deskops promote inbox-to-drawer-task. ${data.output || ''}`;
    await loadViews();
    const stillThere = state.views.inbox && state.views.inbox.notes.some((item) => item.id === note.id);
    state.inboxAction = { note: stillThere ? note.id : null, kind: 'ok', message: done.trim() };
    if (!stillThere) state.inboxSelected = null;
    render();
    return;
  }
  const message = data && data.error ? data.error : `HTTP ${status}`;
  state.inboxAction = { note: note.id, kind: 'error', message: status === 409 ? `Conflicto: ${message}` : `Error: ${message}` };
  render();
}

function confirmInbox(action, note) {
  const ack = action === 'ack';
  confirmAction({
    title: ack ? 'Reconocer mensaje' : 'Pasar al drawer',
    okLabel: ack ? 'Reconocer' : 'Pasar al drawer',
    body: ack
      ? ['Se marcará ', h('code', {}, note.id), ' como reconocida con deskops message ack (guarda ', h('code', {}, note.revision.slice(0, 12)), ').']
      : ['Se creará una tarea diferida en desk/drawer/tasks desde ', h('code', {}, note.id), ' y la nota saldrá del inbox, como hace deskops promote inbox-to-drawer-task (guarda ',
        h('code', {}, note.revision.slice(0, 12)), ').'],
    onOk: () => inboxAction(action, note),
  });
}

function renderInbox() {
  const inbox = state.views.inbox;
  const head = pageHead('Inbox', 'Mensajes entre desks en desk/inbox: quién los envía, a quién, y si ya se reconocieron.');
  if (!inbox) return [head, errorNotice('La vista inbox falló:', state.failures.inbox || 'sin respuesta')];
  const params = route().params;
  const filter = INBOX_FILTERS.find(([key]) => key === (params.get('filter') || 'all')) || INBOX_FILTERS[0];
  const notes = inbox.notes.filter(filter[2]);
  const wanted = params.get('id') || state.inboxSelected;
  const selected = inbox.notes.find((note) => note.id === wanted) || notes[0] || null;
  const filters = h('div', { class: 'filters', role: 'group', 'aria-label': 'Filtrar notas' }, INBOX_FILTERS.map(([key, label, test]) =>
    h('a', { class: 'filter', href: screenHref('inbox', { filter: key }), 'aria-current': key === filter[0] ? 'true' : null },
      label, h('span', { class: 'num' }, inbox.notes.filter(test).length))));
  const list = notes.length ? h('div', { class: 'split-list', 'data-testid': 'inbox-list' }, notes.map((note) =>
    h('button', {
      type: 'button', class: 'list-card', 'aria-pressed': selected && note.id === selected.id ? 'true' : 'false', 'data-note-id': note.id,
      onclick: () => { state.inboxSelected = note.id; location.hash = `#/inbox?${new URLSearchParams({ filter: filter[0], id: note.id })}`; },
    },
      h('div', { class: 'list-card-top' },
        h('span', { class: 'route-chip' }, `${note.sender || '¿?'} → ${note.target || '¿?'}`),
        h('span', { class: 'list-date' }, noteDate(note))),
      h('h3', { class: 'card-title' }, note.title),
      firstLine(note.body) ? h('p', { class: 'list-excerpt' }, firstLine(note.body)) : null,
      h('div', { class: 'list-card-foot' },
        h('span', { class: `badge ${note.acknowledged ? '' : 'badge-open'}` }, note.acknowledged ? 'reconocida' : 'sin reconocer'),
        h('span', { class: 'muted mono' }, note.kind)))))
    : h('p', { class: 'empty-note' }, 'No hay notas con este filtro.');
  let panel = null;
  if (selected) {
    const ackReason = selected.acknowledged
      ? `Ya reconocida${selected.acknowledged_by ? ` por ${selected.acknowledged_by}` : ''}${selected.acknowledged_at ? ` el ${selected.acknowledged_at}` : ''}.`
      : null;
    panel = h('aside', { class: 'split-panel', 'data-testid': 'inbox-panel' },
      h('div', { class: 'panel-head' },
        h('span', { class: 'route-chip' }, `${selected.sender || '¿?'} → ${selected.target || '¿?'}`),
        h('span', { class: 'badge' }, selected.kind)),
      h('h2', { class: 'insp-title' }, selected.title),
      h('dl', { class: 'kv kv-wide' },
        h('dt', {}, 'fecha'), h('dd', { class: 'mono' }, noteDate(selected)),
        h('dt', {}, 'estado'), h('dd', { 'data-testid': 'note-status' }, selected.status || '—'),
        h('dt', {}, 'archivo'), h('dd', { class: 'mono' }, selected.path)),
      selected.body ? prose(selected.body, 'doc-prose note-body') : h('p', { class: 'empty-note' }, 'La nota no tiene cuerpo.'),
      h('div', { class: 'actions panel-actions' },
        h('div', { class: 'action-row' },
          h('button', { type: 'button', class: 'btn btn-primary', id: 'promote-note', onclick: () => confirmInbox('promote', selected) }, 'Pasar al drawer'),
          h('button', { type: 'button', class: 'btn', id: 'ack-note', disabled: ackReason ? true : null, title: ackReason, onclick: () => confirmInbox('ack', selected) }, 'Reconocer')),
        ackReason ? h('small', { class: 'muted' }, ackReason) : null,
        inboxStatus(selected.id)));
  }
  const orphanStatus = state.inboxAction && state.inboxAction.note === null
    ? h('p', { class: `action-status is-${state.inboxAction.kind}`, role: 'status', 'data-testid': 'inbox-status' }, state.inboxAction.message) : null;
  return [head,
    h('div', { class: 'metrics metrics-3' },
      metric('Notas', inbox.count, 'metric-inbox-count'),
      metric('Sin reconocer', inbox.open, 'metric-inbox-open'),
      metric('Errores de lectura', inbox.errors.length, 'metric-inbox-errors', inbox.errors.length > 0)),
    referenceNotice(inbox.errors, 'el inbox'),
    orphanStatus,
    filters,
    h('div', { class: 'split' }, list, panel)];
}
