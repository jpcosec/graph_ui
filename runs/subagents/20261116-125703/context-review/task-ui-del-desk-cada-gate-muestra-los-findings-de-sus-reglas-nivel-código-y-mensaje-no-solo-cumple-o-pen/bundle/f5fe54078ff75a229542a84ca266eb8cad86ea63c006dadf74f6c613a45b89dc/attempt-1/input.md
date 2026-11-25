FILE:desk/tasks/task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen.md
---
sldb:
  by: agent
  at: '2026-11-16T12:55:53Z'
  authority: generated
  via: save_document_payload
id: task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:robocop2
current_node: ritual-execution
history: []
references:
- desk/inbox/20261116-011047-suggestion-deskops-ui-la-ui-del-desk-ya-muestra-los-findings-de-reglas-y-los-recibos-gates-g-gc-gates-y-g-gc-receipts.md
- ../../deskops/docs/deskops-ui.md
- frontends/desk/README.md
depends_on: []
pills:
- desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
files:
- frontends/desk/board.js
- frontends/desk/styles.css
- tests/test_desk_ui_routes.py
- tests/e2e_desk_ui.py
task_type: task.code
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# UI del desk: cada gate muestra los findings de sus reglas (nivel, código y mensaje), no solo cumple o pendiente

## Rationale

_Explain why this task exists or the business driver behind it._

deskops preguntó (nota del inbox de graph_ui 20261116-011047, gates G_GC_GATES y G_GC_RECEIPTS del plan deskops-ui) si la UI del desk ya muestra los findings de las reglas de activación y los recibos de cada tarea. Hoy no: `deskops view task <id> --format json` y `deskops view board` entregan en cada gate `findings: [{level, code, subject, what}]` (por ejemplo code 'rules/rule-activation-task-code' y what 'Una tarea task.code se activa con recibos preflight y bundle aceptados e intactos ... (seen: {})'), pero renderGateBoxes de frontends/desk/board.js (que usan el inspector del Board y la vista Tarea) dibuja solo relation_type, target, holds y condition. Sin los findings, quien mira la UI no sabe qué recibo falta.

## Goal

_Describe the concrete result this task must produce._

En la vista Tarea y en el inspector del Board de frontends/desk (las dos dibujan los gates con renderGateBoxes de board.js: task.js línea ~71 y board.js línea ~165, cargados como scripts globales en index.html), cada gate muestra sus findings: el nivel como texto visible ('error', 'aviso' o 'info'), el código de la regla en <code> y el mensaje (what) completo; el subject no se muestra (es la propia tarea). Un gate sin findings no muestra lista.

## Scope

_State what is in scope and what is out of scope._

ENTRA: (1) frontends/desk/board.js: renderGateBoxes agrega, bajo la línea de condición, una <ul class='gate-findings'> con un <li data-testid='gate-finding' class='finding is-<level>'> por finding: un <span class='finding-level'> con el texto 'error', 'aviso' (level warning) o 'info', el code en <code> y el what como nodo de texto (con h(), nunca innerHTML). Como task.js llama a la misma función, la vista Tarea queda cubierta sin tocar task.js. (2) frontends/desk/styles.css: clases nuevas .finding.is-error, .finding.is-warning y .finding.is-info (borde izquierdo o color del texto del nivel); el nivel siempre va también como texto. (3) Pruebas: en tests/e2e_desk_ui.py, junto a test_task_page_sections_inheritance_and_advance, una prueba que abre la vista Tarea de una tarea con un gate retenido y comprueba el li gate-finding con nivel, code y what, y otra que comprueba que un gate sin findings no tiene ul.gate-findings; si el fixture de desk de ese archivo no produce findings, se crea la tarea retenida en el fixture del propio test (una task.code sin recibo preflight produce el finding rules/rule-activation-task-code). tests/test_desk_ui_routes.py y tests/test_mindmap_deskops.py se corren solo como regresión. NO ENTRA: frontends/desk/task.js y app.js (JP tiene cambios locales sin commitear; si el cambio los necesitara, el ejecutor para y lo reporta); cambiar deskops o el contrato de deskops view; la lista de ReviewDoc de la tarea (deskops view no la entrega; pedida a deskops en la nota 20261116-095054).

## Implementation Path

_Outline the expected implementation route or affected surface._

1) cd ../../deskops && deskops view task task-advance-y-closeout-no-derraman-reglas-de-activacion-ni-runtimes-centrales-sin-trackear-en-el-desk-co --root . --format json: esa tarea real tiene un gate con 1 finding (code rules/rule-activation-task-code); fija la forma exacta {level, code, subject, what}. 2) Editar renderGateBoxes en board.js y styles.css. 3) Las pruebas de (3). 4) Verificación en navegador headless (playwright, chromium) sobre el desk real: python3 frontends/desk/serve.py 8091 --root ../../deskops; abrir la vista Tarea de esa tarea y el inspector del Board con ella seleccionada; guardar runs/subagents/<run_dir del despacho>/gate-findings-task.png, gate-findings-board.png y timings.txt (ms hasta que el gate es visible, 3 cargas por pantalla).

## Validation

_List the checks required before this task can close._

- python -m pytest -q -rs tests/test_desk_ui_routes.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_desk_ui.py
- git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js

## Done When

_Name the observable condition that makes the task complete._

Con la UI servida sobre el desk real de deskops, la vista Tarea y el inspector del Board de la tarea del paso 1 muestran el nivel, el code rules/rule-activation-task-code y el what completo; un gate sin findings no muestra lista; las pruebas de la validación pasan; task.js y app.js no cambiaron; las 2 capturas y timings.txt están en el run_dir.

FILE:desk/rituals/execution.md
---
# ritual-xxx
id: ritual-execution
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Execution ritual

## Purpose

_Explain why this ritual exists._

Keep graph_ui delivery scoped to one active task at a time, grounded in the board and its bound pills, so implementation stays narrow and reviewable.

## Trigger

_State when this ritual should start._

When a graph_ui task is promoted to active and implementation begins.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task is the active item on `desk/tasks/Board.md`.
- The relevant pills are bound to the task.

## Validation

_List the checks that prove the ritual was performed correctly._

- Only the active task's scope was changed.
- Bound pill guardrails were respected.

## Failure Modes

_List common mistakes this ritual prevents._

- Implementing more than the active task.
- Bypassing bound pills or the board.

## Completion

_Describe what completion looks like._

The active task is implemented within scope and ready for the testing ritual.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/testing.md
---
# ritual-xxx
id: ritual-testing
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Testing ritual

## Purpose

_Explain why this ritual exists._

Prove the intended contract of a graph_ui task with the smallest relevant validation first, then broaden coverage when the change touches shared behavior.

## Trigger

_State when this ritual should start._

When the execution ritual for a task completes and the change needs validation.

## Preconditions

_List the conditions that must hold before running the ritual._

- The task implementation is complete.
- The affected test surface is known.

## Validation

_List the checks that prove the ritual was performed correctly._

- `pytest` passes for backend changes.
- `npm test` passes for `apps/review-workbench` changes.

## Failure Modes

_List common mistakes this ritual prevents._

- Broadening coverage before the narrow contract is proven.
- Skipping the frontend suite when the UI changed.

## Completion

_Describe what completion looks like._

The task's contract is proven green and the change is ready for closeout.

## Step Details

_Generated from the step references above._

FILE:desk/rituals/closeout.md
---
# ritual-xxx
id: ritual-closeout
# List of step-xxx paths
steps: []
# e.g., layer:workflow, system:sldb
tags:
- workspace:desk
- system:graph_ui
- layer:workflow
---

# Closeout ritual

## Purpose

_Explain why this ritual exists._

Close a graph_ui task only after validation passes, the board reflects reality, and the final change is captured as its own atomic commit.

## Trigger

_State when this ritual should start._

When the testing ritual passes and the task is ready to be closed.

## Preconditions

