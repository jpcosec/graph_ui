// Pure reducer for the working copy of {documents,view} with undo/redo.
// State shape: {working:{documents,view}, history:[], future:[]}.
// Mirrors exactly what App used to do by hand with
// checkpoint()/setDocuments/setView/undo/redo/restore: a "checkpoint" pushes
// the current working copy onto history and clears future; an "edit" is a
// checkpoint plus applying a change in one step; "apply" changes working
// without touching history (used for drag-stop, since drag-start already
// checkpointed).
const CAP = 40;

export function initial(baseline) {
  return {working: {documents: baseline.documents, view: baseline.view}, history: [], future: []};
}

export function checkpoint(state) {
  return {...state, history: [...state.history.slice(-(CAP - 1)), state.working], future: []};
}

// fn(working) must return the next working copy (spread the parts that do
// not change; see call sites in editor.js).
export function edit(state, fn) {
  return {working: fn(state.working), history: [...state.history.slice(-(CAP - 1)), state.working], future: []};
}

export function apply(state, fn) {
  return {...state, working: fn(state.working)};
}

function restore(state, fromKey, toKey) {
  const from = state[fromKey];
  if (!from.length) return state;
  const prev = from.at(-1);
  return {working: prev, [fromKey]: from.slice(0, -1), [toKey]: [...state[toKey], state.working]};
}

export function undo(state) { return restore(state, 'history', 'future'); }
export function redo(state) { return restore(state, 'future', 'history'); }

export function reset(state, baseline) {
  return initial(baseline);
}
