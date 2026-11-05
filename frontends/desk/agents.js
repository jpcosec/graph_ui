// Agents screen (UI06): live Herdr workers (`deskops runtime workers`, machine-wide) and the
// latest runs of runs/subagents/index.jsonl. If Herdr is unavailable the cause is shown.
'use strict';

function cell(value, mono) {
  return h('td', { class: mono ? 'mono' : null }, value === null || value === undefined || value === '' ? '—' : String(value));
}

function renderAgents() {
  const agents = state.views.agents;
  const head = pageHead('Agentes', 'Workers vivos en Herdr (toda la máquina, como deskops runtime workers) y las últimas corridas del índice runs/subagents/index.jsonl.');
  if (!agents) return [head, errorNotice('La vista agents falló:', state.failures.agents || 'sin respuesta')];
  const boardIds = new Set(state.views.board ? state.views.board.columns.flatMap((column) => column.tasks.map((card) => card.id)) : []);
  const workerRow = (worker) => h('tr', { 'data-pane': worker.pane },
    cell(worker.pane, true), cell(worker.kind), cell(worker.name),
    h('td', {}, h('span', { class: `worker-status status-${worker.status || 'unknown'}` }, worker.status || '—')),
    cell(worker.cwd, true), cell(worker.title));
  const workersTable = () => h('div', { class: 'table-wrap' }, h('table', { class: 'table', 'data-testid': 'workers-table' },
    h('thead', {}, h('tr', {}, ['pane', 'tipo', 'nombre', 'estado', 'cwd', 'título'].map((label) => h('th', { scope: 'col' }, label)))),
    h('tbody', {}, agents.workers.map(workerRow))));
  let workers;
  if (agents.workers === null) workers = errorNotice('Herdr no está disponible:', agents.workers_error || 'sin causa');
  else if (agents.workers.length) workers = workersTable();
  else workers = h('p', { class: 'empty-note' }, 'Herdr responde, pero no hay workers vivos.');
  const runRow = (run) => h('tr', { 'data-task': run.task_id },
    h('td', { class: 'mono' }, run.on_board && boardIds.has(run.task_id)
      ? h('a', { class: 'task-link', href: screenHref('task', { id: run.task_id }), 'data-testid': 'run-task-link' }, run.task_id)
      : (run.task_id || '—')),
    cell(run.mode), cell(run.run_dir, true), cell(run.commit ? run.commit.slice(0, 12) : null, true), cell(run.run_id, true));
  let runs;
  if (agents.runs.length) {
    runs = h('div', { class: 'table-wrap' }, h('table', { class: 'table', 'data-testid': 'runs-table' },
      h('thead', {}, h('tr', {}, ['tarea', 'modo', 'run_dir', 'commit', 'run_id'].map((label) => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, agents.runs.map(runRow))));
  } else {
    runs = h('p', { class: 'empty-note' }, agents.runs_total ? 'Sin corridas en el rango pedido.' : 'El índice de corridas está vacío o no existe.');
  }
  return [head,
    h('div', { class: 'metrics metrics-3' },
      metric('Workers vivos (herdr)', agents.live_workers === null ? 'no disponible' : agents.live_workers, 'metric-workers', agents.live_workers === null),
      metric('Corridas en el índice', agents.runs_total, 'metric-runs-total'),
      metric('Mostradas', `${agents.runs.length} (últimas ${agents.runs_limit})`, 'metric-runs-shown')),
    referenceNotice(agents.errors.filter((item) => item.reference !== 'runtime workers'), 'el índice de corridas'),
    section('Workers', agents.workers === null ? 'herdr no disponible' : `${agents.workers.length} vivos`, workers),
    section('Corridas', `últimas ${agents.runs.length} de ${agents.runs_total}`, runs)];
}