_List the conditions that must hold before running the ritual._

- Validation is green.
- The board and task status match the implemented reality.

## Validation

_List the checks that prove the ritual was performed correctly._

- The task is marked resolved on `desk/tasks/Board.md`.
- The closing change is a single atomic commit.

## Failure Modes

_List common mistakes this ritual prevents._

- Closing without green validation.
- Leaving the board out of sync with the code.

## Completion

_Describe what completion looks like._

The task is resolved, the board is reconciled, and the closeout commit is recorded.

## Step Details

_Generated from the step references above._

FILE:desk/contexts/pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables.md
---
# pill-xxx
id: pill-guardrail-no-mocks-no-stubs-no-fake-data-in-deliverables
# e.g., language:python, library:pydantic
tags:
- system:graph_ui
- topic:workflow-guardrail
- layer:runtime
---

# Guardrail: no mocks, no stubs, no fake data in deliverables

## What

_Define the context or guardrail this pill carries._

A hard prohibition on mock/stub/fake/placeholder implementations in any code an executor delivers. This includes: returning hardcoded fake values instead of real computation, leaving TODO/FIXME stubs in place of logic, fabricated sample data standing in for real data flow, no-op functions pretending to work, commented-out real logic replaced by a shortcut, or tests that assert against invented data instead of the real contract.

## Why

_Explain why this context matters for safe execution._

This ecosystem treats deliverables as production truth. A mock silently breaks the nucleus tesis (real typed data flowing sldb -> sldb.api.graph -> overlay). Mocks pass shallow checks while leaving the contract unimplemented, causing false-green closeouts and drift that surfaces much later. Real wiring is the only acceptable evidence a task is done.

## When

_Describe when an agent should apply this pill._

Applied to every executor and tester dispatch, at all times, for every task. There is no exception where a mock is acceptable as a final deliverable. If real data or a real dependency is genuinely unavailable, the executor must STOP and report the blocker, not paper over it with a mock.

## Where

_Name the files, surfaces, or scope this pill applies to._

All implementation code under apps/, scripts/, src/, and any generated artifacts. Applies to graph_ui and every downstream instance.

## How

_Describe the correct way to apply this guidance._

Wire the real dependency. Derive values from the real source (real model descriptor, real store, real generator output). If a build artifact is needed, generate it with the real generator and commit the real output. Tests must validate the real contract against real generated output, not against inlined fixtures that duplicate the expected answer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not stub a function to return a constant. Do not inline fake node-type definitions to make a test pass. Do not write a test whose expected value is a copy-paste of a hardcoded literal that bypasses the generator. Do not leave TODO placeholders where logic belongs. Do not fabricate data to simulate a data source.

FILE:frontends/desk/board.js
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

FILE:frontends/desk/styles.css
/* deskops UI: tokens from graph_ui DESIGN.md (dark default). No external fonts. */
:root {
  --page: #0b0f16;
  --surface: #101621;
  --surface-subtle: #151d2b;
  --fill-strong: #1b2537;
  --fill-accent: rgba(110, 231, 183, 0.12);
  --fill-warning: rgba(246, 193, 119, 0.10);
  --fill-danger: rgba(247, 118, 142, 0.10);
  --text: #e6edf6;
  --text-2: #cad5e6;
  --muted: #8b9bb4;
  --extra-muted: #56657d;
  --inverse: #0b0f16;
  --accent: #6ee7b7;
  --reference: #7aa2f7;
  --warning: #f6c177;
  --danger: #f7768e;
  --line: #202b3d;
  --line-strong: #2b3a52;
  --sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, "DejaVu Sans Mono", Menlo, Consolas, monospace;
  --r-card: 10px;
  --r-item: 8px;
  --r-nav: 6px;
  color-scheme: dark;
}

* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--page); color: var(--text); }
body { font: 13px/1.5 var(--sans); -webkit-font-smoothing: antialiased; }
code, .mono { font-family: var(--mono); font-size: 11.5px; }
button, select, input { font: inherit; color: inherit; }
a { color: inherit; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
[hidden] { display: none !important; }
.num { font-variant-numeric: tabular-nums; }

/* ---- shell ---- */
.shell {
  display: grid;
  height: 100dvh;
  grid-template-columns: 232px minmax(0, 1fr);
  grid-template-rows: 52px minmax(0, 1fr);
  grid-template-areas: "side top" "side main";
}
.sidebar {
  grid-area: side; display: flex; flex-direction: column; gap: 20px;
  background: var(--surface); border-right: 1px solid var(--line); padding: 16px 12px;
}
.brand { display: flex; align-items: center; gap: 8px; padding: 0 8px; font: 600 12px/1 var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-2); }
.brand-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent); }
.nav { display: flex; flex-direction: column; gap: 2px; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: var(--r-nav);
  color: var(--muted); text-decoration: none; border: 1px solid transparent;
}
.nav-item:hover { background: var(--surface-subtle); color: var(--text); }
.nav-item[aria-current="page"] { background: var(--fill-strong); color: var(--text); border-color: var(--line-strong); }
.nav-item[aria-current="page"] .icon { stroke: var(--accent); }
.icon { width: 16px; height: 16px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; stroke-linecap: round; }
.nav-count { margin-left: auto; font: 11px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.nav-count:empty { display: none; }
.nav-ext { margin-left: auto; color: var(--extra-muted); }
.nav-sep { height: 1px; background: var(--line); margin: 8px 4px; }
.sidebar-foot { margin-top: auto; padding: 0 8px; font-size: 11px; color: var(--extra-muted); }
.sidebar-foot code { font-size: 10.5px; }

.topbar {
  grid-area: top; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 0 20px; background: var(--surface); border-bottom: 1px solid var(--line);
}
.crumbs { display: flex; align-items: center; gap: 12px; min-width: 0; }
.desk-select {
  background: var(--surface-subtle); border: 1px solid var(--line-strong); border-radius: var(--r-nav);
  padding: 4px 8px; font-weight: 600; color: var(--text);
}
.desk-path { color: var(--extra-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-actions { display: flex; align-items: center; gap: 8px; }
.top-chip {
  display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: var(--r-nav);
  background: var(--surface-subtle); border: 1px solid var(--line); color: var(--text-2);
  font: 11.5px var(--mono); text-decoration: none; cursor: pointer;
}
.top-chip:hover { border-color: var(--line-strong); color: var(--text); }

.main { grid-area: main; overflow: auto; padding: 20px 24px 32px; outline: none; }

/* ---- page head ---- */
.page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.eyebrow { font: 11px var(--mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.eyebrow b { color: var(--accent); font-weight: 500; }
h1 { margin: 4px 0 0; font-size: 21px; line-height: 1.3; font-weight: 600; letter-spacing: -0.01em; text-wrap: balance; }
.lede { margin: 4px 0 0; color: var(--muted); max-width: 70ch; }

/* ---- metrics strip (derivable counts only) ---- */
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 18px; }
.metric {
  display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 12px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-item);
}
.metric-label { color: var(--muted); font-size: 12px; }
.metric-value { font: 500 12px var(--mono); color: var(--text); font-variant-numeric: tabular-nums; white-space: nowrap; }
.metric-value.is-unavailable { color: var(--warning); }

/* ---- notices ---- */
.notice {
  border: 1px solid color-mix(in srgb, var(--warning) 40%, transparent); background: var(--fill-warning);
  border-radius: var(--r-item); padding: 8px 12px; margin-bottom: 14px; color: var(--text-2); font-size: 12px;
}
.notice summary { cursor: pointer; color: var(--warning); }
.notice ul { margin: 6px 0 0; padding-left: 18px; }
.notice code { color: var(--warning); }
.notice.is-error { border-color: color-mix(in srgb, var(--danger) 45%, transparent); background: var(--fill-danger); }
.notice.is-error strong { color: var(--danger); }

/* ---- board layout ---- */
.board-layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; align-items: start; }
.board-layout.no-inspector { grid-template-columns: minmax(0, 1fr); }
.board-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.columns { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(260px, 1fr); gap: 12px; overflow-x: auto; padding-bottom: 4px; }
.column { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.column-head {
  display: flex; align-items: center; justify-content: space-between; padding: 6px 10px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-nav);
}
.column-title { display: flex; align-items: center; gap: 8px; font: 500 11.5px var(--mono); letter-spacing: 0.06em; text-transform: uppercase; }
.stage-dot { width: 8px; height: 8px; border-radius: 999px; background: var(--muted); }
.stage-execution { background: var(--warning); }
.stage-testing { background: var(--reference); }
.stage-closeout { background: var(--accent); }
.column-count { font: 11.5px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.column-purpose { padding: 0 4px; font-size: 11.5px; color: var(--muted); }
.column-node { font: 10.5px var(--mono); color: var(--extra-muted); padding: 0 4px; }
.column-empty { padding: 14px 10px; border: 1px dashed var(--line); border-radius: var(--r-item); color: var(--extra-muted); font-size: 12px; text-align: center; }

/* ---- card ---- */
.card {
  display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left; padding: 12px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); cursor: pointer;
  transition: border-color 120ms ease-out;
}
.card:hover { border-color: var(--line-strong); background: var(--surface-subtle); }
.card[aria-pressed="true"] { border-color: color-mix(in srgb, var(--accent) 55%, transparent); background: var(--surface-subtle); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent) 25%, transparent); }
.card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.card-id { font: 11px var(--mono); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.card[aria-pressed="true"] .card-id { color: var(--accent); }
.badge { flex: none; font: 10.5px var(--mono); padding: 1px 6px; border-radius: 4px; background: var(--page); border: 1px solid var(--line); color: var(--text-2); }
.card-title { margin: 0; font-size: 13.5px; font-weight: 500; line-height: 1.4; color: var(--text); text-wrap: pretty; }

.checklist { display: flex; flex-direction: column; gap: 3px; margin: 0; padding: 6px 8px; list-style: none; background: var(--page); border: 1px solid var(--line); border-radius: 6px; font: 11px var(--mono); }
.check { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.check-name { display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.check-state { flex: none; font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase; }
.check-sep { height: 1px; background: var(--line); margin: 2px 0; }
.mark { flex: none; width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.6; }
.is-holds { color: var(--accent); }
.is-pending { color: var(--warning); }
.is-failing { color: var(--danger); }

.chips { display: flex; flex-wrap: wrap; gap: 4px; }
.chip { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 1px 7px; border-radius: 999px; background: var(--page); border: 1px solid var(--line); font: 10.5px var(--mono); color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.chip-dot { width: 5px; height: 5px; border-radius: 999px; background: var(--accent); flex: none; }
.chip-board { color: var(--muted); }
.chip-board .chip-dot { background: var(--muted); }
.atoms { display: flex; flex-direction: column; gap: 2px; font: 10.5px var(--mono); color: var(--muted); }
.atom-line { display: flex; align-items: center; gap: 5px; min-width: 0; }
.atom-line span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lock { width: 11px; height: 11px; flex: none; fill: none; stroke: var(--warning); stroke-width: 1.5; }
.card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 2px; font: 10.5px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }

/* ---- drawer lane ---- */
.lane { padding: 14px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); }
.lane-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.lane-title { display: flex; align-items: baseline; gap: 10px; }
.lane-title h2 { margin: 0; font-size: 14px; font-weight: 600; }
.lane-title span { color: var(--muted); font-size: 12px; }
.lane-link { font: 11.5px var(--mono); color: var(--muted); text-decoration: none; }
.lane-link:hover { color: var(--text); }
.lane-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.lane-item { display: flex; flex-direction: column; gap: 4px; padding: 10px; background: var(--surface-subtle); border: 1px solid var(--line); border-radius: var(--r-item); min-width: 0; }
.lane-item-top { display: flex; justify-content: space-between; gap: 8px; font: 10.5px var(--mono); color: var(--muted); }
.lane-item-top span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lane-item p { margin: 0; font-size: 12.5px; color: var(--text); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

/* ---- inspector ---- */
.inspector {
  display: flex; flex-direction: column; gap: 14px; padding: 16px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card);
}
.insp-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.insp-ids { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.insp-id { font: 11px var(--mono); color: var(--accent); word-break: break-all; }
.insp-stage { font: 11px var(--mono); color: var(--muted); }
.icon-btn { background: none; border: 1px solid transparent; border-radius: var(--r-nav); color: var(--muted); padding: 2px 6px; cursor: pointer; }
.icon-btn:hover { color: var(--text); border-color: var(--line); }
.insp-title { margin: 0; font-size: 17px; line-height: 1.35; font-weight: 600; text-wrap: balance; }
.insp-goal { margin: 0; color: var(--text-2); font-size: 13px; line-height: 1.6; text-wrap: pretty; white-space: pre-line; }
.insp-goal.is-clamped { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
.link-btn { align-self: flex-start; margin-top: -8px; padding: 0; background: none; border: none; color: var(--reference); font-size: 12px; cursor: pointer; }
.section { display: flex; flex-direction: column; gap: 6px; }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; font: 500 11px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-2); }
.section-head small { font-size: 10.5px; letter-spacing: 0; text-transform: none; color: var(--muted); }
.box { padding: 8px 10px; background: var(--surface-subtle); border: 1px solid var(--line); border-radius: var(--r-item); display: flex; flex-direction: column; gap: 4px; }
.box-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12.5px; }
.box-row strong { font-weight: 500; display: flex; align-items: center; gap: 6px; min-width: 0; }
.box p, .box li { margin: 0; font-size: 11.5px; color: var(--muted); }
.box ul { margin: 0; padding-left: 16px; }
.box code { font-size: 10.5px; color: var(--text-2); word-break: break-all; }
.kv { display: grid; grid-template-columns: 70px 1fr; gap: 2px 8px; font-size: 11.5px; }
.kv dt { color: var(--extra-muted); font-family: var(--mono); font-size: 10.5px; }
.kv dd { margin: 0; color: var(--text-2); white-space: pre-line; }
.muted { color: var(--muted); }
.empty-note { font-size: 12px; color: var(--extra-muted); }

.actions { display: flex; flex-direction: column; gap: 8px; padding-top: 4px; border-top: 1px solid var(--line); }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 7px 12px;
  border-radius: var(--r-nav); border: 1px solid var(--line-strong); background: var(--surface-subtle); color: var(--text); cursor: pointer;
}
.btn:hover:not(:disabled) { border-color: var(--muted); }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--inverse); font-weight: 600; }
.btn-primary:hover:not(:disabled) { background: #8af0c8; }
.btn:disabled { cursor: not-allowed; opacity: 0.55; }
.disabled-action { display: flex; flex-direction: column; gap: 2px; }
.disabled-action .btn { justify-content: flex-start; }
.disabled-action small { padding-left: 2px; font-size: 11px; color: var(--extra-muted); }
.action-status { font-size: 12px; }
.action-status.is-error { color: var(--danger); }
.action-status.is-ok { color: var(--accent); }
.insp-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; font: 10.5px var(--mono); color: var(--extra-muted); }
.insp-foot a { color: var(--reference); text-decoration: none; }

/* ---- placeholders & states ---- */
.placeholder { max-width: 640px; padding: 20px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); }
.placeholder h1 { margin-top: 0; }
.placeholder p { color: var(--text-2); }
.loading { color: var(--muted); }

/* ---- dialog ---- */
.confirm { border: 1px solid var(--line-strong); border-radius: var(--r-card); background: var(--surface); color: var(--text); padding: 18px; max-width: 460px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5); }
.confirm::backdrop { background: rgba(5, 8, 12, 0.6); }
.confirm h2 { margin: 0 0 8px; font-size: 15px; }
.confirm p { margin: 0 0 16px; color: var(--text-2); }
.confirm code { color: var(--accent); word-break: break-all; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 8px; }

