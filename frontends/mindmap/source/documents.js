import {useState, useCallback} from 'react';
import * as historyMod from './history.mjs';
import {changesBetween, conflictsBetween} from './batch.mjs';

const EMPTY_BASELINE = {documents: [], view: {}, revision: ''};

// Owns the documents/view working copy, its baseline (last known-good SLDB
// state), undo/redo history and the save/export/reload mutations. Moved
// verbatim from editor.js's App (load/save/exportMap/checkpoint/undo/redo),
// on top of the pure source/history.mjs reducer.
export function useDocumentsFacet(request) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [baseline, setBaseline] = useState(EMPTY_BASELINE);
  // Schema fetched alongside /api/graph on every reload (the map needs
  // both); exposed here so the models facet can mirror it instead of
  // issuing a second /api/schema request — see source/models.js.
  const [models, setModels] = useState([]);
  const [historyState, setHistoryState] = useState(() => historyMod.initial(EMPTY_BASELINE));
  const [notice, setNotice] = useState('');
  const [conflicts, setConflicts] = useState(null);
  // Cuenta solo recargas completas (no guardados): la vista resetea selección
  // y foco al recargar, pero un guardado exitoso los conserva.
  const [loadCount, setLoadCount] = useState(0);

  const working = historyState.working;
  const dirty = JSON.stringify(working.documents) !== JSON.stringify(baseline.documents)
    || JSON.stringify(working.view) !== JSON.stringify(baseline.view);

  const reload = useCallback(async () => {
    setStatus('loading'); setError('');
    try {
      const [graph, schema] = await Promise.all([request('/api/graph'), request('/api/schema')]);
      const nextBaseline = {documents: graph.documents, view: graph.view, revision: graph.revision};
      setBaseline(nextBaseline);
      setModels(schema.models);
      setHistoryState(historyMod.initial(nextBaseline));
      setConflicts(null);
      setNotice('');
      setStatus('ready');
      setLoadCount(n => n + 1);
    } catch (e) { setStatus('error'); setError(e.message); }
  }, [request]);

  const checkpoint = () => { setHistoryState(s => historyMod.checkpoint(s)); setNotice(''); };
  // Matches checkpoint(): every edit() call site in the original App either
  // set its own follow-up notice right after, or relied on checkpoint()
  // having cleared it — clearing here keeps both cases identical.
  const edit = fn => { setNotice(''); setHistoryState(s => historyMod.edit(s, fn)); };
  const apply = fn => setHistoryState(s => historyMod.apply(s, fn));
  const undo = () => setHistoryState(s => historyMod.undo(s));
  const redo = () => setHistoryState(s => historyMod.redo(s));
  // Revert local edits back to the last baseline without touching the
  // server (not currently wired to any UI action — kept for parity with
  // the pure reducer's `reset`, and for use by future views/tests).
  const discard = () => setHistoryState(s => historyMod.reset(s, baseline));

  const save = async () => {
    if (status === 'saving' || !dirty) return;
    setStatus('saving'); setError(''); setNotice('Guardando documentos en SLDB…');
    const changes = changesBetween(baseline.documents, working.documents);
    try {
      const result = await request('/api/save', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({changes, view: working.view, viewRevision: baseline.revision})});
      const nextBaseline = {documents: result.documents, view: result.view, revision: result.revision};
      setBaseline(nextBaseline);
      setHistoryState(historyMod.initial(nextBaseline));
      setNotice(`${result.saved.length} documento${result.saved.length===1?'':'s'} guardado${result.saved.length===1?'':'s'} en SLDB · Vista guardada`);
    } catch (e) {
      // Conflicto de revisión: el servidor devuelve el grafo actualizado.
      // Mostramos la versión vigente de cada documento en conflicto; el
      // working copy y la vista local NO se tocan (el usuario decide).
      if (e.body?.documents) {
        setBaseline(b => ({...b, documents: e.body.documents, revision: e.body.revision}));
        const conflicted = conflictsBetween(changes, e.body.documents);
        if (conflicted.length) setConflicts(conflicted);
      }
      setError(e.message); setNotice('No se completó el guardado. Tus cambios siguen aquí.');
    } finally { setStatus('ready'); }
  };

  const exportMap = async () => {
    try {
      const source = await request('/api/export', {method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({documents: working.documents, view: working.view})});
      const url = URL.createObjectURL(new Blob([JSON.stringify(source, null, 2)], {type: 'application/json'}));
      const a = document.createElement('a'); a.href = url; a.download = 'kb-mindmap.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Mapa completo exportado, incluidos los cambios pendientes.');
    } catch (e) { setError(e.message); }
  };

  const resolveConflicts = mode => {
    setConflicts(null);
    if (mode === 'reload') reload();
  };

  return {status, error, baseline, working, dirty, loadCount,
    canUndo: historyState.history.length > 0, canRedo: historyState.future.length > 0,
    checkpoint, apply, edit, undo, redo, reload, discard,
    save, exportMap, conflicts, resolveConflicts, notice, setNotice,
    // Not in the brief's literal list, but needed so the error banner's "×"
    // (dismiss without reloading) keeps working exactly as before.
    setError, models};
}
