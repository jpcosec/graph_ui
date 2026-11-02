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
import {
  renderBlocks,
  splitInline,
  linksByRaw,
  sectionForAnchor,
  sectionAtLine,
  sectionFocus,
  fieldFocus,
  referenceFocus,
  edgeFocus,
  edgeKey,
  edgeFields,
  edgeDeclarations,
  referenceKey,
  sectionHighlighted,
  fieldHighlighted,
  edgeHighlighted,
  referenceHighlighted,
  lineInFocus,
  correspondence,
  describeFocus,
  nextRange,
  inRange,
  rangeLabel,
  targetFromSearch,
  targetKey
} from './reader.mjs';
import {ExplorerPanel} from '../explorer/explorer-view.js';

// Aviso fijo de las relaciones: salen del indice preparado, no certifican cambios externos.
// No afirma frescura ni se calcula a partir de stale vacio.
function RelationsNotice({where}) {
  return html`
    <div className="workspace-degraded-banner workspace-relations-notice" role="note" data-testid="relations-notice" data-where=${where}>
      <strong>Relaciones del índice preparado.</strong>
      Salen del índice de relaciones preparado antes de esta lectura y no certifican cambios externos.
      Si sabes que un documento o un contrato cambió después de prepararlo, hay que preparar las relaciones de nuevo
      fuera de la UI, con la operación pública (rebuild_edges), antes de considerarlas vigentes.
    </div>
  `;
}

function CodeFileView({file, focus, docId, onFocus, range, onRange, onOpenPath}) {
  const [showFull, setShowFull] = useState(false);
  const lineNum = file.fragment_line || file.line;
  const snippet = parseCodeSnippet(file.content, lineNum, 5);
  const key = referenceKey(file);
  const highlighted = referenceHighlighted(file, focus, docId);
  const fullLines = showFull && file.status === 'ok' && typeof file.content === 'string' ? file.content.split('\n') : [];
  if (fullLines.length && fullLines[fullLines.length - 1] === '') fullLines.pop();
  return html`
    <div
      className=${'workspace-code-file-card' + (highlighted ? ' is-focused' : '')}
      data-testid="code-card"
      data-ref-key=${key}
      data-field=${file.field || ''}
      data-position=${file.position ?? ''}
      data-focused=${highlighted ? 'true' : 'false'}
    >
      <div className="workspace-code-file-header">
        <button
          type="button"
          className="workspace-code-ref-btn"
          data-testid="code-ref-focus"
          title="Fijar foco en el campo de esta referencia"
          onClick=${() => onFocus(referenceFocus(file))}
        >
          <span className="workspace-code-filename">${file.path || file.reference}${lineNum ? `:${lineNum}` : ''}</span>
        </button>
        ${file.field ? html`<span className="workspace-badge" data-testid="code-ref-field">${file.field}[${file.position}]</span>` : ''}
        ${lineNum ? html`<span className="workspace-badge">Línea ${lineNum}</span>` : ''}
        ${file.status === 'ok' && String(file.path || '').toLowerCase().endsWith('.md') ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-open-doc" onClick=${() => onOpenPath(file.path)}>Abrir como documento</button>
        ` : ''}
        ${file.status === 'ok' ? html`
          <button type="button" className="workspace-link-btn" data-testid="code-toggle-full" aria-pressed=${showFull} onClick=${() => setShowFull(v => !v)}>
            ${showFull ? 'Ocultar archivo completo' : 'Ver archivo completo'}
          </button>
        ` : ''}
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
      ${showFull ? html`
        <div className="workspace-code-full" data-testid="code-full">
          <div className="workspace-code-range-bar">
            <span>Rango local (sin persistir):</span>
            <strong data-testid="code-range-label">${range ? rangeLabel(range) : 'ninguno'}</strong>
            ${range ? html`<button type="button" className="workspace-link-btn" data-testid="code-range-clear" onClick=${() => onRange(key, null)}>Limpiar</button>` : ''}
          </div>
          <table className="workspace-code-table workspace-code-table-full">
            <tbody>
              ${fullLines.map((text, idx) => {
                const n = idx + 1;
                return html`
                  <tr
                    key=${n}
                    className=${'workspace-code-line selectable' + (inRange(range, n) ? ' in-range' : '')}
                    data-line=${n}
                    onClick=${e => onRange(key, nextRange(range, n, e.shiftKey))}
                  >
                    <td className="workspace-code-line-num">${n}</td>
                    <td className="workspace-code-line-text">${text}</td>
                  </tr>
                `;
              })}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `;
}