@media (max-width: 1180px) {
  .board-layout { grid-template-columns: minmax(0, 1fr); }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
.inspector > * { flex-shrink: 0; }

.pill-item { display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; background: var(--surface-subtle); border: 1px solid var(--line); border-radius: var(--r-item); }
.pill-item p { margin: 0; font-size: 12px; color: var(--text-2); }
.pill-item .kv dd { font-size: 11.5px; color: var(--muted); }
.board-pills summary { cursor: pointer; font: 11px var(--mono); color: var(--muted); }
.board-pills[open] summary { margin-bottom: 6px; }
.board-pills .pill-item { background: var(--surface); margin-top: 6px; }
.actions { position: sticky; bottom: -32px; border-radius: 0 0 var(--r-card) var(--r-card); margin: 0 -16px -16px; padding: 12px 16px 14px; background: var(--surface); border-top: 1px solid var(--line); }
.disabled-actions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.disabled-action { flex-direction: row; align-items: center; gap: 8px; }
.btn-small { flex: none; padding: 3px 8px; font-size: 12px; }
.disabled-action small { padding: 0; }
.more summary { cursor: pointer; font-size: 11px; color: var(--reference); list-style: none; }
.more summary::-webkit-details-marker { display: none; }

/* ---- shared additions (UI04-UI06) ---- */
.lane-item { text-decoration: none; color: inherit; }
.lane-item:hover { border-color: var(--line-strong); }
.chip-warning { border-color: color-mix(in srgb, var(--warning) 45%, transparent); color: var(--warning); background: var(--fill-warning); }
.chip-icon { width: 11px; height: 11px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linejoin: round; }
.open-doc { align-self: flex-start; font-size: 12px; color: var(--reference); text-decoration: none; }
.open-doc:hover { text-decoration: underline; }
.task-link { font-family: var(--mono); font-size: 11.5px; color: var(--reference); text-decoration: none; margin-right: 10px; word-break: break-all; }
.task-link:hover { text-decoration: underline; }
.metrics-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mono { font-family: var(--mono); font-size: 11.5px; }

/* ---- prose (markdown-lite) ---- */
.prose p { margin: 0 0 10px; }
.prose p:last-child { margin-bottom: 0; }
.prose ul, .prose ol { margin: 0 0 10px; padding-left: 20px; }
.prose li { margin: 2px 0; }
.prose code { font-family: var(--mono); font-size: 0.88em; padding: 0 4px; border-radius: 4px; background: var(--fill-strong); color: var(--text-2); word-break: break-word; }
.prose strong { color: var(--text); font-weight: 600; }
.prose-heading { margin: 12px 0 6px; font-size: 13px; font-weight: 600; color: var(--text); }
.code-block { margin: 0 0 10px; padding: 10px 12px; background: var(--page); border: 1px solid var(--line); border-radius: var(--r-item); overflow-x: auto; }
.code-block code { background: none; padding: 0; font-size: 11.5px; line-height: 1.55; }
.doc-prose { font-size: 13.5px; line-height: 1.65; color: var(--text-2); text-wrap: pretty; }

/* ---- task page (UI04) ---- */
.doc-layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 24px; align-items: start; }
.doc-rail { position: sticky; top: 0; display: flex; flex-direction: column; gap: 2px; padding-right: 12px; border-right: 1px solid var(--line); min-height: 60dvh; }
.rail-head { display: flex; align-items: center; gap: 8px; margin: 12px 0 4px; font: 500 10.5px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.rail-head:first-child { margin-top: 0; }
.rail-count { margin-left: auto; font-variant-numeric: tabular-nums; }
.rail-item { display: flex; gap: 8px; padding: 5px 8px; border-radius: var(--r-nav); color: var(--muted); text-decoration: none; font-size: 12.5px; border: 1px solid transparent; min-width: 0; }
.rail-item:hover { background: var(--surface-subtle); color: var(--text); }
.rail-item[aria-current="page"] { background: var(--fill-strong); color: var(--text); border-color: var(--line-strong); }
.rail-ext { flex: none; font: 10.5px var(--mono); color: var(--accent); padding-top: 2px; }
.rail-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-wrap { min-width: 0; }
.doc { max-width: 820px; margin: 0 auto; padding-bottom: 24px; display: flex; flex-direction: column; gap: 22px; }
.doc-crumbs { font: 11px var(--mono); color: var(--muted); }
.doc-crumbs a { color: var(--muted); }
.doc-crumbs span { color: var(--text-2); }
.frontmatter { margin: 0; padding: 12px 14px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); font: 11.5px/1.7 var(--mono); white-space: pre-wrap; word-break: break-all; }
.fm-rule { color: var(--extra-muted); }
.fm-key { color: var(--muted); }
.fm-value { color: var(--reference); }
.doc-title { margin: 0; font-size: 28px; line-height: 1.25; font-weight: 600; letter-spacing: -0.015em; text-wrap: balance; }
.doc-section { display: flex; flex-direction: column; gap: 10px; }
.doc-h2 { display: flex; align-items: baseline; gap: 10px; margin: 0; padding-bottom: 8px; border-bottom: 1px solid var(--line); font-size: 16px; font-weight: 600; }
.doc-h2 small { margin-left: auto; font: 11px var(--mono); color: var(--muted); font-weight: 400; }
.doc-num { font: 11px var(--mono); color: var(--extra-muted); }
.doc-list { font-size: 13.5px; color: var(--text-2); }
.kv-wide { grid-template-columns: 110px 1fr; font-size: 12.5px; }
.callout { padding: 10px 14px; background: var(--surface); border: 1px solid var(--line); border-left: 2px solid var(--accent); border-radius: var(--r-item); display: flex; flex-direction: column; gap: 6px; }
.callout-head code { color: var(--accent); }
.callout-title { margin: 0; font-size: 13px; color: var(--text); }
.doc-atom { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-item); }
.doc-atom .lock { margin-top: 3px; }
.doc-atom > div { min-width: 0; font-size: 13px; }
.wiki-link { color: var(--accent); }
.doc-atom .prose { margin-top: 6px; }
.chip-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.chip-label { width: 90px; font: 10.5px var(--mono); color: var(--extra-muted); }
.doc-end { font: 10.5px var(--mono); color: var(--extra-muted); padding-top: 8px; border-top: 1px solid var(--line); }
.doc-footer {
  position: sticky; bottom: -32px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  margin: 0 -24px -32px; padding: 10px 24px; background: var(--surface); border-top: 1px solid var(--line);
}
.doc-footer-state { display: flex; align-items: center; gap: 10px; font: 11.5px var(--mono); color: var(--text-2); min-width: 0; }
.doc-footer-actions { display: flex; align-items: center; gap: 12px; }
.doc-footer-actions .action-status { margin: 0; }
.state-dot { width: 8px; height: 8px; border-radius: 999px; background: currentColor; }

