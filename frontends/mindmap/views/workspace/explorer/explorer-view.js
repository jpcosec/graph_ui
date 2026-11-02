import {useState} from 'react';
import {html} from '../../../shared/html.js';
import {modeledGroups, buildTree, countFiles, describeInvalidRoots} from './explorer.mjs';

function TreeFolder({node, depth, forceOpen, selectedPath, onOpenPath}) {
  const [open, setOpen] = useState(depth < 1);
  const expanded = forceOpen || open;
  return html`
    <li className="workspace-explorer-folder" data-testid="explorer-folder" data-path=${node.path}>
      <button
        type="button"
        className="workspace-explorer-folder-btn"
        aria-expanded=${expanded}
        onClick=${() => setOpen(v => !v)}
      >${expanded ? '▾' : '▸'} ${node.name} <small>(${countFiles(node)})</small></button>
      ${expanded ? html`<${TreeChildren} node=${node} depth=${depth + 1} forceOpen=${forceOpen} selectedPath=${selectedPath} onOpenPath=${onOpenPath} />` : ''}
    </li>
  `;
}

function TreeChildren({node, depth, forceOpen, selectedPath, onOpenPath}) {
  return html`
    <ul className="workspace-explorer-list">
      ${node.folders.map(f => html`<${TreeFolder} key=${f.path} node=${f} depth=${depth} forceOpen=${forceOpen} selectedPath=${selectedPath} onOpenPath=${onOpenPath} />`)}
      ${node.files.map(f => html`
        <li key=${f.path}>
          <button
            type="button"
            className=${'workspace-explorer-item' + (selectedPath === f.path ? ' is-selected' : '')}
            data-testid="explorer-unmodeled"
            data-path=${f.path}
            title=${f.path}
            onClick=${() => onOpenPath(f.path)}
          >${f.name}</button>
        </li>
      `)}
    </ul>
  `;
}

/**
 * Explorador de documentos: modelados por modelo y Markdown no modelado por carpetas, con filtro
 * local y refresco explicito. Presentacional: los datos y la apertura (lector WS13.1) vienen de la vista.
 */
export function ExplorerPanel({explorer, catalog, error, loading, selectedId, selectedPath, onOpenId, onOpenPath, onRefresh}) {
  const [query, setQuery] = useState('');
  const groups = explorer ? modeledGroups(explorer.modeled, catalog, query) : [];
  const tree = explorer ? buildTree(explorer.unmodeled, query) : null;
  const filtering = query.trim() !== '';
  const shownModeled = groups.reduce((acc, g) => acc + g.entries.length, 0);
  const shownUnmodeled = tree ? countFiles(tree) : 0;
  const invalid = explorer ? describeInvalidRoots(explorer.roots_invalid) : [];

  return html`
    <aside className="workspace-explorer" aria-label="Explorador de documentos" data-testid="explorer">
      <div className="workspace-explorer-head">
        <h3>Explorador</h3>
        <button
          type="button"
          className="workspace-refresh-btn"
          data-testid="explorer-refresh"
          disabled=${loading}
          onClick=${onRefresh}
        >${loading ? 'Refrescando…' : 'Refrescar catálogo'}</button>
      </div>
      <input
        type="search"
        className="workspace-explorer-filter"
        placeholder="Filtrar documentos…"
        aria-label="Filtrar explorador"
        data-testid="explorer-filter"
        value=${query}
        onChange=${e => setQuery(e.target.value)}
      />
      ${error ? html`<div className="workspace-alert" role="alert" data-testid="explorer-error">Error del explorador: ${error}</div>` : ''}
      ${explorer ? html`
        ${explorer.truncado ? html`<div className="workspace-degraded-banner" role="status" data-testid="explorer-truncado">Listado truncado en ${explorer.limite} archivos no modelados: hay más que no se muestran.</div>` : ''}
        ${explorer.sin_git ? html`<div className="workspace-degraded-banner" role="status" data-testid="explorer-sin-git">Sin repositorio git: no se puede comprobar qué archivos están ignorados.</div>` : ''}
        ${explorer.ignorados_error ? html`<div className="workspace-alert" role="alert" data-testid="explorer-ignorados-error">No se pudo comprobar los archivos ignorados (${explorer.ignorados_error}); no se listan los no modelados.</div>` : ''}
        ${invalid.length ? html`<div className="workspace-degraded-banner" role="status" data-testid="explorer-roots-invalid">Rutas permitidas ignoradas: ${invalid.join(', ')}.</div>` : ''}

        <section className="workspace-explorer-section" data-testid="explorer-modeled">
          <h4>Modelados <small>(${shownModeled})</small></h4>
          ${groups.length === 0 ? html`<p className="workspace-empty">${filtering ? 'Sin coincidencias.' : 'Sin documentos modelados.'}</p>` : groups.map(g => html`
            <div key=${g.model} className="workspace-explorer-group" data-testid="explorer-model" data-model=${g.model}>
              <div className="workspace-explorer-group-title">${g.model} <small>(${g.entries.length})</small></div>
              <ul className="workspace-explorer-list">
                ${g.entries.map(e => html`
                  <li key=${e.id}>
                    <button
                      type="button"
                      className=${'workspace-explorer-item' + (selectedId === e.id ? ' is-selected' : '')}
                      data-testid="explorer-modeled-item"
                      data-id=${e.id}
                      data-estado=${e.estado}
                      title=${e.causa ? `${e.id} — ${e.causa}` : e.id}
                      onClick=${() => onOpenId(e.id)}
                    >${e.title}${e.estado !== 'ok' ? html` <span className="workspace-badge workspace-badge-warn" data-testid="explorer-estado">${e.estado}</span>` : ''}</button>
                  </li>
                `)}
              </ul>
            </div>
          `)}
        </section>

        <section className="workspace-explorer-section" data-testid="explorer-unmodeled-tree">
          <h4>Markdown sin modelo <small>(${shownUnmodeled})</small></h4>
          <p className="workspace-explorer-roots">Rutas: ${explorer.roots.length ? explorer.roots.join(', ') : 'ninguna disponible'}</p>
          ${shownUnmodeled === 0 ? html`<p className="workspace-empty">${filtering ? 'Sin coincidencias.' : 'Sin Markdown no modelado en las rutas permitidas.'}</p>` : html`
            <${TreeChildren} node=${tree} depth=${0} forceOpen=${filtering} selectedPath=${selectedPath} onOpenPath=${onOpenPath} />
          `}
        </section>
      ` : (!error ? html`<p className="workspace-empty" data-testid="explorer-loading" role="status">Cargando explorador…</p>` : '')}
    </aside>
  `;
}