function IrSectionView({section, focus, onFocus}) {
  const spanText = section.span ? `L${section.span.line_start ?? ''}-${section.span.line_end ?? ''}` : '';
  const focused = sectionHighlighted(section, focus);
  return html`
    <div className=${'workspace-ir-section' + (focused ? ' is-focused' : '')} data-section-path=${section.name || ''}>
      <h4 className="workspace-ir-title">
        <button
          type="button"
          className="workspace-ir-focus-btn"
          data-testid="section-focus"
          disabled=${!section.span}
          onClick=${() => section.span && onFocus(sectionFocus({path: section.name, title: section.title, line_start: section.span.line_start, line_end: section.span.line_end}))}
        >${section.title || section.name || 'Sección'}</button>
        ${spanText ? html`<small className="workspace-badge">${spanText}</small>` : ''}
      </h4>
      ${section.value ? html`<p>${typeof section.value === 'object' ? JSON.stringify(section.value) : String(section.value)}</p>` : ''}
      ${Array.isArray(section.children) && section.children.length ? html`
        <div>${section.children.map((c, i) => html`<${IrSectionView} key=${i} section=${{...c, span: c.span && (c.span.line_start != null || c.span.line_end != null) ? c.span : null}} focus=${focus} onFocus=${onFocus} />`)}</div>
      ` : ''}
    </div>
  `;
}

function InlineText({text, links, onOpenLink}) {
  const segs = splitInline(text, links);
  return html`${segs.map((seg, i) => {
    if (seg.type === 'text') return html`<span key=${i}>${seg.text}</span>`;
    const l = seg.link;
    if (!l) return html`<span key=${i} className="workspace-link-unresolved">${seg.raw}</span>`;
    if (l.status === 'ok' && l.open) {
      return html`<a
        key=${i}
        href="#"
        className="workspace-doc-link"
        data-testid="doc-link"
        data-status="ok"
        data-open=${l.open.id ? `id:${l.open.id}` : `path:${l.open.path}`}
        onClick=${e => { e.preventDefault(); onOpenLink(l); }}
      >${seg.label}</a>`;
    }
    if (l.status === 'externo') {
      return html`<span key=${i} className="workspace-link-external" data-testid="doc-link" data-status="externo" title=${l.cause}>${seg.label} ↗ (externo, no se abre)</span>`;
    }
    return html`<span key=${i} className="workspace-link-broken" data-testid="doc-link" data-status=${l.status} title=${l.cause}>${seg.label} (${l.status === 'no_markdown' ? 'no es Markdown' : 'roto'})</span>`;
  })}`;
}

