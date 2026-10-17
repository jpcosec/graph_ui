// Lógica de agrupado/render del panel de workers (shared/workers.mjs, usado
// por shell/workers-panel.js). Se prueba con node --test, igual que
// mindmap-model.test.mjs: el .mjs puro no carga React, solo el JSON real del
// contrato de /api/workers.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {basename, groupBySpace, normalizeStatus, statusLabel} from '../frontends/mindmap/shared/workers.mjs';

const agent = (overrides = {}) => ({
  pane: 'w-9:p-1',
  kind: 'pi',
  name: 'executor',
  status: 'working',
  cwd: '/repo/a',
  title: 'pi - a',
  workspace: 'w-9',
  seq: 1,
  focused: true,
  ...overrides,
});

test('spaces presente: agrupa por los espacios del JSON, con label legible y orden por number ascendente', () => {
  const payload = {
    spaces: [
      {workspace: 'w20', label: 'setup', number: 3, status: 'done', workers: [agent({pane: 'w20:p-1'})]},
      {workspace: 'w10', label: 'sldb', number: 1, status: 'working', workers: [agent({pane: 'w10:p-1'}), agent({pane: 'w10:p-2', status: 'blocked'})]},
      {workspace: 'w30', label: 'hum-tools', number: 2, status: 'idle', workers: [agent({pane: 'w30:p-1'})]},
    ],
    workers: [], // la lista plana existe por retrocompatibilidad pero no se usa si viene spaces
  };
  const groups = groupBySpace(payload);
  assert.deepEqual(groups.map(g => g.label), ['sldb', 'hum-tools', 'setup']);
  assert.deepEqual(groups.map(g => g.number), [1, 2, 3]);
  assert.deepEqual(groups.map(g => g.workspace), ['w10', 'w30', 'w20']);
  assert.equal(groups[0].workers.length, 2);
  assert.equal(groups[0].status, 'working');
  assert.equal(groups[0].workers[1].status, 'blocked');
});

test('spaces presente: label cae a workspace si label falta, y a placeholder si faltan ambos', () => {
  const payload = {
    spaces: [
      {workspace: 'w10', number: 1, workers: [agent({pane: 'a'})]},
      {number: 2, workers: [agent({pane: 'b'})]},
    ],
  };
  const groups = groupBySpace(payload);
  assert.equal(groups[0].label, 'w10');
  assert.equal(groups[1].label, '(sin space)');
});

test('spaces ausente (fallback): agrupa la lista plana por workspace, sin perder workers ni orden interno', () => {
  const payload = {
    workers: [
      agent({pane: 'a', workspace: 'w1', name: 'uno'}),
      agent({pane: 'b', workspace: 'w2'}),
      agent({pane: 'c', workspace: 'w1', status: 'blocked'}),
    ],
  };
  const groups = groupBySpace(payload);
  assert.deepEqual(groups.map(g => g.label), ['w1', 'w2']);
  assert.deepEqual(groups.map(g => g.workspace), ['w1', 'w2']);
  assert.deepEqual(groups[0].workers.map(w => w.pane), ['a', 'c']);
  assert.equal(groups[1].workers.length, 1);
});

test('fallback: workers sin campo workspace caen en un group placeholder, no se pierden', () => {
  const payload = {workers: [agent({pane: 'a', workspace: 'w1'}), agent({pane: 'b', workspace: null})]};
  const groups = groupBySpace(payload);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(g => g.label), ['(sin space)', 'w1']);
  assert.equal(groups[0].workers[0].pane, 'b');
});

test('fallback: el group se ordena por label cuando no hay number', () => {
  const payload = {workers: [agent({pane: 'a', workspace: 'zeta'}), agent({pane: 'b', workspace: 'alfa'})]};
  assert.deepEqual(groupBySpace(payload).map(g => g.label), ['alfa', 'zeta']);
});

test('flota vacía es un estado válido: sin groups y sin error', () => {
  assert.deepEqual(groupBySpace({workers: []}), []);
  assert.deepEqual(groupBySpace({spaces: [], workers: []}), []);
});

test('spaces vacío con workers presentes: no se descartan, se usa el fallback por workspace', () => {
  const payload = {spaces: [], workers: [agent({pane: 'a', workspace: 'w1'})]};
  const groups = groupBySpace(payload);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].label, 'w1');
});

test('payload con error de runtime (ej. deskops no instalado) agrupa sin romperse', () => {
  assert.deepEqual(groupBySpace({workers: [], error: 'deskops no esta instalado.'}), []);
});

test('groups sin workers se descartan: una cabecera sin filas es ruido', () => {
  const payload = {
    spaces: [
      {workspace: 'w1', label: 'vacio', number: 1, workers: []},
      {workspace: 'w2', label: 'lleno', number: 2, workers: [agent({pane: 'a'})]},
    ],
  };
  const groups = groupBySpace(payload);
  assert.deepEqual(groups.map(g => g.label), ['lleno']);
});

test('unnumbered spaces van al final, desempatando por label', () => {
  const payload = {
    spaces: [
      {workspace: 'w1', label: 'b', workers: [agent({pane: 'x'})]},
      {workspace: 'w2', label: 'a', number: 10, workers: [agent({pane: 'y'})]},
      {workspace: 'w3', label: 'c', workers: [agent({pane: 'z'})]},
      {workspace: 'w4', label: 'd', number: 1, workers: [agent({pane: 'q'})]},
    ],
  };
  assert.deepEqual(groupBySpace(payload).map(g => g.label), ['d', 'a', 'b', 'c']);
});

test('basename acorta el cwd para mostrar, dejando el path completo en title', () => {
  assert.equal(basename('/repo/reports/issue.md'), 'issue.md');
  assert.equal(basename('/home/jp/proyectos/hum-ecosystem/tools/graph_ui_wt'), 'graph_ui_wt');
  assert.equal(basename('repo'), 'repo');
  assert.equal(basename('/a/b/'), 'b');
  assert.equal(basename(null), '—');
  assert.equal(basename(''), '—');
});

test('normalizeStatus mapea a los 5 estados conocidos y unknown de default', () => {
  assert.equal(normalizeStatus('working'), 'working');
  assert.equal(normalizeStatus('idle'), 'idle');
  assert.equal(normalizeStatus('done'), 'done');
  assert.equal(normalizeStatus('blocked'), 'blocked');
  assert.equal(normalizeStatus('Unknown'), 'unknown');
  assert.equal(normalizeStatus(null), 'unknown');
  assert.equal(normalizeStatus('crash'), 'unknown');
  assert.equal(statusLabel('blocked'), 'Blocked');
  assert.equal(statusLabel(null), 'Unknown');
});

test('worker filas inválidas (null) no rompen el agrupado', () => {
  const groups = groupBySpace({workers: [null, 'texto', agent({pane: 'a'})]});
  assert.equal(groups.length, 1);
  assert.equal(groups[0].workers.length, 1);
});