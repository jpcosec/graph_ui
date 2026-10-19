// G1: a store whose models do not import says which and why, instead of looking empty.
import test from 'node:test';
import assert from 'node:assert/strict';
import {importErrorMessage} from '../frontends/mindmap/source/import-errors.mjs';

test('no message when every model imports', () => {
  assert.equal(importErrorMessage([{id: 'TaskDoc', model_ref: 'deskops.models:TaskDoc', fields: []}]), '');
  assert.equal(importErrorMessage(undefined), '');
});

test('the message names each broken model, its reference, the real error and --pythonpath', () => {
  const message = importErrorMessage([
    {id: 'VsmSystemDoc', model_ref: 'vsm.models:VsmSystemDoc', import_error: "Failed to import module 'vsm.models'. (No module named 'vsm')"},
    {id: 'TaskDoc', model_ref: 'deskops.models:TaskDoc'},
  ]);
  assert.match(message, /^1 modelo\(s\)/);
  assert.match(message, /VsmSystemDoc \(vsm\.models:VsmSystemDoc\): Failed to import module 'vsm\.models'\. \(No module named 'vsm'\)/);
  assert.match(message, /--pythonpath/);
});
