import {Handle, Position, NodeToolbar} from '@xyflow/react';
import {html} from '../../../shared/html.js';
import {classStyle, classVar} from '../../../shared/classes.mjs';
import {useSource} from '../../../source/source.js';

export function DocumentNode({data,selected}) {
  const style=classStyle(data.doc.model_name);
  const title=useSource().projections.titleFor(data.doc);
  return html`<div className=${'document-node'+(data.group?' container-node':'')+(selected?' selected':'')} style=${{'--class-color':classVar(style.slot)}}>
    <${NodeToolbar} isVisible=${selected} position=${Position.Top} offset=${12}>
      <div className="node-toolbar" role="toolbar" aria-label="Acciones del nodo">
        <button onClick=${()=>data.actions.addChild(data.doc.id)} disabled=${!data.canChild} title=${data.canChild?'Añadir hijo (Tab)':'Esta clase no tiene campos de contención'}>＋ Hijo</button>
        <button onClick=${()=>data.actions.addSibling(data.doc.id)} title="Añadir hermano (Enter)">＋ Hermano</button>
        ${data.group?html`<button onClick=${()=>data.actions.focus(data.doc.id)} title="Entrar al contenedor">↳ Entrar</button>`:''}
        <button onClick=${()=>data.actions.connect(data.doc.id)} className=${data.connecting?'connect-active':''} title="Conectar con otro documento">⌁ Conectar</button>
        <span></span><button onClick=${()=>data.actions.edit(data.doc.id)}>✎ Editar</button>
        <button aria-label="Quitar documento" title="Quitar de la KB al guardar; conserva el archivo" onClick=${()=>data.actions.remove(data.doc.id)}>⌫</button>
      </div>
    </${NodeToolbar}>
    <${Handle} type="target" position=${Position.Left}/>
    <div className="node-heading"><span className="node-icon" title=${data.doc.model_name}>${style.icon}</span><span className="node-title" title=${title}>${title}</span>
      ${data.count?html`<button className="collapse nodrag" aria-label=${data.collapsed?'Expandir contenido':'Plegar contenido'} onClick=${e=>{e.stopPropagation();data.actions.toggle(data.doc.id);}}>${data.collapsed?'▸':'▾'} <small>${data.count}</small></button>`:''}
    </div>
    <${Handle} type="source" position=${Position.Right}/>
  </div>`;
}
export const nodeTypes={document:DocumentNode};
