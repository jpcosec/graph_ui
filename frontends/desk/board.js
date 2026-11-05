// Board screen (UI03): columns per lifecycle node, cards, inspector, drawer lane.
'use strict';

function stageClass(phase) {
  return `stage-dot stage-${phase || 'unknown'}`;
}

function evidenceCount(card) {
  const items = card.closeout ? card.closeout.evidence : [];
  return [items.filter((item) => item.state === 'holds').length, items.length];
}

function checkRow(name, stateName, title) {
  return h('li', { class: `check is-${stateName}`, title: title || null, 'data-state': stateName },
    h('span', { class: 'check-name' }, svg(stateName), name),
    h('span', { class: 'check-state' }, STATE_LABELS[stateName]));
}

function cardErrors(card) {
  const board = state.views.board;
  return board ? board.errors.filter((item) => item.task === card.id) : [];
}

function renderCard(card) {
  const selected = card.id === state.selected;
  const evidence = card.closeout ? card.closeout.evidence : [];
  const [evHold, evTotal] = evidenceCount(card);
  const taskPills = card.pills.filter((pill) => pill.source === 'task');
  const boardPills = card.pills.filter((pill) => pill.source === 'board');
  const unresolved = cardErrors(card);
  return h('button', {
    type: 'button', class: 'card', 'aria-pressed': selected ? 'true' : 'false', 'data-task-id': card.id,
    onclick: () => select(card.id),
  },
    h('div', { class: 'card-top' },
      h('span', { class: 'card-id', title: card.id }, card.id),
      h('span', { class: 'badge' }, card.status || 'sin status')),
    h('h3', { class: 'card-title' }, card.title),
    (card.gates.length || evidence.length) ? h('ul', { class: 'checklist', 'data-testid': 'checklist' },
      card.gates.map((gate) => checkRow(`${gate.relation_type} → ${gate.target}`, gate.holds ? 'holds' : 'pending', gate.condition || 'sin condición')),
      (card.gates.length && evidence.length) ? h('li', { class: 'check-sep', 'aria-hidden': 'true' }) : null,
      evidence.map((item) => checkRow(`evidencia: ${EVIDENCE_LABELS[item.gate] || item.gate}`, item.state))) : null,
    (taskPills.length || boardPills.length || unresolved.length) ? h('div', { class: 'chips' },
      taskPills.map((pill) => h('span', { class: 'chip', title: pill.title }, h('span', { class: 'chip-dot' }), pill.id)),
      unresolved.map((item) => h('span', { class: 'chip chip-warning', title: item.cause, 'data-testid': 'unresolved-chip' }, svg('warn', 'chip-icon'), item.reference)),
      boardPills.length ? h('span', { class: 'chip chip-board', title: boardPills.map((p) => p.id).join('\n') },
        h('span', { class: 'chip-dot' }), `${boardPills.length} pills del Board`) : null) : null,
    card.atoms.length ? h('div', { class: 'atoms' },
      card.atoms.map((atom) => h('div', { class: 'atom-line', title: atom.title }, svg('lock', 'lock'), h('span', {}, atom.id)))) : null,
    h('div', { class: 'card-foot' },
      h('span', { 'data-testid': 'gate-count' }, `gates ${card.gates_holding}/${card.gates_total}`),
      card.closeout ? h('span', { 'data-testid': 'evidence-count' }, `evidencia ${evHold}/${evTotal}`) : null));
}

function renderColumns(board) {
  return h('div', { class: 'columns' }, board.columns.map((column, index) =>
    h('section', { class: 'column', 'data-node': column.node, 'aria-label': `${column.node}: ${column.count} tareas` },
      h('div', { class: 'column-head' },
        h('span', { class: 'column-title' }, h('span', { class: stageClass(column.phase) }),
          `${column.in_lifecycle ? `${index + 1}. ` : ''}${column.phase || column.node}`),
        h('span', { class: 'column-count', 'data-testid': 'column-count' }, column.count)),
      h('div', { class: 'column-node' }, column.node),
      column.purpose ? h('div', { class: 'column-purpose' }, column.purpose) : null,
      column.tasks.length ? column.tasks.map(renderCard) : h('div', { class: 'column-empty' }, 'Sin tareas en este nodo.'))));
}

