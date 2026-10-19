// Panel de workers plegable, recordado por vista (shared/workers-collapse.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {workersCollapsed, rememberWorkers, STORAGE_PREFIX} from '../frontends/mindmap/shared/workers-collapse.mjs';

function memory() {
  const data = new Map();
  return {getItem: k => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)), data};
}

test('sin nada guardado, cada vista arranca en su estado por defecto', () => {
  const storage = memory();
  assert.equal(workersCollapsed('notation', true, storage), true);
  assert.equal(workersCollapsed('map', false, storage), false);
});

test('lo que elige el operador se recuerda por vista y gana al defecto', () => {
  const storage = memory();
  rememberWorkers('notation', false, storage);
  assert.equal(storage.data.get(STORAGE_PREFIX + 'notation'), '0');
  assert.equal(workersCollapsed('notation', true, storage), false);
  rememberWorkers('map', true, storage);
  assert.equal(workersCollapsed('map', false, storage), true);
  assert.equal(workersCollapsed('flow', false, storage), false);
});

test('sin almacenamiento (o si falla) se usa el defecto', () => {
  assert.equal(workersCollapsed('notation', true, null), true);
  const broken = {getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }};
  assert.equal(workersCollapsed('notation', true, broken), true);
  assert.doesNotThrow(() => rememberWorkers('notation', false, broken));
});
