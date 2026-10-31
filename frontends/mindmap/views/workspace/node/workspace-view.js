import {useEffect, useState, useRef} from 'react';
import {html} from '../../../shared/html.js';
import {request} from '../../../shell/api.js';
import {irSectionsWithCleanMeta, irFields} from '../../../shared/document-ir.mjs';
import {
  TABS,
  filterCatalog,
  formatHash,
  parseCodeSnippet,
  formatProblems,
  filterGraphEdges,
  distinctEdgeTypes
} from './workspace.mjs';

function CodeFileView({file}) {
  const lineNum = file.fragment_line || file.line;
  const snippet = parseCodeSnippet(file.content, lineNum, 5);
  return html`
    <div className="workspace-code-file-card">
      <div className="workspace-code-file-header">
        <span className="workspace-code-filename">${file.path}${lineNum ? `:${lineNum}` : ''}</span>
        ${lineNum ? html`<span className="workspace-badge">Línea ${lineNum}</span>` : ''}
      </div>
      ${file.error || (file.message && file.status !== 'ok') ? html`<div className="workspace-alert" role="alert">${file.error || file.message}</div>` : ''}
      ${snippet.lines.length ? html`
        <table className="workspace-code-table">
          <tbody>
            ${snippet.lines.map(line => html`
              <tr key=${line.number} className=${'workspace-code-line' + (line.isTarget ? ' target-line' : '')}>
                <td className="workspace-code-line-num">${line.number}</td>
                <td className="workspace-code-line-text">${line.text}</td>
              </tr>
            `)}
          </tbody>
        </table>
      ` : html`<p className="workspace-empty">Archivo vacío o no disponible.</p>`}
    </div>
  `;
}

function IrSectionView({section}) {
  const spanText = section.span ? `L${section.span.line_start ?? ''}-${section.span.line_end ?? ''}` : '';
  return html`
    <div className="workspace-ir-section">
      <h4 className="workspace-ir-title">${section.title || section.name || 'Sección'} ${spanText ? html`<small className="workspace-badge">${spanText}</small>` : ''}</h4>
      ${section.value ? html`<p>${typeof section.value === 'object' ? JSON.stringify(section.value) : String(section.value)}</p>` : ''}
      ${Array.isArray(section.children) && section.children.length ? html`
        <div>${section.children.map((c, i) => html`<${IrSectionView} key=${i} section=${c} />`)}</div>
      ` : ''}
    </div>
  `;
}

