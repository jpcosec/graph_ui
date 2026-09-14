import {useState, useEffect, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {classStyle, classVar} from '../../../shared/classes.mjs';
import {relationTypesOf} from './projection.mjs';

const MODES = ['read', 'read and assert'];

// Dedicated checklist UI over a ProjectionDoc's payload — an alternative to
// editing its raw JSON fields from the generic KB ficha (still possible: a
// ProjectionDoc is a document like any other). `models`/`relations` empty
// means "everything enters" (pron's own semantics, source/projections.mjs);
// unchecking a class or relation type while that "everything" state holds
// materializes the full list first, exactly like flipping a set-complement.
export function ProjectionEditor({projection, models, documents, onClose, onApply}) {
  const payload = projection.payload || {};
  const [modelsAll, setModelsAll] = useState(!(payload.models || []).length);
  const [modelsSet, setModelsSet] = useState(new Set(payload.models || []));
  const relationTypes = relationTypesOf(documents);
  const [relationsAll, setRelationsAll] = useState(!(payload.relations || []).length);
  const [relationModes, setRelationModes] = useState(() => new Map((payload.relations || []).map(r => [r.name, r.mode || 'read'])));
  const [display, setDisplay] = useState({...(payload.display || {})});
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; d.showModal(); return () => d.close(); }, []);

  const toggleModel = id => {
    if (modelsAll) { setModelsAll(false); setModelsSet(new Set(models.map(m => m.id).filter(x => x !== id))); return; }
    setModelsSet(s => { const next = new Set(s); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleAllModels = () => { setModelsAll(a => !a); setModelsSet(new Set()); };
  const toggleRelation = name => {
    if (relationsAll) {
      setRelationsAll(false);
      setRelationModes(new Map(relationTypes.filter(t => t !== name).map(t => [t, 'read'])));
      return;
    }
    setRelationModes(m => { const next = new Map(m); next.has(name) ? next.delete(name) : next.set(name, 'read'); return next; });
  };
  const toggleAllRelations = () => { setRelationsAll(a => !a); setRelationModes(new Map()); };
  const setRelationMode = (name, mode) => setRelationModes(m => new Map(m).set(name, mode));
  const setTemplate = (id, value) => setDisplay(d => (value ? {...d, [id]: value} : Object.fromEntries(Object.entries(d).filter(([k]) => k !== id))));

  const submit = e => {
    e.preventDefault();
    const nextPayload = {
      ...payload,
      models: modelsAll ? [] : [...modelsSet],
      relations: relationsAll ? [] : [...relationModes].map(([name, mode]) => ({name, mode})),
      display,
    };
    onApply(nextPayload);
  };

  return html`<dialog ref=${ref} className="projection-editor" aria-labelledby="projection-editor-title" onCancel=${onClose} onClick=${e => { if (e.target === ref.current) onClose(); }}><form onSubmit=${submit}>
    <header className="dialog-header"><span className="dialog-icon" style=${{'--class-color': 'var(--accent)'}}>🎛</span><div><span className="eyebrow">Editar proyección</span><h2 id="projection-editor-title">${payload.name || projection.id}</h2></div><button type="button" className="icon-button" aria-label="Cerrar editor de proyección" onClick=${onClose}>×</button></header>
    <div className="dialog-body">
      <section className="projection-editor-section">
        <label className="projection-editor-all"><input type="checkbox" checked=${modelsAll} onChange=${toggleAllModels}/> Todas las clases</label>
        <ul className="projection-editor-list">
          ${models.map(m => { const style = classStyle(m.id), checked = modelsAll || modelsSet.has(m.id); return html`<li key=${m.id} className="projection-editor-row" style=${{'--class-color': classVar(style.slot)}}>
            <label><input type="checkbox" checked=${checked} onChange=${() => toggleModel(m.id)}/> <span>${style.icon}</span> ${style.name}</label>
            <input type="text" className="projection-editor-template" placeholder="plantilla, p. ej. {title}" value=${display[m.id] || ''} disabled=${!checked} onInput=${e => setTemplate(m.id, e.target.value)}/>
          </li>`; })}
          ${!models.length ? html`<li className="projection-editor-empty">Este store no tiene clases registradas</li>` : ''}
        </ul>
      </section>
      <section className="projection-editor-section">
        <label className="projection-editor-all"><input type="checkbox" checked=${relationsAll} onChange=${toggleAllRelations}/> Todos los tipos de relación</label>
        <ul className="projection-editor-list">
          ${relationTypes.map(name => { const checked = relationsAll || relationModes.has(name); return html`<li key=${name} className="projection-editor-row">
            <label><input type="checkbox" checked=${checked} onChange=${() => toggleRelation(name)}/> ${name}</label>
            <select disabled=${!checked} value=${relationModes.get(name) || 'read'} onChange=${e => setRelationMode(name, e.target.value)}>${MODES.map(mode => html`<option key=${mode} value=${mode}>${mode}</option>`)}</select>
          </li>`; })}
          ${!relationTypes.length ? html`<li className="projection-editor-empty">Este store no tiene tipos de relación</li>` : ''}
        </ul>
      </section>
    </div>
    <footer className="dialog-footer"><span>Se guarda como cualquier documento: confirma con «Guardar en SLDB» desde KB.</span><button type="button" onClick=${onClose}>Cancelar</button><button className="primary" type="submit">Aplicar cambios</button></footer>
  </form></dialog>`;
}