/* ---- split list + panel (UI05) ---- */
.split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 16px; align-items: start; }
.split-list { display: flex; flex-direction: column; gap: 8px; }
.list-card {
  display: flex; flex-direction: column; gap: 6px; width: 100%; text-align: left; padding: 12px 14px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); cursor: pointer;
}
.list-card:hover { border-color: var(--line-strong); background: var(--surface-subtle); }
.list-card[aria-pressed="true"] { border-color: color-mix(in srgb, var(--accent) 55%, transparent); background: var(--surface-subtle); }
.list-card-top, .list-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.file-name { display: inline-flex; align-items: center; gap: 6px; min-width: 0; font: 11px var(--mono); color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.list-excerpt { margin: 0; font-size: 12px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.list-date { flex: none; font: 10.5px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }
.route-chip { font: 10.5px var(--mono); padding: 1px 6px; border-radius: 4px; background: var(--page); border: 1px solid var(--line); color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.badge-open { color: var(--warning); border-color: color-mix(in srgb, var(--warning) 40%, transparent); }
.split-panel { position: sticky; top: 0; display: flex; flex-direction: column; gap: 14px; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-card); min-width: 0; }
.panel-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.command { margin: 0; padding: 10px 12px; background: var(--page); border: 1px solid var(--line); border-radius: var(--r-item); font: 11.5px/1.6 var(--mono); color: var(--accent); white-space: pre-wrap; word-break: break-all; }
.command-actions { display: flex; align-items: center; gap: 10px; }
.copy-status { font-size: 12px; color: var(--muted); }
.copy-status.is-ok { color: var(--accent); }
.copy-status.is-error { color: var(--danger); }
.raw-md { margin: 0; max-height: 60dvh; overflow: auto; padding: 12px; background: var(--page); border: 1px solid var(--line); border-radius: var(--r-item); font: 11.5px/1.6 var(--mono); color: var(--text-2); white-space: pre-wrap; word-break: break-word; }
.filters { display: flex; gap: 6px; margin-bottom: 12px; }
.filter { display: inline-flex; gap: 8px; padding: 5px 10px; border-radius: var(--r-nav); border: 1px solid var(--line); background: var(--surface); color: var(--muted); text-decoration: none; font-size: 12px; }
.filter[aria-current="true"] { color: var(--text); border-color: var(--line-strong); background: var(--fill-strong); }
.filter .num { font-family: var(--mono); font-size: 11px; color: var(--muted); }
.note-body { max-height: 50dvh; overflow: auto; }
.panel-actions { position: static; margin: 0; padding: 12px 0 0; background: none; }
.action-row { display: flex; gap: 8px; }

/* ---- tables (UI06) ---- */
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: var(--r-card); background: var(--surface); }
.table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.table th { text-align: left; padding: 8px 12px; font: 500 10.5px var(--mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--line); }
.table td { padding: 7px 12px; border-bottom: 1px solid var(--line); color: var(--text-2); vertical-align: top; }
.table tr:last-child td { border-bottom: none; }
.table td.mono { word-break: break-all; }
.worker-status { font: 10.5px var(--mono); padding: 1px 6px; border-radius: 4px; border: 1px solid var(--line); }
.status-working { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.status-idle { color: var(--text-2); }
.status-done { color: var(--muted); }
.status-blocked { color: var(--warning); border-color: color-mix(in srgb, var(--warning) 40%, transparent); }
.main[data-screen="agents"] .section { margin-bottom: 18px; }

@media (max-width: 1180px) {
  .split, .doc-layout { grid-template-columns: minmax(0, 1fr); }
  .doc-rail { position: static; min-height: 0; border-right: none; }
  .split-panel { position: static; }
}

FILE:tests/test_desk_ui_routes.py
"""Real HTTP tests for frontends/desk/serve.py (the deskops UI server).

Each /api/view/* must return exactly what `deskops view` returns for the same
temporary desk; only POST /api/desk/advance writes; the server binds loopback;
the shell loads no external URL.
"""
import json
from pathlib import Path
import re
import subprocess
import sys
import threading
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import pytest

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)

pytest.importorskip('deskops.cli.commands.view', reason='this deskops has no `deskops view` (deskops UI01)')

import deskops  # noqa: E402
from deskops.bootstrap import SLDBBootstrap  # noqa: E402
from deskops.lifecycle import write_lifecycle_graph  # noqa: E402
from deskops.operations import DeskopsOperations  # noqa: E402
from deskops.workspace import seed_desk  # noqa: E402
from desk import serve as desk_serve  # noqa: E402
from desk_receipts import accept_activation_receipts  # noqa: E402
from deskops_viewdocs import install_views  # noqa: E402

DESK_DIR = Path(desk_serve.__file__).resolve().parent
MISSING_HERDR = 'herdr-missing-for-tests'


def _git(root, *argv):
    subprocess.run(['git', *argv], cwd=root, check=True, capture_output=True)


def _make_desk(root, titles):
    root.mkdir(parents=True)
    _git(root, 'init', '-q')
    _git(root, 'config', 'user.name', 'test')
    _git(root, 'config', 'user.email', 'test@example.com')
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)
    ids = [ops.create_task_bundle({
        'title': title, 'goal': f'Objetivo de {title}', 'scope': 's', 'implementation_path': 'i',
        'validation': ['pytest'], 'done_when': 'd', 'task_type': 'code',
    }).task_id for title in titles]
    for ident in ids:
        accept_activation_receipts(root, ident)
    install_views(root)
    return ops, ids