function WorkspaceView() {
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [depth, setDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('');
  const [nodeData, setNodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodeError, setNodeError] = useState('');

  const nodeGen = useRef(0);
  const catalogGen = useRef(0);

  // Sync state with URL params
  const updateUrl = (id, newDepth, tab, replace = false) => {
    try {
      const url = new URL(window.location.href);
      if (id) url.searchParams.set('id', id);
      else url.searchParams.delete('id');
      url.searchParams.set('depth', String(newDepth || 1));
      url.searchParams.set('tab', tab || 'document');
      const newPath = url.pathname + url.search;
      if (replace) {
        window.history.replaceState(null, '', newPath);
      } else {
        window.history.pushState(null, '', newPath);
      }
    } catch {}
  };

  const syncFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      const urlDepth = parseInt(params.get('depth') || '1', 10);
      const urlTab = params.get('tab') || 'document';

      if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
      if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
      if (urlId && urlId !== selectedId) {
        setSelectedId(urlId);
      }
    } catch {}
  };

  const loadCatalog = async () => {
    const token = ++catalogGen.current;
    setCatalogError('');
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    const urlDepth = parseInt(params.get('depth') || '1', 10);
    const urlTab = params.get('tab') || 'document';

    if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
    if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);

    try {
      const res = await request('/api/workspace/nodes');
      if (token !== catalogGen.current) return;
      const nodes = res.nodes || [];
      setCatalog(nodes);

      if (urlId) {
        setSelectedId(urlId);
      } else if (nodes.length > 0) {
        setSelectedId(nodes[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      if (token === catalogGen.current) {
        setCatalogError(err.message || 'Error al cargar catálogo de nodos');
        if (urlId) {
          setSelectedId(urlId);
        } else {
          setLoading(false);
        }
      }
    }
  };

  const loadNode = async (id, currentDepth) => {
    if (!id) {
      setNodeData(null);
      setLoading(false);
      return;
    }
    const token = ++nodeGen.current;
    setLoading(true);
    setNodeError('');
    try {
      const res = await request(`/api/workspace/node?id=${encodeURIComponent(id)}&depth=${currentDepth}`);
      if (token !== nodeGen.current) return;
      const node = res.node || {};
      const projections = res.projections || {};
      const context = res.context || {};
      const normalizedData = {
        identity: {
          id: node.id || id,
          name: node.name || '',
          model: node.model_name || '',
          path: node.path || '',
          status: context.status || node.status || '',
          current_node: context.current_node || '',
          content_hash: context.content_hash || node.content_hash || '',
          content_hash_error: context.content_hash_error || null,
          file_revision: context.file_revision || node.file_revision || '',
          file_revision_error: context.file_revision_error || null,
        },
        document: {
          is_degraded: node.is_degraded || !projections.document?.ok,
          error: projections.document?.error,
          title: projections.document?.payload?.title || projections.document?.payload?.name || node.name || id,
          payload: projections.document?.payload || {},
          ir: projections.document?.ir,
          semantic_tags: projections.document?.semantic_tags || []
        },
        graph: projections.graph || { ok: false, nodes: [], edges: [], error: 'Sin datos de grafo' },
        code: projections.code || { ok: false, files: [] },
        context: {
          status: context.status || '',
          current_node: context.current_node || '',
          outgoing: context.outgoing_relations || [],
          incoming: context.incoming_relations || [],
        },
        problems: context.problems_report || { ok: true, problems: [] }
      };
      setNodeData(normalizedData);
    } catch (err) {
      if (token === nodeGen.current) {
        setNodeData(null);
        setNodeError(err.message || 'Error al cargar datos del nodo');
      }
    } finally {
      if (token === nodeGen.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
    const onPopState = () => syncFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => {
      ++catalogGen.current;
      ++nodeGen.current;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadNode(selectedId, depth);
    }
  }, [selectedId, depth]);

  const handleTabChange = tabId => {
    setActiveTab(tabId);
    updateUrl(selectedId, depth, tabId, false);
  };

  const handleDepthChange = newDepth => {
    setDepth(newDepth);
    updateUrl(selectedId, newDepth, activeTab, false);
  };

  const handleSelectNode = id => {
    if (!id || id === selectedId) return;
    setSelectedId(id);
    updateUrl(id, depth, activeTab, false);
  };

  const availableModels = Array.from(new Set(catalog.map(n => n.model_name).filter(Boolean))).sort();
  const filteredNodes = filterCatalog(catalog, searchQuery, modelFilter);
  const problemsInfo = formatProblems(nodeData?.problems);

  const graphEdges = nodeData?.graph?.edges || [];
  const edgeTypes = distinctEdgeTypes(graphEdges);
  const visibleGraphEdges = filterGraphEdges(graphEdges, edgeTypeFilter);

  return html`
    <div className="workspace-view">
      <header className="workspace-header">
        <div className="workspace-header-title">
          <div className="workspace-eyebrow">WORKSPACE / MULTI-PROYECCIÓN</div>
          <h1>${nodeData?.identity?.id || selectedId || 'Workspace'}</h1>
        </div>
        <div className="workspace-controls">
          <div className="workspace-node-select">
            <input
              type="search"
              placeholder="Buscar nodo..."
              value=${searchQuery}
              onChange=${e => setSearchQuery(e.target.value)}
              aria-label="Buscar nodo"
            />
            <select
              value=${modelFilter}
              onChange=${e => setModelFilter(e.target.value)}
              aria-label="Filtrar catálogo por modelo"
            >
              <option value="">Todos los modelos</option>
              ${availableModels.map(m => html`<option key=${m} value=${m}>${m}</option>`)}
            </select>
            <select
              value=${selectedId}
              onChange=${e => handleSelectNode(e.target.value)}
              aria-label="Seleccionar nodo activo"
            >
              ${selectedId && !filteredNodes.some(n => n.id === selectedId) ? html`
                <option value=${selectedId}>${selectedId}</option>
              ` : ''}
              ${filteredNodes.map(n => html`
                <option key=${n.id} value=${n.id}>
                  [${n.model_name}] ${n.title || n.id}
                </option>
              `)}
            </select>
          </div>

          <div className="workspace-depth-control" role="group" aria-label="Profundidad de grafo">
            <button
              className=${'workspace-depth-btn' + (depth === 1 ? ' active' : '')}
              aria-pressed=${depth === 1}
              onClick=${() => handleDepthChange(1)}
            >
              1 hop
            </button>
            <button
              className=${'workspace-depth-btn' + (depth === 2 ? ' active' : '')}
              aria-pressed=${depth === 2}
              onClick=${() => handleDepthChange(2)}
            >
              2 hops
            </button>
          </div>

          <button
            className="workspace-refresh-btn"
            disabled=${loading}
            onClick=${() => loadNode(selectedId, depth)}
          >
            ${loading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      <nav className="workspace-tabs-bar" aria-label="Proyecciones del nodo">
        ${TABS.map(tab => html`
          <button
            key=${tab.id}
            className=${'workspace-tab-btn' + (activeTab === tab.id ? ' active' : '')}
            aria-selected=${activeTab === tab.id}
            onClick=${() => handleTabChange(tab.id)}
          >
            ${tab.label}
          </button>
        `)}
      </nav>

      ${catalogError ? html`<div className="workspace-alert" role="alert">Error de catálogo: ${catalogError}</div>` : ''}
      ${nodeError ? html`<div className="workspace-alert" role="alert">Error: ${nodeError}</div>` : ''}

      <div className="workspace-body">
        <main className="workspace-main" aria-label="Proyección activa">
          ${loading && !nodeData ? html`<p role="status" className="workspace-empty">Cargando nodo…</p>` : ''}
          ${!loading && !selectedId && !nodeError ? html`<p className="workspace-empty">Selecciona un nodo del catálogo para visualizar sus proyecciones.</p>` : ''}

          ${nodeData && activeTab === 'document' ? html`
            <section className="workspace-doc-pane" aria-label="Proyección Documental">
              ${nodeData.document?.is_degraded ? html`
                <div className="workspace-degraded-banner" role="status">
                  <strong>Documento Degradado</strong>
                  <p>${nodeData.document.error || 'El documento no pudo ser procesado con IR completo, pero su representación básica sigue disponible.'}</p>
                </div>
              ` : ''}

              <header className="workspace-doc-header">
                <h2>${nodeData.document?.title || nodeData.identity?.id}</h2>
                <div className="workspace-doc-meta">
                  <span className="workspace-badge">${nodeData.identity?.model}</span>
                  <code>${nodeData.identity?.path}</code>
                </div>
              </header>

              ${(() => {
                const sections = irSectionsWithCleanMeta(nodeData.document?.ir);
                const fields = irFields(nodeData.document?.ir, nodeData.document?.payload);
                return html`
                  ${sections.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Estructura Documental (IR)</h3>
                      ${sections.map((sec, i) => html`<${IrSectionView} key=${i} section=${sec} />`)}
                    </div>
                  ` : ''}
                  ${fields.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Campos del Documento (IR)</h3>
                      ${fields.map((f, i) => html`
                        <div key=${i} className="workspace-payload-field">
                          <h3>${f.field_path} ${f.span ? html`<small className="workspace-badge">L${f.span.line_start}-${f.span.line_end}</small>` : ''}</h3>
                          ${typeof f.value === 'object' && f.value !== null ? html`
                            <pre><code>${JSON.stringify(f.value, null, 2)}</code></pre>
                          ` : html`
                            <p>${f.value !== null ? String(f.value) : '—'}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : nodeData.document?.payload && Object.keys(nodeData.document.payload).length ? html`
                    <div className="workspace-doc-content">
                      <h3>Payload del Documento</h3>
                      ${Object.entries(nodeData.document.payload).map(([k, v]) => html`
                        <div key=${k} className="workspace-payload-field">
                          <h3>${k}</h3>
                          ${typeof v === 'object' ? html`
                            <pre><code>${JSON.stringify(v, null, 2)}</code></pre>
                          ` : html`
                            <p>${String(v)}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : html`<p className="workspace-empty">Sin contenido estructurado.</p>`}
                `;
              })()}
            </section>
          ` : ''}

          ${nodeData && activeTab === 'graph' ? html`
            <section className="workspace-graph-pane" aria-label="Proyección de Grafo">
              ${nodeData.graph?.ok === false ? html`
                <div className="workspace-alert" role="alert">
                  Error en grafo local: ${nodeData.graph.error || 'No se pudo calcular la vecindad del grafo.'}
                </div>
              ` : html`
                <div className="workspace-graph-filter-bar">
                  <label htmlFor="edge-type-select">Filtrar relación:</label>
                  <select
                    id="edge-type-select"
                    value=${edgeTypeFilter}
                    onChange=${e => setEdgeTypeFilter(e.target.value)}
                    aria-label="Filtrar por tipo de relación"
                  >
                    <option value="">Todas las relaciones (${graphEdges.length})</option>
                    ${edgeTypes.map(t => html`<option key=${t} value=${t}>${t}</option>`)}
                  </select>
                </div>

                <h3>Vecindario Local (${nodeData.graph?.nodes?.length || 0} nodos, ${visibleGraphEdges.length} aristas visibles${edgeTypeFilter ? ` filtradas por "${edgeTypeFilter}"` : ''})</h3>
                <div className="workspace-graph-nodes-grid">
                  ${(() => {
                    const connected = new Set([selectedId]);
                    for (const e of visibleGraphEdges) {
                      if (e.source) connected.add(e.source);
                      if (e.target) connected.add(e.target);
                    }
                    return (nodeData.graph?.nodes || []).map(node => {
                      const isDimmed = !!edgeTypeFilter && !connected.has(node.id);
                      return html`
                        <div
                          key=${node.id}
                          className=${'workspace-graph-node-card' + (node.id === selectedId ? ' is-center' : '') + (isDimmed ? ' dimmed' : '')}
                          onClick=${() => handleSelectNode(node.id)}
                        >
                          <div className="workspace-badge">${node.model_name || 'Doc'}</div>
                          <div className="workspace-graph-node-title">${node.title || node.id}</div>
                          <code>${node.id}</code>
                        </div>
                      `;
                    });
                  })()}
                </div>

                ${visibleGraphEdges.length ? html`
                  <div className="workspace-graph-edges-list">
                    <h4>Aristas del vecindario</h4>
                    ${visibleGraphEdges.map((e, idx) => html`
                      <div key=${idx} className="workspace-edge-item">
                        <code>${e.source}</code>
                        <span className="workspace-edge-rel">──[${e.type || e.rel || 'rel'}]──▶</span>
                        <code>${e.target}</code>
                      </div>
                    `)}
                  </div>
                ` : html`<p className="workspace-empty">No hay aristas que coincidan con el filtro.</p>`}
              `}
            </section>
          ` : ''}

          ${nodeData && activeTab === 'code' ? html`
            <section className="workspace-code-pane" aria-label="Proyección de Código">
              ${!nodeData.code?.ok ? html`
                <div className="workspace-alert" role="status">
                  ${nodeData.code?.error || 'No se pudo generar la proyección de código para este documento.'}
                </div>
              ` : (nodeData.code?.files?.length ? html`
                <div>
                  ${nodeData.code.files.map((file, idx) => html`
                    <${CodeFileView} key=${idx} file=${file} />
                  `)}
                </div>
              ` : html`
                <p className="workspace-empty">Este nodo no tiene archivos de código declarados o vinculados.</p>
              `)}
            </section>
          ` : ''}
        </main>

        <aside className="workspace-sidebar" aria-label="Contexto y Relaciones">
          <section className="workspace-sidebar-section">
            <h3>Identidad Canónica</h3>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">ID</span>
              <strong className="workspace-identity-val">${nodeData?.identity?.id || '—'}</strong>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Modelo</span>
              <span className="workspace-identity-val">${nodeData?.identity?.model || '—'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Estado</span>
              <span className="workspace-identity-val">${nodeData?.identity?.status || 'Sin estado'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Nodo Actual</span>
              <span className="workspace-identity-val"><code>${nodeData?.identity?.current_node || 'Sin nodo'}</code></span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Path</span>
              <span className="workspace-identity-val">${nodeData?.identity?.path || '—'}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Content Hash (SLDB)</span>
              ${nodeData?.identity?.content_hash_error ? html`
                <span className="workspace-alert">${nodeData.identity.content_hash_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.content_hash}>
                  ${nodeData?.identity?.content_hash ? formatHash(nodeData.identity.content_hash, 16) : '—'}
                </span>
              `}
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">File Revision (Git/Disk)</span>
              ${nodeData?.identity?.file_revision_error ? html`
                <span className="workspace-alert">${nodeData.identity.file_revision_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.file_revision}>
                  ${nodeData?.identity?.file_revision ? formatHash(nodeData.identity.file_revision, 16) : '—'}
                </span>
              `}
            </div>
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Salientes (${nodeData?.context?.outgoing?.length || 0})</h3>
            ${nodeData?.context?.outgoing?.length ? html`
              <ul className="workspace-rel-list">
                ${nodeData.context.outgoing.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.target)}
                    >
                      <span className="workspace-edge-rel">${rel.type || rel.rel || 'rel'} →</span>
                      <span>${rel.target}</span>
                    </button>
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones salientes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Incidentes (${nodeData?.context?.incoming?.length || 0})</h3>
            ${nodeData?.context?.incoming?.length ? html`
              <ul className="workspace-rel-list">
                ${nodeData.context.incoming.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.source)}
                    >
                      <span className="workspace-edge-rel">← ${rel.type || rel.rel || 'rel'}</span>
                      <span>${rel.source}</span>
                    </button>
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones incidentes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Problemas de Integridad</h3>
            ${problemsInfo.state === 'error' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Error al consultar integridad del store:</strong>
                <p><code>${problemsInfo.error}</code></p>
              </div>
            ` : problemsInfo.state === 'node_problems' ? html`
              <div className="workspace-problems-alert" role="alert">
                <strong>Problemas detectados en este nodo (${problemsInfo.count}):</strong>
                <ul>
                  ${problemsInfo.list.map((p, idx) => html`
                    <li key=${idx}><code>${p}</code></li>
                  `)}
                </ul>
              </div>
            ` : problemsInfo.state === 'store_problems' ? html`
              <div className="workspace-problems-warning" role="alert">
                <strong>Inconsistencias en el store (${problemsInfo.storeTotal}):</strong>
                <p>El store tiene relaciones rechazadas globales que no nombran directamente a este nodo.</p>
              </div>
            ` : html`
              <div className="workspace-no-problems">
                ✓ Sin problemas detectados en el store.
              </div>
            `}
          </section>
        </aside>
      </div>
    </div>
  `;
}

export const workspaceView = {
  id: 'node',
  facet: 'workspace',
  label: 'Workspace',
  component: WorkspaceView,
  shell: {primary: false, workers: 'collapsed'},
  styles: ['/views/workspace/node/workspace.css']
};
