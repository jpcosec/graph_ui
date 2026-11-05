// Drawer screen (UI05): deferred tasks of desk/drawer/tasks, raw Markdown (read-only) and the
// `deskops add task --from-drawer` command to copy. Promoting to the desk is authoring a task,
// so there is no button that writes.
'use strict';

function fileName(path) {
  return String(path).split('/').pop();
}

async function copyCommand(text, statusEl) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = 'Copiado.';
    statusEl.className = 'copy-status is-ok';
  } catch (err) {
    statusEl.textContent = `No se pudo copiar (${err.message}); selecciona el texto y cópialo a mano.`;
    statusEl.className = 'copy-status is-error';
  }
}

function renderDrawer() {
  const drawer = state.views.drawer;
  const head = pageHead('Drawer', 'Trabajo diferido en desk/drawer/tasks. Pasar una entrada al desk es autorar una tarea con deskops add task --from-drawer.');
  if (!drawer) return [head, errorNotice('La vista drawer falló:', state.failures.drawer || 'sin respuesta')];
  const wanted = route().params.get('id') || state.drawerSelected;
  const selected = drawer.tasks.find((entry) => entry.id === wanted) || drawer.tasks[0] || null;
  const list = drawer.tasks.length ? h('div', { class: 'split-list', 'data-testid': 'drawer-list' }, drawer.tasks.map((entry) =>
    h('button', {
      type: 'button', class: 'list-card', 'aria-pressed': selected && entry.id === selected.id ? 'true' : 'false', 'data-entry-id': entry.id,
      onclick: () => { state.drawerSelected = entry.id; location.hash = `#/drawer?${new URLSearchParams({ id: entry.id })}`; },
    },
      h('div', { class: 'list-card-top' },
        h('span', { class: 'file-name' }, svg('file', 'chip-icon'), fileName(entry.path)),
        h('span', { class: 'badge' }, entry.status || 'sin status')),
      h('h3', { class: 'card-title' }, entry.title),
      entry.excerpt.length ? h('p', { class: 'list-excerpt' }, entry.excerpt[0]) : null)))
    : h('p', { class: 'empty-note' }, 'El drawer está vacío.');
  let panel = null;
  if (selected) {
    const status = h('span', { class: 'copy-status', role: 'status', 'data-testid': 'copy-status' });
    panel = h('aside', { class: 'split-panel', 'data-testid': 'drawer-panel' },
      h('div', { class: 'panel-head' }, h('span', { class: 'file-name' }, svg('file', 'chip-icon'), selected.path), h('span', { class: 'badge' }, 'solo lectura')),
      h('h2', { class: 'insp-title' }, selected.title),
      section('Pasar al desk', 'autorar la tarea',
        h('pre', { class: 'command', 'data-testid': 'drawer-command' }, selected.command),
        h('div', { class: 'command-actions' },
          h('button', { type: 'button', class: 'btn btn-small', 'data-testid': 'copy-command', onclick: () => copyCommand(selected.command, status) }, 'Copiar comando'),
          status),
        h('small', { class: 'muted' }, 'Completa goal, scope, validation y --task-type al autorarla; no hay botón que escriba la tarea.')),
      section('Markdown', fileName(selected.path), h('pre', { class: 'raw-md', 'data-testid': 'drawer-raw' }, selected.markdown)));
  }
  return [head,
    h('div', { class: 'metrics metrics-3' },
      metric('Tareas en el drawer', drawer.count, 'metric-drawer'),
      metric('Con TaskDoc válido', drawer.tasks.filter((entry) => entry.status !== null).length, 'metric-drawer-valid'),
      metric('Errores de lectura', drawer.errors.length, 'metric-drawer-errors', drawer.errors.length > 0)),
    referenceNotice(drawer.errors, 'el drawer'),
    h('div', { class: 'split' }, list, panel)];
}
