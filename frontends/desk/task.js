// Task page (UI04): the TaskDoc as a readable document, in the style of Stitch
// "The Desk - Markdown Wiki Doc" plus the inheritance column of "Tareas Concurrentes & Herencia".
'use strict';

const TASK_SECTIONS = [
  ['why', 'Por qué'],
  ['goal', 'Objetivo'],
  ['scope', 'Alcance'],
  ['implementation_path', 'Camino de implementación'],
  ['validation', 'Validación'],
  ['done_when', 'Hecho cuando'],
];

function taskLink(id, testid) {
  return h('a', { class: 'task-link', href: screenHref('task', { id }), 'data-testid': testid || null }, id);
}

function renderTaskRail(currentId) {
  const board = state.views.board;
  if (!board) return h('nav', { class: 'doc-rail' }, errorNotice('Board no disponible:', state.failures.board || 'sin respuesta'));
  return h('nav', { class: 'doc-rail', 'aria-label': 'Tareas del Board' },
    board.columns.map((column) => [
      h('div', { class: 'rail-head' }, h('span', { class: stageClass(column.phase) }), column.node, h('span', { class: 'rail-count' }, column.count)),
      column.tasks.map((card) => h('a', {
        class: 'rail-item', href: screenHref('task', { id: card.id }), 'aria-current': card.id === currentId ? 'page' : null, title: card.id,
      }, h('span', { class: 'rail-ext' }, '.md'), h('span', { class: 'rail-title' }, card.title))),
    ]));
}

function docSection(index, field, title, body, note) {
  return h('section', { class: 'doc-section', 'data-testid': `section-${field}` },
    h('h2', { class: 'doc-h2' }, h('span', { class: 'doc-num' }, `${String(index).padStart(2, '0')} //`), title, note ? h('small', {}, note) : null),
    body);
}