function renderDrawerLane() {
  const drawer = state.views.drawer;
  if (!drawer) return errorNotice('Drawer no disponible:', state.failures.drawer || 'sin respuesta');
  return h('section', { class: 'lane', 'aria-label': 'Drawer' },
    h('div', { class: 'lane-head' },
      h('div', { class: 'lane-title' }, h('h2', {}, 'Drawer'), h('span', {}, `${drawer.count} tareas diferidas en desk/drawer/tasks`)),
      h('a', { class: 'lane-link', href: screenHref('drawer') }, 'Ver drawer →')),
    drawer.tasks.length ? h('div', { class: 'lane-grid' }, drawer.tasks.slice(0, 3).map((entry) =>
      h('a', { class: 'lane-item', href: screenHref('drawer', { id: entry.id }) },
        h('div', { class: 'lane-item-top' }, h('span', { title: entry.id }, entry.id), h('span', {}, entry.status || 'sin status')),
        h('p', {}, entry.title)))) : h('p', { class: 'empty-note' }, 'El drawer está vacío.'));
}

function renderBoard() {
  const board = state.views.board;
  const head = pageHead('Board', 'Tareas de desk/tasks/Board.md por nodo del ciclo de vida, con sus gates y la evidencia de cierre declarada.');
  if (!board) return [head, errorNotice('La vista board falló:', state.failures.board || 'sin respuesta')];
  const { agents } = state.views;
  const metrics = h('div', { class: 'metrics' },
    metric('Tareas por etapa', board.columns.map((column) => column.count).join(' · '), 'metric-tasks'),
    metric('Gates que se cumplen', `${board.counts.gates_holding}/${board.counts.gates_total}`, 'metric-gates'),
    metric('Pills del Board', board.board.pills.length, 'metric-pills'),
    agents ? metric('Workers vivos (herdr)', agents.live_workers === null ? 'no disponible' : agents.live_workers, 'metric-workers', agents.live_workers === null)
      : metric('Workers vivos (herdr)', 'vista agents falló', 'metric-workers', true));
  const layout = h('div', { class: `board-layout${state.selected ? '' : ' no-inspector'}` },
    h('div', { class: 'board-main' }, renderColumns(board), renderDrawerLane()),
    state.selected ? renderInspector() : null);
  return [head, metrics, referenceNotice(board.errors, 'el Board'), layout];
}

// ------------------------------------------------------------------ inspector
function renderPill(pill) {
  return h('div', { class: 'pill-item', 'data-testid': 'inspector-pill' },
    h('div', { class: 'box-row' }, h('strong', {}, h('span', { class: 'chip-dot' }), h('code', {}, pill.id))),
    h('p', { class: 'pill-title' }, pill.title),
    h('dl', { class: 'kv' },
      h('dt', {}, 'qué'), h('dd', {}, pill.what),
      h('dt', {}, 'cuándo'), h('dd', {}, pill.when),
      pill.how_not ? [h('dt', {}, 'cómo no'), h('dd', {}, pill.how_not)] : null));
}

function renderGateBoxes(task) {
  return task.gates.length ? task.gates.map((gate) => h('div', { class: 'box', 'data-testid': 'inspector-gate' },
    h('div', { class: 'box-row' },
      h('strong', { class: gate.holds ? 'is-holds' : 'is-pending' }, svg(gate.holds ? 'holds' : 'pending'), `${gate.relation_type} → ${gate.target}`),
      h('span', { class: `check-state ${gate.holds ? 'is-holds' : 'is-pending'}` }, gate.holds ? 'cumple' : 'pendiente')),
    h('p', {}, 'Condición: ', gate.condition ? h('code', {}, gate.condition) : 'sin condición')))
    : h('p', { class: 'empty-note' }, 'No hay transiciones que salgan de este nodo.');
}

function renderEvidence(closeout) {
  return [
    h('div', { class: 'box' },
      h('dl', { class: 'kv' },
        h('dt', {}, 'declarada'), h('dd', {}, closeout.declared.join(', ') || '—'),
        h('dt', {}, 'encontrada'), h('dd', {}, closeout.found.join(', ') || 'nada'))),
    closeout.evidence.map((item) => h('div', { class: 'box', 'data-testid': 'evidence-gate' },
      h('div', { class: 'box-row' },
        h('strong', { class: `is-${item.state}` }, svg(item.state), EVIDENCE_LABELS[item.gate] || item.gate),
        h('span', { class: `check-state is-${item.state}` }, STATE_LABELS[item.state])),
      foldList([
        ...item.evidence.map((ev) => h('li', {}, h('code', {}, ev))),
        ...item.findings.map((f) => h('li', {}, f.path ? [h('code', {}, f.path), ': '] : null, f.message)),
      ]))),
    closeout.alerts.map((alert) => h('div', { class: 'box' }, h('p', { class: 'is-pending' }, alert.message))),
  ];
}

