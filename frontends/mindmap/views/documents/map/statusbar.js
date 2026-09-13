import {html} from '../../../shared/html.js';

export function Statusbar({count,contained,notice,zoom}) {
  return html`<footer className="statusbar"><span>${count} documentos · ${contained} contenidos</span><span role="status">${notice||'Doble clic para editar · Arrastra para mover'}</span><span>${Math.round(zoom*100)}%</span></footer>`;
}