@pytest.fixture
def desk_env(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'repo'
    ops, ids = _make_desk(root, ['Primera tarea', 'Segunda tarea'])
    assert ops.advance_task(ids[1])[1].progressed
    other = tmp_path / 'other'
    _make_desk(other, ['Tarea del otro desk'])
    (tmp_path / 'nodesk').mkdir()
    # Registry entries are written by deskops (desk/registry/repo-<name>.md, id repo-<name>).
    for name, path in (('main', root), ('other', other), ('nodesk', tmp_path / 'nodesk')):
        ops.create_artifact('artifact.repository', {
            'name': name, 'path': str(path), 'status': 'active', 'description': 'd', 'tags': [],
        })
    return root, other, ids


@pytest.fixture
def server(desk_env):
    root, _, _ = desk_env
    instance = desk_serve.make_server(0, root, herdr=MISSING_HERDR)
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield instance, f'http://127.0.0.1:{instance.server_port}'
    instance.shutdown()
    instance.server_close()
    thread.join()


def _request(url, method='GET', body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None
    req = Request(url, data=data, method=method, headers={'Content-Type': 'application/json', **(headers or {})})
    try:
        resp = urlopen(req, timeout=60)
    except HTTPError as exc:
        resp = exc
    with resp:
        raw = resp.read()
        return resp.status, (json.loads(raw) if raw else None)


def _cli_view(root, *argv):
    env_path = str(Path(deskops.__file__).resolve().parent.parent)
    result = subprocess.run(
        [sys.executable, '-m', 'deskops', 'view', *argv, '--root', str(root), '--format', 'json'],
        capture_output=True, text=True, env={**__import__('os').environ, 'PYTHONPATH': env_path},
    )
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_each_view_route_returns_exactly_what_deskops_view_returns(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    for view in ('board', 'drawer', 'inbox'):
        status, data = _request(f'{base}/api/view/{view}')
        assert status == 200
        assert data == _cli_view(root, view)
    status, data = _request(f'{base}/api/view/task?id={ids[0]}')
    assert status == 200
    assert data == _cli_view(root, 'task', ids[0])
    status, data = _request(f'{base}/api/view/agents')
    assert status == 200
    assert data == _cli_view(root, 'agents', '--herdr', MISSING_HERDR)
    assert data['workers'] is None and data['workers_error']


def test_desk_selector_lists_registry_desks_with_a_desk_and_routes_views(desk_env, server):
    root, other, _ = desk_env
    _, base = server
    status, data = _request(f'{base}/api/desks')
    assert status == 200
    assert [(d['id'], d['path'], d['default']) for d in data['desks']] == [
        ('repo-main', str(root), True), ('repo-other', str(other), False)]
    status, board = _request(f'{base}/api/view/board?desk=repo-other')
    assert status == 200 and board == _cli_view(other, 'board')
    status, error = _request(f'{base}/api/view/board?desk=repo-nodesk')
    assert status == 404 and 'repo-nodesk' in error['error']


def test_view_errors_are_visible_with_cause(server):
    _, base = server
    status, data = _request(f'{base}/api/view/task?id=task-no-existe')
    assert status == 404 and 'task-no-existe' in data['error']
    status, data = _request(f'{base}/api/view/task')
    assert status == 400
    status, data = _request(f'{base}/api/view/nope')
    assert status == 404


def test_non_get_methods_are_rejected_except_advance(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    before = (root / 'desk/tasks/Board.md').read_bytes()
    for method in ('POST', 'PUT', 'PATCH', 'DELETE'):
        status, data = _request(f'{base}/api/view/board', method=method, body={})
        assert status == 405, method
    status, _ = _request(f'{base}/api/desk/board', method='POST', body={})
    assert status == 405
    assert (root / 'desk/tasks/Board.md').read_bytes() == before


def test_advance_delegates_to_desk_routes_with_revision_guard(desk_env, server):
    root, _, ids = desk_env
    _, base = server
    _, view = _request(f'{base}/api/view/task?id={ids[0]}')
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': 'stale'})
    assert status == 409 and 'cambió' in data['error']
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': view['revision']})
    assert status == 200 and data['task']['current_node'] == 'ritual-testing'
    task, _ = DeskopsOperations(root).show_task(ids[0])
    assert task.current_node == 'ritual-testing'


def test_board_comes_from_sldb_serve_and_projects_to_deskops_view(desk_env, server):
    """c6: GET /views/board of the desk's sldb serve is run_view's result (`sldb views run`,
    in its own process like the CLI: the process that wrote the store keeps sldb caches that
    give another revision for the same rows), and deskops' projection of it is
    `deskops view board`."""
    from deskops.cli.commands.view import project

    root, _, _ = desk_env
    instance, base = server
    url = instance.RequestHandlerClass.views.serves.url(root)
    with urlopen(f'{url}/views/board', timeout=60) as resp:
        etag = resp.headers.get('ETag')
        raw = json.loads(resp.read())
    run = subprocess.run([sys.executable, '-m', 'sldb', 'views', 'run', 'board', '--store', str(root / '.sldb'), '--format', 'json'],
                         capture_output=True, text=True, check=True)
    assert raw == json.loads(run.stdout)
    assert etag == f'"{raw["revision"]}"'
    assert project('board', raw, root) == _cli_view(root, 'board')
    status, data = _request(f'{base}/api/view/board')
    assert status == 200 and data == _cli_view(root, 'board')


def test_advance_with_the_etag_read_before_an_edit_is_409(desk_env, server):
    from deskops.cli.main import main as deskops_main

    root, _, ids = desk_env
    _, base = server
    _, view = _request(f'{base}/api/view/task?id={ids[0]}')
    assert deskops_main(['edit', 'task', ids[0], 'goal', 'Objetivo cambiado', '--root', str(root)]) == 0
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': view['revision']})
    assert status == 409 and 'cambió' in data['error']
    assert DeskopsOperations(root).show_task(ids[0])[0].current_node == 'ritual-execution'
    _, fresh = _request(f'{base}/api/view/task?id={ids[0]}')
    assert fresh['revision'] != view['revision'] and fresh['task']['goal'] == 'Objetivo cambiado'
    # With the fresh ETag the guard lets the advance through; the edit changed the task's
    # contract, so its activation receipts are no longer intact and the rule holds it back.
    status, data = _request(f'{base}/api/desk/advance', 'POST', {'id': ids[0], 'revision': fresh['revision']})
    assert status == 409 and 'cambió' not in data['error'] and 'rule-activation' in data['error']


def test_sldb_serve_down_is_a_502_with_its_cause(desk_env):
    import socket

    root, _, _ = desk_env
    with socket.socket() as probe:
        probe.bind(('127.0.0.1', 0))
        port = probe.getsockname()[1]
    instance = desk_serve.make_server(0, root, herdr=MISSING_HERDR, sldb_url=f'http://127.0.0.1:{port}')
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    try:
        status, data = _request(f'http://127.0.0.1:{instance.server_port}/api/view/board')
        assert status == 502 and 'sldb serve' in data['error']
    finally:
        instance.shutdown()
        instance.server_close()
        thread.join()


def test_server_binds_loopback_only(server):
    instance, _ = server
    assert instance.server_address[0] == '127.0.0.1'


def test_shell_files_are_served_and_have_no_external_urls(server):
    _, base = server
    for name in ('index.html', 'app.js', 'styles.css'):
        text = (DESK_DIR / name).read_text(encoding='utf-8')
        urls = re.findall(r'https?://[^\s\'"`)]+', text)
        # Loopback only; the SVG namespace URI is an identifier, not a fetch.
        allowed = r'https?://(127\.0\.0\.1|localhost)[:/]|http://www\.w3\.org/2000/svg$'
        assert all(re.match(allowed, url) for url in urls), (name, urls)
        assert '@import' not in text and 'cdn' not in text.lower()
        with urlopen(f'{base}/{name}', timeout=10) as resp:
            assert resp.status == 200
    status, _ = _request(f'{base}/serve.py')
    assert status == 404


# ---------------------------------------------------------------- inbox actions (UI05)
@pytest.fixture
def inbox_env(tmp_path, monkeypatch):
    """A desk without registry entries, so `message ack` resolves its identity from the desk."""
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'inbox-desk'
    _make_desk(root, ['Una tarea'])
    instance = desk_serve.make_server(0, root, herdr=MISSING_HERDR)
    thread = threading.Thread(target=instance.serve_forever, daemon=True)
    thread.start()
    yield root, f'http://127.0.0.1:{instance.server_port}'
    instance.shutdown()
    instance.server_close()
    thread.join()


def _send(root, title, body='Cuerpo de la nota.'):
    from deskops.cli.main import main as deskops_main

    assert deskops_main(['message', 'send', '--root', str(root), '--title', title, '--kind', 'suggestion', body]) == 0
    return next(p for p in (root / 'desk/inbox').glob('*.md') if p.stem.endswith('-' + title.lower().replace(' ', '-')))


def _note(base, stem):
    _, inbox = _request(f'{base}/api/view/inbox')
    return next(note for note in inbox['notes'] if note['id'] == stem)


def test_inbox_ack_runs_message_ack_with_revision_guard(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Nota para reconocer')
    note = _note(base, path.stem)
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': 'vieja'})
    assert status == 409 and 'cambió' in data['error']
    assert _note(base, path.stem)['acknowledged'] is False
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision']})
    assert status == 200 and data['ok'] is True
    listed = subprocess.run(
        [sys.executable, '-m', 'deskops', 'message', 'list', '--root', str(root), '--format', 'json'],
        capture_output=True, text=True, env={**__import__('os').environ, 'PYTHONPATH': str(Path(deskops.__file__).resolve().parent.parent)},
    )
    entry = next(n for n in json.loads(listed.stdout)['notes'] if n['id'] == path.stem)
    assert entry['status'] == 'closed'
    status, data = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': _note(base, path.stem)['revision']})
    assert status == 409 and 'already acknowledged' in data['error']


def test_inbox_promote_runs_promote_inbox_to_drawer_task(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Idea para el drawer')
    note = _note(base, path.stem)
    status, data = _request(f'{base}/api/inbox/promote', 'POST', {'note': path.stem, 'revision': note['revision']})
    assert status == 200, data
    assert not path.exists()
    assert (root / 'desk/drawer/tasks/task-idea-para-el-drawer.md').is_file()
    _, drawer = _request(f'{base}/api/view/drawer')
    assert any(entry['id'] == 'task-idea-para-el-drawer' for entry in drawer['tasks'])


def test_inbox_actions_validate_request(inbox_env):
    root, base = inbox_env
    path = _send(root, 'Nota protegida')
    note = _note(base, path.stem)
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': 'no-existe', 'revision': 'x'})
    assert status == 404
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': '../tasks/Board', 'revision': 'x'})
    assert status == 404
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision'], 'extra': 'x'})
    assert status == 400
    status, _ = _request(f'{base}/api/inbox/ack', 'POST', {'note': path.stem, 'revision': note['revision']},
                         headers={'Origin': 'http://evil.example'})
    assert status == 403
    assert _note(base, path.stem)['acknowledged'] is False

FILE:tests/e2e_desk_ui.py
"""Real browser over the real deskops UI server and a disposable desk; no intercepted requests.

UI03 Board, UI04 Tarea, UI05 Drawer e Inbox, UI06 Agentes: what the page shows equals
`deskops view` for the same desk, the writes go through deskops operations with their
revision guards, keyboard focus is visible, and no Stitch example string appears.
"""
import json
from pathlib import Path
import subprocess
import sys
import threading

import pytest
from playwright.sync_api import expect, sync_playwright

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)

pytest.importorskip('deskops.cli.commands.view', reason='this deskops has no `deskops view` (deskops UI01)')

from deskops.bootstrap import SLDBBootstrap  # noqa: E402
from deskops.cli.main import main as deskops_main  # noqa: E402
from deskops.lifecycle import write_lifecycle_graph  # noqa: E402
from deskops.operations import DeskopsOperations  # noqa: E402
from deskops.cli.commands import view as deskops_view  # noqa: E402
from deskops.runtime.desk_agents import agents_view  # noqa: E402
from deskops.workspace import seed_desk  # noqa: E402
from desk import serve as desk_serve  # noqa: E402
from desk_receipts import accept_activation_receipts  # noqa: E402
from deskops_viewdocs import install_views  # noqa: E402

STITCH_STRINGS = (
    'TASK-104', 'TASK-108', 'TASK-112', '85.7%', 'draft_spec_v2_syntax', 'atom-sldb-is-read-write-edit-surface',
    'Worker #2', 'session_token_ephemeral_ttl', 'DRAFT-019', 'desk-live-alpha', 'TTL:', 'v0.14.8', '@dev',
    'REQ-042', 'arch-lead', 'SIGNED_ED25519', 'draft-declarative-event-trees', 'MADUREZ', '94.2%', 'Lineage',
)
HERDR = 'herdr-missing-for-e2e'


@pytest.fixture
def desk(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'desk-e2e'
    root.mkdir()
    for argv in (('init', '-q'), ('config', 'user.name', 'test'), ('config', 'user.email', 'test@example.com')):
        subprocess.run(['git', *argv], cwd=root, check=True, capture_output=True)
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    def task(title, **extra):
        return ops.create_task_bundle({
            'title': title, 'why': f'Porque {title} hace falta.', 'goal': f'Objetivo: {title}.', 'scope': 'Solo el desk temporal.',
            'implementation_path': 'Leer la vista y dibujarla.', 'validation': ['pytest -q tests/e2e_desk_ui.py'],
            'done_when': 'La pantalla coincide con deskops view.', 'task_type': 'code', **extra,
        }).task_id

    first = task('Preparar la vista', pills=['pill-que-no-existe'])
    second = task('Probar la vista')
    for ident in (first, second):
        accept_activation_receipts(root, ident)
    # Since deskops CC32 a task activates only with its dependencies closed, so `second`
    # reaches ritual-testing first and gets its still-open dependency afterwards: the board
    # shows a tested task whose dependency is in execution.
    assert ops.advance_task(second)[1].progressed
    ops.edit_artifact_field('task', second, 'depends_on', json.dumps([first]))
    for title in ('Idea diferida', 'Pregunta abierta', 'Nota que cambia'):
        assert deskops_main(['message', 'send', '--root', str(root), '--title', title, '--kind', 'suggestion', f'Cuerpo de {title}.']) == 0
    deferred = next(p for p in (root / 'desk/inbox').glob('*idea-diferida.md'))
    assert deskops_main(['promote', 'inbox-to-drawer-task', deferred.name, '--root', str(root)]) == 0
    index = root / 'runs/subagents/index.jsonl'
    index.parent.mkdir(parents=True)
    index.write_text(
        json.dumps({'task_id': 'task-que-ya-cerro', 'run_id': None, 'run_dir': 'runs/subagents/vieja', 'commit': None}) + '\n'
        + json.dumps({'task_id': first, 'run_id': None, 'run_dir': None, 'mode': 'manual', 'commit': None}) + '\n',
        encoding='utf-8',
    )
    install_views(root)
    server = desk_serve.make_server(0, root, herdr=HERDR)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield {'url': f'http://127.0.0.1:{server.server_port}/', 'root': root, 'ops': ops, 'first': first, 'second': second}
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@pytest.fixture
def browser_page():
    with sync_playwright() as pw:
        expect.set_options(timeout=60000)
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={'width': 1600, 'height': 1000}, permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        yield page
        assert errors == []
        browser.close()


def _no_stitch(page):
    content = page.content()
    for fake in STITCH_STRINGS:
        assert fake not in content, fake


def _focus_visible(page, locator):
    locator.focus()
    page.keyboard.press('Tab')
    page.keyboard.press('Shift+Tab')
    return locator.evaluate('e => getComputedStyle(e).outlineStyle') not in ('', 'none')


def _card(page, task_id):
    return page.locator(f'.card[data-task-id="{task_id}"]')


def _column(page, node):
    return page.locator(f'.column[data-node="{node}"]')


def _confirm(page):
    expect(page.locator('#confirm')).to_be_visible()
    page.locator('#confirm-ok').click()


# ---------------------------------------------------------------- UI03 Board
def test_board_columns_gates_advance_conflict_focus(desk, browser_page):
    page, root, ops, first, second = browser_page, desk['root'], desk['ops'], desk['first'], desk['second']
    page.goto(desk['url'])
    expect(_card(page, first)).to_be_visible()

    board = deskops_view.board_view(root)
    expect(page.locator('.column')).to_have_count(len(board['columns']))
    assert page.locator('.column').evaluate_all('els => els.map(e => e.dataset.node)') == [c['node'] for c in board['columns']]
    expect(_column(page, 'ritual-execution').locator(f'.card[data-task-id="{first}"]')).to_have_count(1)
    expect(_column(page, 'ritual-testing').locator(f'.card[data-task-id="{second}"]')).to_have_count(1)
    for column in board['columns']:
        expect(_column(page, column['node']).get_by_test_id('column-count')).to_have_text(str(column['count']))
        for card in column['tasks']:
            rendered = _card(page, card['id'])
            expect(rendered.get_by_test_id('gate-count')).to_have_text(f"gates {card['gates_holding']}/{card['gates_total']}")
            states = rendered.locator('.check').evaluate_all('els => els.map(e => e.dataset.state)')
            expected = [('holds' if gate['holds'] else 'pending') for gate in card['gates']]
            expected += [item['state'] for item in card['closeout']['evidence']]
            assert states == expected
    # The unresolved pill is an amber chip on its own card, not on the other one.
    expect(_card(page, first).get_by_test_id('unresolved-chip')).to_have_text('pill-que-no-existe')
    expect(_card(page, second).get_by_test_id('unresolved-chip')).to_have_count(0)

    assert _focus_visible(page, _card(page, first))
    page.keyboard.press('Enter')
    inspector = page.get_by_test_id('inspector')
    expect(inspector).to_contain_text('Preparar la vista')
    expect(page.locator('#advance')).to_be_enabled()
    ops.edit_artifact_field('task', first, 'scope', 'Cambiado fuera de la UI.')
    page.locator('#advance').click()
    _confirm(page)
    expect(page.get_by_test_id('action-status')).to_contain_text('Conflicto')
    assert ops.show_task(first)[0].current_node == 'ritual-execution'
    # The edit changed the contract the receipts were taken over: they are no longer
    # intact, so the operator reviews it again before advancing.
    accept_activation_receipts(root, first)

    page.locator('#refresh').click()
    expect(page.get_by_test_id('action-status')).to_have_count(0)
    assert _focus_visible(page, page.locator('#advance'))
    page.locator('#advance').click()
    _confirm(page)
    expect(_column(page, 'ritual-testing').locator(f'.card[data-task-id="{first}"]')).to_have_count(1)
    expect(_column(page, 'ritual-execution').locator('.card')).to_have_count(0)
    assert ops.show_task(first)[0].current_node == 'ritual-testing'
    for reason in ('runtime dispatch', 'graduación', 'diferir'):
        expect(inspector).to_contain_text(reason)
    expect(page.locator('.lane')).to_contain_text('Idea diferida')
    _no_stitch(page)


# ---------------------------------------------------------------- UI04 Tarea
def test_task_page_sections_inheritance_and_advance(desk, browser_page):
    page, root, ops, first, second = browser_page, desk['root'], desk['ops'], desk['first'], desk['second']
    page.goto(f"{desk['url']}#/task?id={second}")
    doc = page.get_by_test_id('task-doc')
    view = deskops_view.task_view(root, second)['task']
    expect(doc.locator('.doc-title')).to_have_text(view['title'])
    for field in ('why', 'goal', 'scope', 'implementation_path', 'done_when'):
        expect(page.get_by_test_id(f'section-{field}')).to_contain_text(view[field])
    for item in view['validation']:
        expect(page.get_by_test_id('section-validation')).to_contain_text(item)
    expect(page.get_by_test_id('frontmatter')).to_contain_text(f"current_node: {view['current_node']}")
    _no_stitch(page)

    link = page.get_by_test_id('depends-link')
    expect(link).to_have_text(first)
    assert _focus_visible(page, link)
    link.click()
    expect(doc.locator('.doc-title')).to_have_text('Preparar la vista')
    assert first in page.url

    footer = page.get_by_test_id('doc-footer')
    expect(footer).to_contain_text('gates 1/1')
    footer.locator('#advance').click()
    _confirm(page)
    expect(page.get_by_test_id('action-status')).to_contain_text('ritual-testing')
    assert ops.show_task(first)[0].current_node == 'ritual-testing'
    expect(page.get_by_test_id('frontmatter')).to_contain_text('current_node: ritual-testing')
    _no_stitch(page)


# ---------------------------------------------------------------- UI05 Drawer e Inbox
def test_drawer_lists_disk_and_copies_the_exact_command(desk, browser_page):
    page, root = browser_page, desk['root']
    page.goto(f"{desk['url']}#/drawer")
    view = deskops_view.drawer_view(root)
    files = sorted(p for p in (root / 'desk/drawer/tasks').glob('*.md') if p.name not in {'Board.md', 'README.md'})
    assert [entry['path'] for entry in view['tasks']] == [p.relative_to(root).as_posix() for p in files]
    expect(page.locator('[data-entry-id]')).to_have_count(len(files))
    entry = view['tasks'][0]
    page.locator(f'[data-entry-id="{entry["id"]}"]').click()
    expect(page.get_by_test_id('drawer-command')).to_have_text(entry['command'])
    assert page.get_by_test_id('drawer-raw').text_content() == entry['markdown']
    page.get_by_test_id('copy-command').click()
    expect(page.get_by_test_id('copy-status')).to_have_text('Copiado.')
    assert page.evaluate('navigator.clipboard.readText()') == entry['command']
    _no_stitch(page)


def test_inbox_ack_promote_and_conflict(desk, browser_page):
    page, root, ops = browser_page, desk['root'], desk['ops']
    page.goto(f"{desk['url']}#/inbox")
    view = deskops_view.inbox_view(root)
    expect(page.locator('[data-note-id]')).to_have_count(view['count'])
    assert page.locator('[data-note-id]').evaluate_all('els => els.map(e => e.dataset.noteId)') == [n['id'] for n in view['notes']]
    question = next(n for n in view['notes'] if n['title'] == 'Pregunta abierta')
    changing = next(n for n in view['notes'] if n['title'] == 'Nota que cambia')

    # Reconocer: the note shows as closed in `deskops message list`.
    page.locator(f'[data-note-id="{question["id"]}"]').click()
    expect(page.get_by_test_id('inbox-panel')).to_contain_text('Pregunta abierta')
    page.locator('#ack-note').click()
    _confirm(page)
    expect(page.get_by_test_id('note-status')).to_have_text('closed')
    listed = deskops_view.inbox_view(root)['notes']
    assert next(n for n in listed if n['id'] == question['id'])['status'] == 'closed'
    expect(page.locator('#ack-note')).to_be_disabled()

    # A note modified between reading and acting gives a conflict and stays put.
    page.locator(f'[data-note-id="{changing["id"]}"]').click()
    expect(page.get_by_test_id('inbox-panel')).to_contain_text('Nota que cambia')
    ops.edit_artifact_field('inbox-note', changing['id'], 'body', 'Cuerpo cambiado fuera de la UI.')
    page.locator('#promote-note').click()
    _confirm(page)
    expect(page.get_by_test_id('inbox-status')).to_contain_text('Conflicto')
    assert (root / changing['path']).is_file()

    # Pasar al drawer after refreshing: the drawer file exists and the note leaves the inbox.
    page.locator('#refresh').click()
    expect(page.get_by_test_id('inbox-status')).to_have_count(0)
    page.locator(f'[data-note-id="{changing["id"]}"]').click()
    assert _focus_visible(page, page.locator('#promote-note'))
    page.locator('#promote-note').click()
    _confirm(page)
    expect(page.get_by_test_id('inbox-status')).to_contain_text('Pasada al drawer')
    assert not (root / changing['path']).exists()
    assert (root / 'desk/drawer/tasks/task-nota-que-cambia.md').is_file()
    expect(page.locator(f'[data-note-id="{changing["id"]}"]')).to_have_count(0)
    _no_stitch(page)


# ---------------------------------------------------------------- UI06 Agentes
def test_agents_without_herdr_shows_cause_and_runs_match_the_view(desk, browser_page):
    page, root, first = browser_page, desk['root'], desk['first']
    page.goto(f"{desk['url']}#/agents")
    view = agents_view(root, herdr=HERDR)
    assert view['workers'] is None
    expect(page.locator('.notice.is-error')).to_contain_text('Herdr no está disponible')
    expect(page.get_by_test_id('metric-workers')).to_contain_text('no disponible')
    rows = page.get_by_test_id('runs-table').locator('tbody tr')
    expect(rows).to_have_count(len(view['runs']))
    assert rows.evaluate_all('els => els.map(e => e.dataset.task)') == [run['task_id'] for run in view['runs']]
    link = page.get_by_test_id('run-task-link')
    expect(link).to_have_text(first)
    link.click()
    expect(page.get_by_test_id('task-doc').locator('.doc-title')).to_have_text('Preparar la vista')
    _no_stitch(page)


# ---------------------------------------------------------------- package close: all screens
def test_every_screen_loads_from_the_sidebar_with_visible_focus(desk, browser_page):
    page = browser_page
    page.goto(desk['url'])
    expect(page.locator('.card').first).to_be_visible()
    for screen, marker in (('drawer', 'drawer-list'), ('inbox', 'inbox-list'), ('agents', 'runs-table'), ('board', None)):
        link = page.locator(f'.nav-item[data-screen="{screen}"]')
        assert _focus_visible(page, link)
        page.keyboard.press('Enter')
        expect(link).to_have_attribute('aria-current', 'page')
        if marker:
            expect(page.get_by_test_id(marker)).to_be_visible()
        else:
            expect(page.locator('.column')).to_have_count(3)
        _no_stitch(page)
    expect(page.locator('#inspect-link')).to_have_attribute('href', 'http://127.0.0.1:8090/')

FILE:instruccion
Cold-bundle de la tarea task-ui-del-desk-cada-gate-muestra-los-findings-de-sus-reglas-nivel-código-y-mensaje-no-solo-cumple-o-pen: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- python -m pytest -q -rs tests/test_desk_ui_routes.py tests/test_mindmap_deskops.py
- python -m pytest -q -rs tests/e2e_desk_ui.py
- git diff --quiet HEAD -- frontends/desk/task.js frontends/desk/app.js