function renderTaskPage() {
  const id = route().params.get('id');
  const head = pageHead('Tarea', null);
  if (!id) return [head, errorNotice('Falta el id de la tarea.', 'Abre una tarea desde el Board.')];
  if (state.taskError && state.selected === id) {
    return h('div', { class: 'doc-layout' }, renderTaskRail(id), h('div', { class: 'doc' }, errorNotice('La vista task falló:', state.taskError)));
  }
  if (!state.task || state.task.task.id !== id) {
    return h('div', { class: 'doc-layout' }, renderTaskRail(id), h('div', { class: 'doc' }, h('p', { class: 'loading' }, 'Cargando la tarea…')));
  }
  const view = state.task;
  const task = view.task;
  const [evHold, evTotal] = evidenceCount(task);
  let n = 0;
  const sections = TASK_SECTIONS.map(([field, title]) => {
    n += 1;
    const value = task[field];
    const body = Array.isArray(value)
      ? (value.length ? h('ul', { class: 'prose doc-list' }, value.map((item) => h('li', {}, inline(item)))) : h('p', { class: 'empty-note' }, 'Sin entradas.'))
      : (value ? prose(value, 'doc-prose') : h('p', { class: 'empty-note' }, 'Vacío.'));
    return docSection(n, field, title, body);
  });
  const frontmatter = h('pre', { class: 'frontmatter', 'data-testid': 'frontmatter' },
    h('span', { class: 'fm-rule' }, '---'), '\n',
    ['id', 'status', 'current_node', 'task_type'].map((key) => [h('span', { class: 'fm-key' }, `${key}: `), h('span', { class: 'fm-value' }, task[key] || '—'), '\n']),
    task.closeout ? [h('span', { class: 'fm-key' }, 'closeout_evidence: '), h('span', { class: 'fm-value' }, `[${task.closeout.declared.join(', ')}]`), '\n'] : null,
    task.from_drawer ? [h('span', { class: 'fm-key' }, 'from_drawer: '), h('span', { class: 'fm-value' }, task.from_drawer), '\n'] : null,
    [h('span', { class: 'fm-key' }, 'path: '), h('span', { class: 'fm-value' }, task.path), '\n'],
    h('span', { class: 'fm-rule' }, '---'));
  const inheritance = docSection(++n, 'inheritance', 'Herencia y dependencias', [
    h('dl', { class: 'kv kv-wide' },
      h('dt', {}, 'hereda de'), h('dd', { 'data-testid': 'inherits-from' }, task.inherits_from.length ? task.inherits_from.map((dep) => taskLink(dep, 'inherits-link')) : 'ninguna'),
      h('dt', {}, 'depende de'), h('dd', { 'data-testid': 'depends-on' }, task.depends_on.length ? task.depends_on.map((dep) => taskLink(dep, 'depends-link')) : 'ninguna')),
  ]);
  const gates = docSection(++n, 'gates', 'Gates y evidencia', [
    renderGateBoxes(task),
    task.closeout ? renderEvidence(task.closeout) : null,
  ], `gates ${task.gates_holding}/${task.gates_total} · evidencia ${evHold}/${evTotal}`);
  const boardPills = task.pills.filter((pill) => pill.source === 'board');
  const pills = docSection(++n, 'pills', 'Pills (contexto transitorio)', [
    task.pills.filter((pill) => pill.source === 'task').map((pill) => h('aside', { class: 'callout', 'data-testid': 'doc-pill' },
      h('div', { class: 'callout-head' }, h('code', {}, pill.id)), h('p', { class: 'callout-title' }, pill.title),
      h('dl', { class: 'kv' }, h('dt', {}, 'qué'), h('dd', {}, pill.what), h('dt', {}, 'cuándo'), h('dd', {}, pill.when),
        pill.how_not ? [h('dt', {}, 'cómo no'), h('dd', {}, pill.how_not)] : null))),
    boardPills.length ? h('details', { class: 'board-pills box' }, h('summary', {}, `${boardPills.length} pills del Board`), boardPills.map(renderPill)) : null,
    task.pills.length ? null : h('p', { class: 'empty-note' }, 'Sin pills enlazadas.'),
  ]);
  const atoms = docSection(++n, 'atoms', 'Atoms (conocimiento durable)',
    task.atoms.length ? task.atoms.map((atom) => h('div', { class: 'doc-atom', 'data-testid': 'doc-atom' },
      svg('lock', 'lock'),
      h('div', {}, h('code', { class: 'wiki-link' }, `[[${atom.id}]]`), ' — ', h('strong', {}, atom.title), atom.answer ? prose(atom.answer, 'doc-prose') : null)))
      : h('p', { class: 'empty-note' }, 'Sin atoms enlazados.'));
  const refs = docSection(++n, 'references', 'Referencias y archivos', [
    h('div', { class: 'chip-row' }, h('span', { class: 'chip-label' }, 'referencias'),
      task.references.length ? task.references.map((ref) => h('span', { class: 'chip' }, ref)) : h('span', { class: 'empty-note' }, 'ninguna')),
    h('div', { class: 'chip-row' }, h('span', { class: 'chip-label' }, 'archivos'),
      task.files.length ? task.files.map((file) => h('span', { class: 'chip' }, file)) : h('span', { class: 'empty-note' }, 'ninguno')),
  ]);
  const next = view.next ? docSection(++n, 'next', 'Qué sigue', [
    h('ul', { class: 'prose doc-list' }, view.next.next_actions.map((item) => h('li', {}, item))),
    view.next.advance_when.length ? h('p', { class: 'muted' }, 'Avanza cuando: ', view.next.advance_when.join(' ')) : null,
  ], view.next.ritual) : null;
  const other = docSection(++n, 'actions', 'Otras acciones', renderDisabledActions());
  const footer = h('div', { class: 'doc-footer', 'data-testid': 'doc-footer' },
    h('div', { class: 'doc-footer-state' },
      h('span', { class: `state-dot ${task.gates_holding ? 'is-holds' : 'is-pending'}` }),
      h('span', {}, `gates ${task.gates_holding}/${task.gates_total} · evidencia ${evHold}/${evTotal}`),
      h('span', { class: 'muted' }, task.current_node)),
    h('div', { class: 'doc-footer-actions' },
      actionStatus(task.id),
      h('a', { class: 'lane-link', href: inspectHref(task.id), target: '_blank', rel: 'noopener' }, 'Inspeccionar ↗'),
      advanceButton(view)));
  return h('div', { class: 'doc-layout' },
    renderTaskRail(task.id),
    h('div', { class: 'doc-wrap' },
      h('article', { class: 'doc', 'data-testid': 'task-doc' },
        h('div', { class: 'doc-crumbs' }, h('a', { href: screenHref('board') }, 'board'), ' / ', h('span', {}, `${task.id}.md`)),
        frontmatter,
        h('h1', { class: 'doc-title' }, task.title),
        task.on_board ? null : h('div', { class: 'notice' }, 'Esta tarea no está en desk/tasks/Board.md.'),
        referenceNotice(view.errors, 'esta tarea'),
        sections, inheritance, gates, pills, atoms, refs, next, other,
        h('div', { class: 'doc-end' }, h('span', { title: view.revision }, `revisión ${view.revision.slice(0, 12)}`))),
      footer));
}