function renderDisabledActions() {
  return h('ul', { class: 'disabled-actions' }, DISABLED_ACTIONS.map(([label, why]) => h('li', { class: 'disabled-action' },
    h('button', { type: 'button', class: 'btn btn-small', disabled: true, title: why }, label),
    h('small', {}, why))));
}

function renderInspector() {
  const closeBtn = h('button', { type: 'button', class: 'icon-btn', 'aria-label': 'Cerrar panel', onclick: () => select(null) }, '✕');
  if (state.taskError) {
    return h('aside', { class: 'inspector', 'aria-label': 'Tarea seleccionada' },
      h('div', { class: 'insp-head' }, h('span', { class: 'insp-id' }, state.selected), closeBtn),
      errorNotice('La vista task falló:', state.taskError));
  }
  if (!state.task || state.task.task.id !== state.selected) {
    return h('aside', { class: 'inspector', 'aria-label': 'Tarea seleccionada' }, h('p', { class: 'loading' }, 'Cargando la tarea…'));
  }
  const view = state.task;
  const task = view.task;
  return h('aside', { class: 'inspector', 'aria-label': 'Tarea seleccionada', 'data-testid': 'inspector' },
    h('div', { class: 'insp-head' },
      h('div', { class: 'insp-ids' },
        h('span', { class: 'insp-id' }, task.id),
        h('span', { class: 'insp-stage' }, `${task.status || 'sin status'} · ${task.current_node}${view.next ? ` · ${view.next.phase}` : ''}`)),
      closeBtn),
    h('h2', { class: 'insp-title' }, task.title),
    task.goal ? h('p', { class: `insp-goal${state.goalOpen ? '' : ' is-clamped'}`, 'data-testid': 'inspector-goal' }, task.goal) : null,
    task.goal && task.goal.length > 320 ? h('button', { type: 'button', class: 'link-btn', 'aria-expanded': state.goalOpen ? 'true' : 'false',
      onclick: () => { state.goalOpen = !state.goalOpen; render(); } }, state.goalOpen ? 'Ver menos' : 'Ver objetivo completo') : null,
    h('a', { class: 'open-doc', href: screenHref('task', { id: task.id }), 'data-testid': 'open-task' }, 'Abrir documento de la tarea →'),
    referenceNotice(view.errors, 'esta tarea'),
    section('Gates', `${task.gates_holding}/${task.gates_total} se cumplen`, renderGateBoxes(task)),
    task.closeout ? section('Evidencia de cierre', `declarada ${task.closeout.declared.length} · encontrada ${task.closeout.found.length}`, renderEvidence(task.closeout)) : null,
    view.next ? section('Qué sigue', view.next.ritual,
      h('div', { class: 'box' },
        h('ul', {}, view.next.next_actions.map((item) => h('li', {}, item))),
        view.next.advance_when.length ? h('p', {}, 'Avanza cuando: ', view.next.advance_when.join(' ')) : null)) : null,
    section('Pills', 'contexto transitorio',
      task.pills.filter((pill) => pill.source === 'task').map(renderPill),
      task.pills.some((pill) => pill.source === 'board') ? h('details', { class: 'box board-pills' },
        h('summary', {}, `${task.pills.filter((pill) => pill.source === 'board').length} pills del Board`),
        task.pills.filter((pill) => pill.source === 'board').map(renderPill)) : null,
      task.pills.length ? null : h('p', { class: 'empty-note' }, 'Sin pills enlazadas.')),
    section('Atoms', 'conocimiento durable',
      task.atoms.length ? task.atoms.map((atom) => h('div', { class: 'box', 'data-testid': 'inspector-atom' },
        h('div', { class: 'box-row' }, h('strong', {}, svg('lock', 'lock'), h('code', {}, atom.id)), atom.question ? h('small', { class: 'muted' }, atom.question) : null),
        h('p', {}, atom.title),
        atom.answer ? h('p', { class: 'insp-goal' }, atom.answer) : null))
        : h('p', { class: 'empty-note' }, 'Sin atoms enlazados.')),
    h('div', { class: 'actions' },
      advanceButton(view),
      advanceBlockReason(task) ? h('small', { class: 'muted' }, advanceBlockReason(task)) : null,
      actionStatus(task.id),
      renderDisabledActions()),
    h('div', { class: 'insp-foot' },
      h('span', { title: view.revision }, `rev ${view.revision.slice(0, 12)}`),
      h('a', { href: inspectHref(task.id), target: '_blank', rel: 'noopener' }, 'Inspeccionar ↗')));
}
