import {html} from '../../../shared/html.js';
import {useShellDialogs} from '../../../shell/dialogs.js';
import {classStyle, classVar} from '../../../shared/classes.mjs';

export function Sidebar({models,counts,totalCount,activeClass,setActiveClass,sidebarOpen}) {
  const dialogs=useShellDialogs();
  return html`<aside className=${'class-sidebar'+(sidebarOpen?' open':'')} aria-label="Leyenda de clases SLDB"><div className="sidebar-heading"><div><span className="eyebrow">SLDB</span><h2>Clases de documento</h2></div><span className="total-count">${models.length}</span></div><p className="sidebar-help">Elige una clase para explorar sus documentos.</p><button className=${'legend-all'+(!activeClass?' active':'')} onClick=${()=>setActiveClass(null)}>Todas las clases <span>${totalCount}</span></button>
    <div className="class-list">${models.map(m=>{const style=classStyle(m.id);return html`<button key=${m.id} className=${'class-item'+(activeClass===m.id?' active':'')} style=${{'--class-color':classVar(style.slot)}} onClick=${()=>setActiveClass(activeClass===m.id?null:m.id)} aria-pressed=${activeClass===m.id}><span className="class-icon">${style.icon}</span><span className="class-name">${style.name}</span><span className="class-count">${counts[m.id]}</span></button>`;})}</div>
    <div className="hierarchy-legend"><strong>Contención</strong><div className="containment-example"><span>🗂️ Contenedor</span><div>🎯 Documento hijo</div></div><p>Las cajas agrupan sus documentos. Usa ▾ para plegar y ▸ para expandir.</p></div><div className="sidebar-shortcuts"><span><kbd>Tab</kbd> Añadir hijo</span><span><kbd>Enter</kbd> Añadir hermano</span><span><kbd>Ctrl S</kbd> Guardar en SLDB</span></div><button className="class-sidebar-manage" style=${{width:'100%',marginTop:'9px'}} onClick=${()=>dialogs.open({kind:'classes'})}>📐 Editar clases</button>
  </aside>`;
}