function RenderedDocument({text, links, sections, focus, onFocus, onOpenLink}) {
  const blocks = renderBlocks(text);
  const byRaw = linksByRaw(links);
  const blockFocused = b => focus?.kind === 'section' && focus.line_start != null && b.line_start >= focus.line_start && b.line_end <= focus.line_end;
  return html`
    <div className="workspace-render" data-testid="doc-render">
      ${blocks.map((b, i) => {
        const cls = 'workspace-render-block' + (blockFocused(b) ? ' is-focused' : '');
        if (b.kind === 'frontmatter') {
          return html`<pre key=${i} className=${cls + ' workspace-render-frontmatter'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'code') {
          return html`<pre key=${i} className=${cls + ' workspace-render-code'} data-line-start=${b.line_start}><code>${b.lines.join('\n')}</code></pre>`;
        }
        if (b.kind === 'heading') {
          const sec = (sections || []).find(s => s.line_start === b.line_start);
          const Tag = 'h' + Math.min(6, b.level + 1);
          return html`<${Tag} key=${i} className=${cls + ' workspace-render-heading'} data-line-start=${b.line_start} data-section-path=${sec?.path || ''}>
            ${sec ? html`<button type="button" className="workspace-ir-focus-btn" data-testid="render-heading" onClick=${() => onFocus(sectionFocus(sec))}>${b.text}</button>` : b.text}
          <//>`;
        }
        if (b.kind === 'list') {
          return html`<ul key=${i} className=${cls} data-line-start=${b.line_start}>${b.items.map(it => html`<li key=${it.line}><${InlineText} text=${it.text} links=${byRaw} onOpenLink=${onOpenLink} /></li>`)}</ul>`;
        }
        return html`<p key=${i} className=${cls} data-line-start=${b.line_start}>${b.lines.map((ln, j) => html`<span key=${j}><${InlineText} text=${ln} links=${byRaw} onOpenLink=${onOpenLink} />${j < b.lines.length - 1 ? ' ' : ''}</span>`)}</p>`;
      })}
    </div>
  `;
}

function RawSource({text, focus, fields}) {
  const lines = String(text ?? '').split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return html`
    <div className="workspace-source" data-testid="doc-source" role="region" aria-label="Fuente cruda">
      <table className="workspace-code-table">
        <tbody>
          ${lines.map((ln, idx) => html`
            <tr key=${idx} className=${'workspace-code-line workspace-src-line' + (lineInFocus(idx + 1, focus, fields) ? ' in-range is-focused' : '')} data-line=${idx + 1}>
              <td className="workspace-code-line-num">${idx + 1}</td>
              <td className="workspace-code-line-text">${ln}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function describeSourceError(err) {
  if (!err) return '';
  const estado = err.body?.estado;
  return estado ? `${err.message} [${estado}]` : (err.message || 'Error al cargar el documento');
}

function WorkspaceView() {
  const [catalog, setCatalog] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  // Estado de GET /nodes para el explorador: 'pending' | 'error' | 'ok'. Solo 'ok' confirma la carga de modelos.
  const [catalogStatus, setCatalogStatus] = useState('pending');
  const [target, setTarget] = useState(() => targetFromSearch(window.location.search));
  const [depth, setDepth] = useState(1);
  const [activeTab, setActiveTab] = useState('document');
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState('');
  const [sourceRaw, setSource] = useState(null);
  const [sourceError, setSourceError] = useState('');
  const [nodeRaw, setNodeData] = useState(null);
  const [nodeError, setNodeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState(null);
  const [ranges, setRanges] = useState({});
  const [anchorNote, setAnchorNote] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [explorer, setExplorer] = useState(null);
  const [explorerError, setExplorerError] = useState('');
  const [explorerLoading, setExplorerLoading] = useState(false);

  const sourceGen = useRef(0);
  const nodeGen = useRef(0);
  const catalogGen = useRef(0);
  const explorerGen = useRef(0);
  // Contador local del lector: se incrementa al navegar a OTRO documento. Cada estado cargado
  // (fuente, nodo, codigo, relaciones) queda ligado a la identidad que lo pidio y a este
  // contador; la respuesta de una generacion anterior se descarta en todos los paneles.
  const navGen = useRef(0);
  const tKeyRef = useRef(targetKey(targetFromSearch(window.location.search)));
  const pendingAnchor = useRef(new URLSearchParams(window.location.search).get('anchor'));

  const tKey = targetKey(target);
  // Solo se usa el estado ligado a la identidad vigente y a la generacion vigente.
  const source = sourceRaw && sourceRaw._gen === navGen.current && sourceRaw._key === tKey ? sourceRaw : null;
  const selectedId = source?.identity?.id || target?.id || '';
  const modeledId = source?.identity?.kind === 'modeled' ? source.identity.id : '';
  const nodeData = nodeRaw && nodeRaw._gen === navGen.current && nodeRaw._id === modeledId ? nodeRaw : null;

  // La URL lleva id o path (excluyentes), depth, tab y, al seguir un enlace con ancla, anchor.
  const updateUrl = (nextTarget, newDepth, tab, {replace = false, anchor = null} = {}) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      url.searchParams.delete('path');
      url.searchParams.delete('anchor');
      if (nextTarget?.id) url.searchParams.set('id', nextTarget.id);
      else if (nextTarget?.path) url.searchParams.set('path', nextTarget.path);
      if (anchor) url.searchParams.set('anchor', anchor);
      url.searchParams.set('depth', String(newDepth || 1));
      url.searchParams.set('tab', tab || 'document');
      const newPath = url.pathname + url.search;
      if (replace) window.history.replaceState(null, '', newPath);
      else window.history.pushState(null, '', newPath);
    } catch {}
  };

  const navigateTo = next => {
    const key = targetKey(next);
    if (key === tKeyRef.current) return false;
    tKeyRef.current = key;
    navGen.current += 1;
    // Nada del documento anterior sobrevive: cada panel pasa a carga.
    setSource(null);
    setSourceError('');
    setNodeData(null);
    setNodeError('');
    setAnchorNote('');
    setFocus(null);
    setTarget(next);
    return true;
  };

  const syncFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDepth = parseInt(params.get('depth') || '1', 10);
      const urlTab = params.get('tab') || 'document';
      if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
      if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
      pendingAnchor.current = params.get('anchor');
      const next = targetFromSearch(window.location.search);
      if (next) navigateTo(next);
    } catch {}
  };

  const loadCatalog = async () => {
    const token = ++catalogGen.current;
    setCatalogError('');
    setCatalogStatus('pending');
    const params = new URLSearchParams(window.location.search);
    const urlDepth = parseInt(params.get('depth') || '1', 10);
    const urlTab = params.get('tab') || 'document';
    if (urlDepth === 1 || urlDepth === 2) setDepth(urlDepth);
    if (TABS.some(t => t.id === urlTab)) setActiveTab(urlTab);
    try {
      const res = await request('/api/workspace/nodes');
      if (token !== catalogGen.current) return;
      const nodes = res.nodes || [];
      setCatalog(nodes);
      setCatalogStatus('ok');
      if (!targetFromSearch(window.location.search)) {
        if (nodes.length > 0) navigateTo({id: nodes[0].id});
        else setLoading(false);
      }
    } catch (err) {
      if (token === catalogGen.current) {
        setCatalogError(err.message || 'Error al cargar catálogo de nodos');
        setCatalogStatus('error');
        if (!targetFromSearch(window.location.search)) setLoading(false);
      }
    }
  };

  // Explorador (WS13.2): solo GET /api/workspace/explorer, sin parametros de ruta del cliente.
  const loadExplorer = async () => {
    const token = ++explorerGen.current;
    setExplorerLoading(true);
    setExplorerError('');
    try {
      const res = await request('/api/workspace/explorer');
      if (token !== explorerGen.current) return;
      setExplorer(res);
    } catch (err) {
      if (token === explorerGen.current) {
        setExplorer(null);
        setExplorerError(err.message || 'Error al cargar el explorador');
      }
    } finally {
      if (token === explorerGen.current) setExplorerLoading(false);
    }
  };

  // Refresco explicito: recarga /nodes y /explorer. No relee el documento abierto ("Actualizar" ya lo hace).
  const refreshCatalogs = () => {
    loadCatalog();
    loadExplorer();
  };

  // Un solo lector: la fuente, el render y el contexto salen de una unica respuesta de /source.
  const loadSource = async currentTarget => {
    if (!currentTarget) {
      setSource(null);
      setLoading(false);
      return;
    }
    const token = ++sourceGen.current;
    const gen = navGen.current;
    const askedKey = targetKey(currentTarget);
    const stale = () => token !== sourceGen.current || gen !== navGen.current;
    setLoading(true);
    setSourceError('');
    try {
      const qs = currentTarget.id ? `id=${encodeURIComponent(currentTarget.id)}` : `path=${encodeURIComponent(currentTarget.path)}`;
      const res = await request(`/api/workspace/source?${qs}`);
      if (stale()) return;
      setSource({...res, _gen: gen, _key: askedKey});
      if (pendingAnchor.current) {
        const sec = sectionForAnchor(res.sections, pendingAnchor.current);
        if (sec) {
          setFocus(sectionFocus(sec));
          setAnchorNote('');
        } else {
          setAnchorNote(`Ancla no encontrada: ${pendingAnchor.current}`);
        }
        pendingAnchor.current = null;
      } else {
        setAnchorNote('');
      }
    } catch (err) {
      if (!stale()) {
        setSource(null);
        setSourceError(describeSourceError(err));
      }
    } finally {
      if (!stale()) setLoading(false);
    }
  };

  const loadNode = async (id, currentDepth) => {
    if (!id) {
      setNodeData(null);
      setNodeError('');
      return;
    }
    const token = ++nodeGen.current;
    const gen = navGen.current;
    const stale = () => token !== nodeGen.current || gen !== navGen.current;
    setNodeError('');
    try {
      const res = await request(`/api/workspace/node?id=${encodeURIComponent(id)}&depth=${currentDepth}`);
      if (stale()) return;
      const node = res.node || {};
      const projections = res.projections || {};
      const context = res.context || {};
      setNodeData({
        _gen: gen,
        _id: id,
        relations: context.relations_state || null,
        identity: {
          status: context.status || node.status || '',
          current_node: context.current_node || '',
          content_hash: context.content_hash || node.content_hash || '',
          content_hash_error: context.content_hash_error || null,
          file_revision: context.file_revision || node.file_revision || '',
        },
        document: {
          is_degraded: node.is_degraded || !projections.document?.ok,
          error: projections.document?.error,
          title: projections.document?.payload?.title || projections.document?.payload?.name || node.name || id,
          payload: projections.document?.payload || {},
        },
        graph: projections.graph || {ok: false, nodes: [], edges: [], error: 'Sin datos de grafo'},
        code: projections.code || {ok: false, files: []},
        problems: context.problems_report || {ok: true, problems: []}
      });
    } catch (err) {
      if (!stale()) {
        setNodeData(null);
        setNodeError(err.message || 'Error al cargar datos del nodo');
      }
    }
  };

  useEffect(() => {
    loadCatalog();
    loadExplorer();
    const onPopState = () => syncFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => {
      ++catalogGen.current;
      ++explorerGen.current;
      ++sourceGen.current;
      ++nodeGen.current;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    loadSource(target);
  }, [tKey, reloadCount]);

  useEffect(() => {
    if (modeledId) loadNode(modeledId, depth);
    else {
      ++nodeGen.current;
      setNodeData(null);
      setNodeError('');
    }
  }, [modeledId, depth, reloadCount]);

  const openTarget = (nextTarget, {anchor = null, replace = false} = {}) => {
    if (!nextTarget) return;
    pendingAnchor.current = anchor;
    const same = targetKey(nextTarget) === tKey;
    updateUrl(nextTarget, depth, activeTab, {replace, anchor});
    if (same) {
      // mismo documento: se relee (refresco), no se abre otra copia
      setReloadCount(c => c + 1);
      return;
    }
    navigateTo(nextTarget);
  };

  const handleOpenLink = link => {
    if (!link?.open) return;
    openTarget(link.open, {anchor: link.anchor || null});
  };

  const handleTabChange = tabId => {
    setActiveTab(tabId);
    updateUrl(target, depth, tabId, {});
  };

  const handleDepthChange = newDepth => {
    setDepth(newDepth);
    updateUrl(target, newDepth, activeTab, {});
  };

  const handleSelectNode = id => {
    if (!id || id === '__path__' || id === selectedId) return;
    openTarget({id});
  };

  const handleRange = (key, range) => setRanges(prev => ({...prev, [key]: range}));

  const availableModels = Array.from(new Set(catalog.map(n => n.model_name).filter(Boolean))).sort();
  const filteredNodes = filterCatalog(catalog, searchQuery, modelFilter);
  const problemsInfo = formatProblems(nodeData?.problems);

  const modeled = source?.identity?.kind === 'modeled';
  const unmodeled = source?.identity?.kind === 'unmodeled';
  const openDocId = modeled ? source.identity.id : '';
  // Carga real por panel: nada de valores ausentes ni datos del documento anterior.
  const sourceLoading = !!target && !source && !sourceError;
  const nodeLoading = sourceLoading || (modeled && !nodeData && !nodeError);
  const relationsState = source?.context?.relations_state || null;
  const notReady = relationsState && relationsState.ok === false ? relationsState : (nodeData?.relations?.ok === false ? nodeData.relations : null);
  // Un solo documento, dos lecturas (/source y /node): si la revision difiere, se avisa sin unificar.
  const revisionMismatch = !!(modeled && nodeData && source.revision && nodeData.identity.file_revision && nodeData.identity.file_revision !== source.revision);
  const graphEdges = nodeData?.graph?.edges || [];
  const edgeTypes = distinctEdgeTypes(graphEdges);
  const visibleGraphEdges = filterGraphEdges(graphEdges, edgeTypeFilter);
  const codeFiles = nodeData?.code?.files || [];
  const sections = source?.sections || [];
  const fields = source?.fields || [];
  const corr = correspondence(focus, {sections, fields, edges: graphEdges, files: codeFiles, docId: openDocId});
  const outgoing = source?.context?.outgoing_relations || [];
  const incoming = source?.context?.incoming_relations || [];
  const docTitle = source
    ? (source.descriptor?.payload?.title || nodeData?.document?.title || sections.find(s => s.level === 1)?.title || source.identity.path)
    : '';
  const headerTitle = source?.identity?.id || source?.identity?.path || selectedId || target?.path || 'Workspace';
  const selectValue = target?.id || '';

  return html`
    <div className="workspace-view">
      <header className="workspace-header">
        <div className="workspace-header-title">
          <div className="workspace-eyebrow">WORKSPACE / MULTI-PROYECCIÓN</div>
          <h1>${headerTitle}</h1>
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
              value=${selectValue || (target?.path ? '__path__' : '')}
              onChange=${e => handleSelectNode(e.target.value)}
              aria-label="Seleccionar nodo activo"
            >
              ${target?.path ? html`<option value="__path__">[sin modelo] ${target.path}</option>` : ''}
              ${selectValue && !filteredNodes.some(n => n.id === selectValue) ? html`
                <option value=${selectValue}>${selectValue}</option>
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
            onClick=${() => setReloadCount(c => c + 1)}
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
      ${sourceError ? html`<div className="workspace-alert" role="alert" data-testid="source-error">Error: ${sourceError}</div>` : ''}
      ${nodeError ? html`<div className="workspace-alert" role="alert">Error: ${nodeError}</div>` : ''}
      ${anchorNote ? html`<div className="workspace-alert" role="status" data-testid="anchor-note">${anchorNote}</div>` : ''}

      ${focus ? html`
        <div className="workspace-focus-bar" role="status" data-testid="focus-bar" data-focus-kind=${focus.kind}>
          <strong>Foco:</strong> <span data-testid="focus-desc">${describeFocus(focus)}</span>
          <span className="workspace-focus-corr" data-testid="focus-corr">
            Documento: ${corr.document} · Grafo: ${source && unmodeled ? 'sin grafo' : corr.graph} · Código: ${source && unmodeled ? 'sin referencias' : corr.code}
          </span>
          <button type="button" className="workspace-link-btn" data-testid="focus-clear" onClick=${() => setFocus(null)}>Limpiar foco</button>
        </div>
      ` : ''}

      <div className="workspace-body">
        <${ExplorerPanel}
          explorer=${explorer}
          catalog=${catalog}
          catalogStatus=${catalogStatus}
          error=${explorerError}
          loading=${explorerLoading}
          selectedId=${openDocId}
          selectedPath=${source?.identity?.path || target?.path || ''}
          onOpenId=${id => handleSelectNode(id)}
          onOpenPath=${path => openTarget({path})}
          onRefresh=${refreshCatalogs}
        />
        <main className="workspace-main" aria-label="Proyección activa">
          ${sourceLoading && activeTab === 'document' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="document">Cargando documento…</p>` : ''}
          ${!loading && !target && !sourceError ? html`<p className="workspace-empty">Selecciona un nodo del catálogo para visualizar sus proyecciones.</p>` : ''}

          ${source ? html`
            <section
              className="workspace-doc-pane"
              aria-label="Proyección Documental"
              data-testid="document-reader"
              data-revision=${source.revision}
              data-identity=${source.identity.id || source.identity.path}
              hidden=${activeTab !== 'document'}
            >
              ${(modeled && (nodeData?.document?.is_degraded || source.ir_error)) ? html`
                <div className="workspace-degraded-banner" role="status">
                  <strong>Documento Degradado</strong>
                  <p>${source.ir_error || nodeData?.document?.error || 'El documento no pudo ser procesado con IR completo, pero su representación básica sigue disponible.'}</p>
                </div>
              ` : ''}

              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              <header className="workspace-doc-header">
                <h2>${docTitle}</h2>
                <div className="workspace-doc-meta">
                  <span className="workspace-badge">${source.identity.model_name || 'sin modelo'}</span>
                  <code>${source.identity.path}</code>
                  <span className="workspace-badge" data-testid="doc-revision" title=${source.revision}>sha256 ${formatHash(source.revision, 12)}</span>
                  ${source.encoding === 'utf-8-replaced' ? html`<span className="workspace-badge workspace-badge-warn" data-testid="doc-encoding">utf-8-replaced</span>` : ''}
                </div>
              </header>

              <div className="workspace-reader-columns">
                <section className="workspace-reader-col" aria-label="Render">
                  <h3>Render</h3>
                  <${RenderedDocument}
                    text=${source.text}
                    links=${source.links}
                    sections=${sections}
                    focus=${focus}
                    onFocus=${setFocus}
                    onOpenLink=${handleOpenLink}
                  />
                </section>
                <section className="workspace-reader-col" aria-label="Fuente">
                  <h3>Fuente <small className="workspace-badge">${source.line_count} líneas</small></h3>
                  <${RawSource} text=${source.text} focus=${focus} fields=${fields} />
                </section>
              </div>

              ${(() => {
                const irSections = modeled && source.ir ? irSectionsWithCleanMeta(source.ir) : [];
                const irFieldList = modeled && source.ir ? irFields(source.ir, source.descriptor?.payload) : [];
                return html`
                  ${irSections.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Estructura Documental (IR)</h3>
                      ${irSections.map((sec, i) => html`<${IrSectionView} key=${i} section=${sec} focus=${focus} onFocus=${setFocus} />`)}
                    </div>
                  ` : ''}
                  ${unmodeled && sections.length ? html`
                    <div className="workspace-doc-content" data-testid="outline">
                      <h3>Secciones (sin modelo)</h3>
                      <ul className="workspace-outline">
                        ${sections.map((sec, i) => html`
                          <li key=${i} className=${sectionHighlighted(sec, focus) ? 'is-focused' : ''} style=${{marginLeft: `${Math.max(0, (sec.level || 1) - 1) * 14}px`}}>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="section-focus" onClick=${() => setFocus(sectionFocus(sec))}>${sec.title}</button>
                            <small className="workspace-badge">L${sec.line_start}-${sec.line_end}</small>
                          </li>
                        `)}
                      </ul>
                    </div>
                  ` : ''}
                  ${irFieldList.length ? html`
                    <div className="workspace-doc-content">
                      <h3>Campos del Documento (IR)</h3>
                      ${irFieldList.map((f, i) => html`
                        <div
                          key=${i}
                          className=${'workspace-payload-field' + (fieldHighlighted(f.field_path, focus, graphEdges, openDocId) ? ' is-focused' : '')}
                          data-field-path=${f.field_path}
                        >
                          <h3>
                            <button type="button" className="workspace-ir-focus-btn" data-testid="field-focus" onClick=${() => setFocus(fieldFocus(f.field_path))}>${f.field_path}</button>
                            ${f.span ? html`<small className="workspace-badge">L${f.span.line_start}-${f.span.line_end}</small>` : ''}
                          </h3>
                          ${typeof f.value === 'object' && f.value !== null ? html`
                            <pre><code>${JSON.stringify(f.value, null, 2)}</code></pre>
                          ` : html`
                            <p>${f.value !== null ? String(f.value) : '—'}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : modeled && source.descriptor?.payload && Object.keys(source.descriptor.payload).length ? html`
                    <div className="workspace-doc-content">
                      <h3>Payload del Documento (descriptor)</h3>
                      ${Object.entries(source.descriptor.payload).map(([k, v]) => html`
                        <div key=${k} className="workspace-payload-field" data-field-path=${k}>
                          <h3>${k}</h3>
                          ${typeof v === 'object' ? html`
                            <pre><code>${JSON.stringify(v, null, 2)}</code></pre>
                          ` : html`
                            <p>${String(v)}</p>
                          `}
                        </div>
                      `)}
                    </div>
                  ` : ''}
                `;
              })()}
            </section>
          ` : ''}

          ${sourceLoading && activeTab === 'graph' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="graph">Cargando grafo…</p>` : ''}
          ${sourceLoading && activeTab === 'code' ? html`<p role="status" className="workspace-empty" data-testid="panel-loading" data-panel="code">Cargando código…</p>` : ''}

          ${source && activeTab === 'graph' ? html`
            <section className="workspace-graph-pane" aria-label="Proyección de Grafo">
              ${modeled ? html`<${RelationsNotice} where="graph" />` : ''}
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-graph">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : (nodeData?.graph?.ok === false || (!nodeData && nodeError)) ? html`
                <div className="workspace-alert" role="alert" data-testid=${nodeData?.graph?.estado === 'store_no_preparado' ? 'store-no-preparado' : 'graph-error'}>
                  ${nodeData?.graph?.estado === 'store_no_preparado'
                    ? `Store no preparado: ${(nodeData.graph.stale || []).length} documento(s) con el índice de aristas atrasado (${(nodeData.graph.stale || []).join(', ')}). Se prepara fuera de la petición con rebuild_edges.`
                    : `Error en grafo local: ${nodeData?.graph?.error || nodeError || 'No se pudo calcular la vecindad del grafo.'}`}
                </div>
              ` : !nodeData ? html`<p role="status" className="workspace-empty">Cargando grafo…</p>` : html`
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
                    ${visibleGraphEdges.map((e, idx) => {
                      const on = edgeHighlighted(e, focus, openDocId);
                      const fieldsOfEdge = edgeFields(e, openDocId);
                      return html`
                        <div
                          key=${idx}
                          className=${'workspace-edge-item' + (on ? ' is-focused' : '')}
                          data-testid="edge-item"
                          data-edge-key=${edgeKey(e)}
                          data-focused=${on ? 'true' : 'false'}
                          data-fields=${fieldsOfEdge.join(',')}
                          role="button"
                          tabIndex="0"
                          onClick=${() => setFocus(edgeFocus(e))}
                          onKeyDown=${ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setFocus(edgeFocus(e)); } }}
                        >
                          <code>${e.source}</code>
                          <span className="workspace-edge-rel">──[${e.type || e.rel || 'rel'}]──▶</span>
                          <code>${e.target}</code>
                          ${fieldsOfEdge.length ? html`<span className="workspace-edge-prov" data-testid="edge-prov">campo: ${fieldsOfEdge.join(', ')}</span>` : ''}
                        </div>
                      `;
                    })}
                  </div>
                ` : html`<p className="workspace-empty">No hay aristas que coincidan con el filtro.</p>`}
              `}
            </section>
          ` : ''}

          ${source && activeTab === 'code' ? html`
            <section className="workspace-code-pane" aria-label="Proyección de Código">
              ${revisionMismatch ? html`<div className="workspace-alert" role="status" data-testid="revision-mismatch">Aviso: la revisión de /node (${formatHash(nodeData.identity.file_revision, 12)}) difiere de la de /source (${formatHash(source.revision, 12)}) para este documento; no se unifican.</div>` : ''}
              ${unmodeled ? html`
                <div className="workspace-alert" role="status" data-testid="no-code">
                  Sin grafo ni referencias: el documento no está en el store, no se inventan vínculos.
                </div>
              ` : !nodeData ? html`
                <p role="status" className="workspace-empty">${nodeError ? 'Código no disponible.' : 'Cargando código…'}</p>
              ` : !nodeData.code?.ok ? html`
                <div className="workspace-alert" role="status">
                  ${nodeData.code?.error || 'No se pudo generar la proyección de código para este documento.'}
                </div>
              ` : (codeFiles.length ? html`
                <div>
                  ${codeFiles.map(file => html`
                    <${CodeFileView}
                      key=${referenceKey(file)}
                      file=${file}
                      focus=${focus}
                      docId=${openDocId}
                      onFocus=${setFocus}
                      range=${ranges[referenceKey(file)] || null}
                      onRange=${handleRange}
                      onOpenPath=${p => openTarget({path: p})}
                    />
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
              <strong className="workspace-identity-val">${source?.identity?.id || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</strong>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Modelo</span>
              <span className="workspace-identity-val">${source?.identity?.model_name || (unmodeled ? 'Sin modelo (ausente)' : (sourceLoading ? 'Cargando…' : '—'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Estado</span>
              <span className="workspace-identity-val">${nodeData?.identity?.status || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin estado'))}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Nodo Actual</span>
              <span className="workspace-identity-val"><code>${nodeData?.identity?.current_node || (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : 'Sin nodo'))}</code></span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Path</span>
              <span className="workspace-identity-val" data-testid="ctx-path">${source?.identity?.path || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Repo</span>
              <span className="workspace-identity-val">${source?.identity?.repo || (sourceLoading ? 'Cargando…' : '—')}</span>
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">Content Hash (SLDB)</span>
              ${nodeData?.identity?.content_hash_error ? html`
                <span className="workspace-alert">${nodeData.identity.content_hash_error}</span>
              ` : html`
                <span className="workspace-identity-val" title=${nodeData?.identity?.content_hash}>
                  ${nodeData?.identity?.content_hash ? formatHash(nodeData.identity.content_hash, 16) : (unmodeled ? 'Ausente' : (nodeLoading ? 'Cargando…' : '—'))}
                </span>
              `}
            </div>
            <div className="workspace-identity-prop">
              <span className="workspace-identity-label">File Revision (Git/Disk)</span>
              <span className="workspace-identity-val" data-testid="ctx-revision" title=${source?.revision}>
                ${source?.revision ? formatHash(source.revision, 16) : (sourceLoading ? 'Cargando…' : '—')}
              </span>
            </div>
          </section>

          <section className="workspace-sidebar-section">
            ${modeled ? html`<${RelationsNotice} where="context" />` : ''}
            <h3>Relaciones Salientes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : outgoing.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty" data-testid="rel-absent">${source.context.relations_absent}</p>` : notReady ? html`
              <div className="workspace-alert" role="alert" data-testid="store-no-preparado-rel">
                Store no preparado (${notReady.estado}): ${(notReady.stale || []).length} documento(s) atrasados${(notReady.stale || []).length ? ` (${notReady.stale.join(', ')})` : ''}. Sin relaciones ni procedencia hasta preparar el índice fuera de la petición.
              </div>
            ` : outgoing.length ? html`
              <ul className="workspace-rel-list">
                ${outgoing.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.target)}
                    >
                      <span className="workspace-edge-rel">${rel.type || rel.rel || 'rel'} →</span>
                      <span>${rel.target}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones salientes.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Relaciones Incidentes (${unmodeled ? 'ausentes' : (sourceLoading ? 'cargando' : (notReady ? 'no preparado' : incoming.length))})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="relations-in">Cargando relaciones…</p>` : unmodeled ? html`<p className="workspace-empty">Ausentes: documento no modelado.</p>` : notReady ? html`<p className="workspace-empty">Store no preparado: sin relaciones incidentes.</p>` : incoming.length ? html`
              <ul className="workspace-rel-list">
                ${incoming.map((rel, idx) => html`
                  <li key=${idx}>
                    <button
                      className="workspace-rel-item-btn"
                      onClick=${() => handleSelectNode(rel.source)}
                    >
                      <span className="workspace-edge-rel">← ${rel.type || rel.rel || 'rel'}</span>
                      <span>${rel.source}</span>
                    </button>
                    ${edgeDeclarations(rel).length ? html`<small className="workspace-edge-prov" data-testid="rel-prov-in">declara: ${edgeDeclarations(rel).map(d => `${d.owner === openDocId ? 'este documento' : (d.owner || '?')}.${d.field}`).join(', ')}</small>` : ''}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin relaciones incidentes.</p>`}
            ${source?.context?.relations_error ? html`<div className="workspace-alert" role="alert">${source.context.relations_error}</div>` : ''}
          </section>

          <section className="workspace-sidebar-section" data-testid="links-section">
            <h3>Enlaces del documento (${sourceLoading ? 'cargando' : (source?.links || []).length})</h3>
            ${sourceLoading ? html`<p className="workspace-empty" data-testid="panel-loading" data-panel="links">Cargando enlaces…</p>` : (source?.links || []).length ? html`
              <ul className="workspace-rel-list">
                ${source.links.map((l, idx) => html`
                  <li key=${idx} data-status=${l.status} data-testid="link-item">
                    ${l.status === 'ok' && l.open ? html`
                      <button className="workspace-rel-item-btn" onClick=${() => handleOpenLink(l)}>
                        <span className="workspace-edge-rel">→</span>
                        <span>${l.target}</span>
                      </button>
                    ` : html`
                      <span className=${l.status === 'externo' ? 'workspace-link-external' : 'workspace-link-broken'}>${l.target}</span>
                      <small className="workspace-edge-prov">${l.status}: ${l.cause} (origen ${l.origin?.path}:${l.origin?.line ?? '?'})</small>
                    `}
                  </li>
                `)}
              </ul>
            ` : html`<p className="workspace-empty">Sin enlaces.</p>`}
          </section>

          <section className="workspace-sidebar-section">
            <h3>Problemas de Integridad</h3>
            ${unmodeled ? html`
              <p className="workspace-empty">No aplica: el documento no está en el store.</p>
            ` : nodeLoading ? html`
              <p className="workspace-empty" data-testid="panel-loading" data-panel="problems">Cargando integridad…</p>
            ` : problemsInfo.state === 'error' ? html`
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
