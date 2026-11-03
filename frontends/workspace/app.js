// Standalone KIMUN / SLDB Knowledge Workspace client
const state = {
  overview: null,
  nodes: [],
  nodeById: new Map(),
  nodeByName: new Map(),
  activeNav: 'tasks',
  catalogFilter: '',
  selectedNodeId: null,
  selectedNodeData: null,
  activeTab: 'document',
  surfaceMode: 'node', // 'node' | 'overview' | 'agents' | 'runs' | 'history'
  graphDepth: 1,
  graphModelFilter: 'ALL',
  graphEdgeFilter: 'ALL',
  selectedCodeIndex: 0,
};

function esc(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shortHash(h) {
  if (!h) return '—';
  return String(h).slice(0, 12);
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

function formatRichProse(text) {
  if (!text) return '<span style="color:var(--muted)">Sin contenido textual en esta sección.</span>';
  const safe = esc(text);
  // Highlight inline backticks or file paths and @mentions / node IDs
  return safe.replace(
    /`([^`]+)`|\b([A-Z][A-Za-z0-9_]*Doc:[a-zA-Z0-9._-]+)\b|\b((?:task|atom|pill|materialization|anchor|spec)-[a-zA-Z0-9._-]+)\b|\b((?:frontends|tests|desk|docs|src|knowledge)\/[a-zA-Z0-9._\/-]+(?::\d+)?)\b/g,
    (match, tick, canon, slug, fpath) => {
      const token = tick || canon || slug || fpath;
      if (!token) return match;
      if (state.nodeById.has(token)) {
        return `<span class="mention" data-jump-node="${esc(token)}">@${esc(token)}</span>`;
      }
      if (state.nodeByName.has(token)) {
        const target = state.nodeByName.get(token);
        return `<span class="mention" data-jump-node="${esc(target.id)}">@${esc(token)}</span>`;
      }
      if (
        token.includes('/') &&
        (token.startsWith('frontends/') ||
          token.startsWith('tests/') ||
          token.startsWith('desk/') ||
          token.startsWith('docs/') ||
          token.startsWith('src/') ||
          token.endsWith('.py') ||
          token.endsWith('.js') ||
          token.endsWith('.mjs') ||
          token.endsWith('.md') ||
          token.endsWith('.yml') ||
          token.endsWith('.yaml'))
      ) {
        return `<span class="code-chip" data-jump-code="${esc(token)}">${esc(token)}</span>`;
      }
      if (tick) {
        return `<code class="code-chip">${esc(tick)}</code>`;
      }
      return match;
    }
  );
}

function updateChromeFromOverview() {
  const ov = state.overview;
  if (!ov) return;
  const st = ov.store || {};
  const counts = st.category_counts || {};
  const workers = (ov.workers && ov.workers.workers) || [];
  const changesCount =
    ((ov.changes && ov.changes.modified_count) || 0) +
    ((ov.changes && ov.changes.problems_count) || 0);

  document.getElementById('top-store-pill').textContent = `${st.repo_name || 'repo'} · .sldb`;
  document.getElementById('top-nodes-pill').textContent = `${st.total_nodes || 0} nodes`;
  document.getElementById('top-agents-pill').innerHTML =
    `<span class="${workers.length ? 'status-dot-ok' : ''}">●</span> ${workers.length} agents active`;

  document.getElementById('badge-tasks').textContent = counts.tasks ?? 0;
  document.getElementById('badge-documents').textContent = counts.documents ?? 0;
  document.getElementById('badge-atoms').textContent = counts.atoms ?? 0;
  document.getElementById('badge-code').textContent = counts.code ?? 0;
  document.getElementById('badge-graph').textContent = counts.graph ?? 0;
  document.getElementById('badge-agents').textContent = workers.length + (counts.agents ?? 0);
  document.getElementById('badge-runs').textContent = ((ov.runs && ov.runs.length) || 0) + (counts.runs ?? 0);
  document.getElementById('badge-changes').textContent = changesCount;
  document.getElementById('badge-history').textContent = (ov.history && ov.history.length) || 0;

  document.getElementById('footer-counts').textContent =
    `${st.total_nodes || 0} nodes · ${st.total_edges || 0} edges · ${st.problems_count || 0} problems`;
  document.getElementById('footer-head').textContent = `HEAD ${st.head_short || '—'}`;
  document.getElementById('footer-runtime').textContent = `${workers.length} workers active`;
}

function renderCatalog() {
  const nav = state.activeNav;
  const catFilter = ['tasks', 'documents', 'atoms', 'code', 'graph', 'runs', 'agents'].includes(nav)
    ? nav
    : 'all';
  const q = state.catalogFilter.trim().toLowerCase();

  const filtered = state.nodes.filter((n) => {
    if (catFilter !== 'all' && n.category !== catFilter) return false;
    if (!q) return true;
    return (
      n.id.toLowerCase().includes(q) ||
      (n.title || '').toLowerCase().includes(q) ||
      (n.model_name || '').toLowerCase().includes(q) ||
      (n.path || '').toLowerCase().includes(q)
    );
  });

  document.getElementById('catalog-category-title').textContent =
    catFilter === 'all' ? 'All Nodes' : catFilter.toUpperCase();
  document.getElementById('catalog-filtered-count').textContent = filtered.length;

  const listEl = document.getElementById('catalog-list');
  const slice = filtered.slice(0, 200);
  listEl.innerHTML = slice
    .map(
      (n) => `
      <div class="catalog-item ${n.id === state.selectedNodeId ? 'selected' : ''}" data-node-id="${esc(n.id)}">
        <div class="catalog-item-top">
          <span class="catalog-item-model">${esc(n.model_name)}</span>
          <span class="catalog-item-status">${esc(n.status || '')}</span>
        </div>
        <div class="catalog-item-title">${esc(n.title || n.name)}</div>
        <div class="catalog-item-name">${esc(n.name)}</div>
      </div>`
    )
    .join('');
}

function renderContextSidebar() {
  const el = document.getElementById('context-sidebar');
  const d = state.selectedNodeData;
  if (!d || !d.context) {
    el.innerHTML = `
      <div class="ctx-block">
        <div class="ctx-title">Context</div>
        <div style="color: var(--muted);">Selecciona un nodo para inspeccionar su identidad, hashes y relaciones.</div>
      </div>`;
    return;
  }

  const ctx = d.context;
  const inc = ctx.incoming_relations || [];
  const out = ctx.outgoing_relations || [];
  const probs = (ctx.problems_report && ctx.problems_report.problems) || [];
  const storeProbs = (ctx.problems_report && ctx.problems_report.store_problems_count) || 0;
  const meta = ctx.metadata || {};

  const renderRel = (r, isIncoming) => {
    const peer = isIncoming ? r.source : r.target;
    const arrow = isIncoming ? '←' : '→';
    return `
      <div class="relation" data-jump-node="${esc(peer)}">
        <div class="relation-type">${arrow} ${esc(r.type || 'related')}</div>
        <div class="relation-name">${esc(peer)}</div>
      </div>`;
  };

  const chips = [
    ...(meta.atoms || []).map((a) => `<span class="mention" data-jump-node="${esc(a)}">@${esc(a)}</span>`),
    ...(meta.depends_on || []).map((dep) => `<span class="mention" data-jump-node="${esc(dep)}">@${esc(dep)}</span>`),
    ...(meta.pills || []).map((p) => `<span class="code-chip" data-jump-code="${esc(p)}">${esc(p.split('/').pop())}</span>`),
  ].join(' ');

  el.innerHTML = `
    <div class="ctx-block">
      <div class="ctx-title">Selected Node</div>
      <div style="font-weight:600; margin-bottom:4px;">${esc(d.projections?.document?.payload?.title || ctx.name)}</div>
      <div style="font-family:var(--mono); font-size:11px; color:var(--accent); word-break:break-all;">${esc(ctx.id)}</div>
    </div>

    <div class="ctx-block">
      <div class="kv">
        <span>model</span><span>${esc(ctx.model_name)}</span>
        <span>status</span><span>${esc(ctx.status || 'tracked')}</span>
        <span>stage</span><span>${esc(ctx.current_node || '—')}</span>
        <span>doc_hash</span><span title="${esc(ctx.content_hash || '')}">${esc(shortHash(ctx.content_hash))}</span>
        <span>disk_sha</span><span title="${esc(ctx.file_revision || '')}">${esc(shortHash(ctx.file_revision))}</span>
        <span>source</span><span title="${esc(ctx.path || '')}">${esc(ctx.path || '—')}</span>
      </div>
    </div>

    <div class="ctx-block">
      <div class="ctx-title">Incoming Relations (${inc.length})</div>
      ${inc.length ? inc.slice(0, 15).map((r) => renderRel(r, true)).join('') : '<div style="color:var(--muted); font-size:11.5px;">Sin aristas entrantes</div>'}
    </div>

    <div class="ctx-block">
      <div class="ctx-title">Outgoing Relations (${out.length})</div>
      ${out.length ? out.slice(0, 15).map((r) => renderRel(r, false)).join('') : '<div style="color:var(--muted); font-size:11.5px;">Sin aristas salientes</div>'}
    </div>

    ${chips ? `<div class="ctx-block"><div class="ctx-title">Linked Knowledge</div><div style="display:flex; flex-wrap:wrap; gap:4px;">${chips}</div></div>` : ''}

    <div class="ctx-block">
      <div class="ctx-title">Integrity</div>
      ${
        ctx.is_degraded || probs.length > 0
          ? `<div class="warning">
              ${ctx.is_degraded ? `<div>⚠ Nodo degradado: ${esc(ctx.degraded_reason)}</div>` : ''}
              ${probs.map((p) => `<div>⚠ ${esc(p)}</div>`).join('')}
            </div>`
          : `<div class="integrity-ok">✓ 0 problemas en este nodo (${storeProbs} alertas globales en store)</div>`
      }
    </div>
  `;
}

function renderDocumentProjection(d) {
  const node = d.node || {};
  const docProj = d.projections?.document || {};
  const payload = docProj.payload || {};
  const sections = docProj.sections_prose || [];
  const irStructure = docProj.ir?.structure || [];

  const title = payload.title || payload.name || node.name || node.id;
  const metaParts = [
    payload.status ? `status: ${payload.status}` : null,
    payload.current_node ? `stage: ${payload.current_node}` : null,
    node.path ? `path: ${node.path}` : null,
    node.content_hash ? `hash: ${shortHash(node.content_hash)}` : null,
  ].filter(Boolean);

  const sectionsHtml = sections.length
    ? sections
        .map(
          (sec) => `
        <div class="doc-section">
          <div class="doc-section-header">
            <span class="doc-section-title">${esc(sec.title)}</span>
            ${sec.span ? `<span class="doc-section-span">L${sec.span[0]}–L${sec.span[1]}</span>` : ''}
          </div>
          <div class="doc-prose">${formatRichProse(sec.body)}</div>
        </div>`
        )
        .join('')
    : `<div class="doc-section"><div class="doc-prose" style="color:var(--muted);">Este nodo no contiene prosa adicional en disco.</div></div>`;

  const renderIrTree = (items) =>
    items
      .map(
        (it) => `
      <div style="margin-left:12px; padding:4px 0; font-family:var(--mono); font-size:11.5px;">
        <span style="color:var(--accent);">${esc(it.kind || 'section')}</span>
        <strong>${esc(it.title || it.name)}</strong>
        ${it.span ? `<span style="color:var(--muted);"> (L${it.span.line_start}–L${it.span.line_end})</span>` : ''}
        ${it.children && it.children.length ? renderIrTree(it.children) : ''}
      </div>`
      )
      .join('');

  return `
    <div class="doc-card">
      <div class="eyebrow">${esc(node.model_name)} · ${esc(node.id)}</div>
      <h1>${esc(title)}</h1>
      <div class="doc-meta">
        ${metaParts.map((m) => `<span class="pill">${esc(m)}</span>`).join('')}
      </div>
      ${!docProj.ok && docProj.error ? `<div class="warning" style="margin-bottom:14px;">⚠ Proyección IR degradada: ${esc(docProj.error)}</div>` : ''}
      ${sectionsHtml}
      ${
        irStructure.length
          ? `<details class="ir-details">
              <summary>Inspeccionar estructura formal SLDB IR (${irStructure.length} raíces)</summary>
              <div style="margin-top:8px;">${renderIrTree(irStructure)}</div>
            </details>`
          : ''
      }
    </div>`;
}

function renderGraphProjection(d) {
  const graph = d.projections?.graph || { nodes: [], edges: [], depth: state.graphDepth };
  const allNodes = graph.nodes || [];
  const allEdges = graph.edges || [];
  const rootId = d.node?.id;

  const models = Array.from(new Set(allNodes.map((n) => n.model_name).filter(Boolean))).sort();
  const edgeTypes = Array.from(new Set(allEdges.map((e) => e.type).filter(Boolean))).sort();

  const filteredNodes = allNodes.filter((n) => {
    if (n.id === rootId) return true;
    if (state.graphModelFilter !== 'ALL' && n.model_name !== state.graphModelFilter) return false;
    return true;
  });
  const allowedIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = allEdges.filter((e) => {
    if (!allowedIds.has(e.source) || !allowedIds.has(e.target)) return false;
    if (state.graphEdgeFilter !== 'ALL' && e.type !== state.graphEdgeFilter) return false;
    return true;
  });

  // Compute 2D positions in percentage (50%, 50% center; ring 1 at radius ~28%, ring 2 at radius ~42%)
  const coords = new Map();
  coords.set(rootId, { x: 50, y: 50 });

  const hop1 = filteredNodes.filter((n) => n.id !== rootId && (n.depth || 1) === 1).slice(0, 14);
  const hop2 = filteredNodes.filter((n) => n.id !== rootId && (n.depth || 1) >= 2).slice(0, 16);

  hop1.forEach((n, idx) => {
    const angle = (2 * Math.PI * idx) / Math.max(hop1.length, 1) - Math.PI / 2;
    coords.set(n.id, {
      x: 50 + Math.cos(angle) * 27,
      y: 50 + Math.sin(angle) * 31,
    });
  });

  hop2.forEach((n, idx) => {
    const angle = (2 * Math.PI * idx) / Math.max(hop2.length, 1) - Math.PI / 4;
    coords.set(n.id, {
      x: 50 + Math.cos(angle) * 42,
      y: 50 + Math.sin(angle) * 42,
    });
  });

  const visibleNodes = filteredNodes.filter((n) => coords.has(n.id));
  const svgLines = filteredEdges
    .filter((e) => coords.has(e.source) && coords.has(e.target))
    .map((e) => {
      const p1 = coords.get(e.source);
      const p2 = coords.get(e.target);
      const stroke = e.source === rootId ? '#6ee7b7' : e.target === rootId ? '#7aa2f7' : '#f6c177';
      return `<line x1="${p1.x}%" y1="${p1.y}%" x2="${p2.x}%" y2="${p2.y}%" stroke="${stroke}" stroke-width="1.8" stroke-opacity="0.7" />`;
    })
    .join('');

  const nodesCards = visibleNodes
    .map((n) => {
      const pos = coords.get(n.id);
      const isRoot = n.id === rootId;
      return `
        <div class="node ${isRoot ? 'selected' : ''}" style="left:${pos.x}%; top:${pos.y}%;" data-jump-node="${esc(n.id)}">
          <small>${esc(n.model_name)} · ${isRoot ? 'center' : `${n.depth || 1} hop`}</small>
          <div class="node-title">${esc(n.title || n.name)}</div>
          <div class="node-id">${esc(n.name)}</div>
        </div>`;
    })
    .join('');

  return `
    <div class="filter-bar">
      <span class="chip ${state.graphDepth === 1 ? 'on' : ''}" data-graph-depth="1">1 hop</span>
      <span class="chip ${state.graphDepth === 2 ? 'on' : ''}" data-graph-depth="2">2 hops</span>
      <span style="color:var(--border-light)">|</span>
      <span class="chip ${state.graphModelFilter === 'ALL' ? 'on' : ''}" data-graph-model="ALL">All models (${allNodes.length})</span>
      ${models
        .map(
          (m) =>
            `<span class="chip ${state.graphModelFilter === m ? 'on' : ''}" data-graph-model="${esc(m)}">${esc(m)}</span>`
        )
        .join('')}
      ${
        edgeTypes.length
          ? `<span style="color:var(--border-light)">|</span>
             <span class="chip ${state.graphEdgeFilter === 'ALL' ? 'on' : ''}" data-graph-edge="ALL">All edges (${allEdges.length})</span>
             ${edgeTypes
               .map(
                 (et) =>
                   `<span class="chip ${state.graphEdgeFilter === et ? 'on' : ''}" data-graph-edge="${esc(et)}">${esc(et)}</span>`
               )
               .join('')}`
          : ''
      }
    </div>

    <div class="graph-box">
      <svg class="graph-svg">${svgLines}</svg>
      ${nodesCards}
    </div>

    <div class="doc-card" style="max-width:900px;">
      <div class="eyebrow">Subgraph Edges (${filteredEdges.length})</div>
      <div class="change-list">
        ${
          filteredEdges.length
            ? filteredEdges
                .map(
                  (e) => `
              <div class="change-item" data-jump-node="${esc(e.source === rootId ? e.target : e.source)}">
                <div>
                  <span style="font-family:var(--mono); color:var(--blue);">${esc(e.source)}</span>
                  <span style="color:var(--muted); margin:0 8px;">—[${esc(e.type)}]→</span>
                  <span style="font-family:var(--mono); color:var(--accent);">${esc(e.target)}</span>
                </div>
                <span class="badge-info">${esc(e.origin || 'store')}</span>
              </div>`
                )
                .join('')
            : '<div style="color:var(--muted);">No hay aristas para los filtros seleccionados.</div>'
        }
      </div>
    </div>`;
}

function renderCodeProjection(d) {
  const codeProj = d.projections?.code || { ok: false, files: [] };
  const files = codeProj.files || [];

  if (!codeProj.ok) {
    return `<div class="doc-card"><div class="warning">⚠ ${esc(codeProj.error || 'Proyección de código no disponible.')}</div></div>`;
  }
  if (!files.length) {
    return `<div class="doc-card"><div style="color:var(--muted);">Este nodo no declara referencias a archivos de código en el repositorio.</div></div>`;
  }

  const idx = Math.min(state.selectedCodeIndex, files.length - 1);
  const active = files[idx];

  const pillsHtml = files
    .map(
      (f, i) => `
      <div class="code-file-pill ${i === idx ? 'active' : ''}" data-code-idx="${i}">
        <span>${esc(f.reference)}</span>
        <span class="pill" style="font-size:9.5px;">${esc(f.status)}</span>
      </div>`
    )
    .join('');

  let viewerHtml = '';
  if (active.status === 'ok' && typeof active.content === 'string') {
    const lines = active.content.split('\n');
    const fragSpan = active.fragment_span;
    const rows = lines
      .map((lineText, lineIdx) => {
        const lnum = lineIdx + 1;
        const isHl =
          active.fragment_line === lnum ||
          (Array.isArray(fragSpan) && lnum >= fragSpan[0] && lnum <= fragSpan[1]);
        return `
          <tr class="code-line-row ${isHl ? 'highlight' : ''}">
            <td class="code-line-num">L${lnum}</td>
            <td class="code-line-text">${esc(lineText)}</td>
          </tr>`;
      })
      .join('');
    viewerHtml = `
      <div class="eyebrow">${esc(active.path)} · ${esc(active.language || 'text')} · ${active.line_count} lines (${active.size} bytes)</div>
      <div class="code-scroll">
        <table class="code-table"><tbody>${rows}</tbody></table>
      </div>`;
  } else {
    viewerHtml = `
      <div class="warning">
        <strong>Estado de referencia [${esc(active.status)}]:</strong> ${esc(active.reference)}<br/>
        <span>${esc(active.message || 'No se puede mostrar contenido de archivo.')}</span>
      </div>`;
  }

  return `
    <div class="doc-card" style="max-width:920px;">
      <div class="eyebrow">Code Projection (${files.length} referencias)</div>
      <div class="code-files-bar">${pillsHtml}</div>
      ${viewerHtml}
    </div>`;
}

function renderChangesProjection(d) {
  const ch = d.projections?.changes || {};
  const impact = ch.impact_nodes || [];
  const files = ch.files || [];
  const probs = ch.problems_report?.problems || [];
  const ovChanges = state.overview?.changes || { modified_files: [], problems: [] };

  return `
    <div class="doc-card" style="max-width:880px;">
      <div class="eyebrow">Merkle &amp; Revision Integrity · ${esc(ch.node_id || d.node?.id)}</div>
      <h1>Impact &amp; Staleness Analysis</h1>
      <div class="doc-meta">
        <span class="pill">doc_version: ${esc(shortHash(ch.content_hash))}</span>
        <span class="pill">file_sha256: ${esc(shortHash(ch.file_revision))}</span>
        <span class="pill">git: ${esc(ch.git_status || 'clean')}</span>
      </div>

      ${
        probs.length || ch.is_degraded
          ? `<div class="warning" style="margin-bottom:14px;">
              ${ch.is_degraded ? `<div>⚠ Documento degradado en disco</div>` : ''}
              ${probs.map((p) => `<div>⚠ ${esc(p)}</div>`).join('')}
            </div>`
          : `<div class="integrity-ok" style="margin-bottom:14px;">✓ Hash de documento y estructura SLDB íntegros</div>`
      }

      <div class="doc-section">
        <div class="doc-section-header">
          <span class="doc-section-title">1–2 Hop Connected Impact (${impact.length} nodes)</span>
        </div>
        <div class="change-list">
          ${
            impact.length
              ? impact
                  .map(
                    (it) => `
                <div class="change-item" data-jump-node="${esc(it.id)}">
                  <div>
                    <strong>${esc(it.title)}</strong>
                    <div style="color:var(--muted); font-size:11.5px; font-family:var(--mono); margin-top:2px;">
                      ${esc(it.id)} · ${it.hop} hop (${esc(it.direction)}) · [${esc((it.relation_types || []).join(', '))}]
                    </div>
                  </div>
                  <span class="${it.status === 'complete' || it.status === 'active' ? 'badge-ok' : 'badge-info'}">● ${esc(it.status)}</span>
                </div>`
                  )
                  .join('')
              : '<div style="color:var(--muted);">No hay nodos dependientes en 1–2 hops.</div>'
          }
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-header">
          <span class="doc-section-title">Referenced Files Status (${files.length})</span>
        </div>
        <div class="change-list">
          ${files
            .map(
              (f) => `
            <div class="change-item" data-jump-code="${esc(f.reference)}">
              <span style="font-family:var(--mono);">${esc(f.reference)}</span>
              <span class="${f.git_status === 'clean' ? 'badge-ok' : 'badge-stale'}">${esc(f.status)} · git:${esc(f.git_status)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="doc-section">
        <div class="doc-section-header">
          <span class="doc-section-title">Repository Working Tree Changes (${ovChanges.modified_files?.length || 0})</span>
        </div>
        <div class="change-list">
          ${
            ovChanges.modified_files?.length
              ? ovChanges.modified_files
                  .map(
                    (mf) => `
                <div class="change-item" ${mf.node_id ? `data-jump-node="${esc(mf.node_id)}"` : ''}>
                  <span style="font-family:var(--mono);">${esc(mf.path)}</span>
                  <span class="badge-stale">git [${esc(mf.git_status)}] ${mf.node_id ? `→ ${esc(mf.node_id)}` : ''}</span>
                </div>`
                  )
                  .join('')
              : '<div style="color:var(--muted);">Working tree limpio.</div>'
          }
        </div>
      </div>
    </div>`;
}

function renderOverviewSurface() {
  const ov = state.overview || {};
  const st = ov.store || {};
  const counts = st.category_counts || {};
  const boardTasks = ov.board?.tasks || [];

  return `
    <div class="doc-card" style="max-width:880px;">
      <div class="eyebrow">Store Overview · ${esc(st.repo_name || 'graph_ui')}</div>
      <h1>Knowledge Store &amp; Active Desk</h1>
      <div class="stat-grid">
        <div class="stat-card" data-switch-nav="tasks"><div class="stat-value">${counts.tasks || 0}</div><div class="stat-label">Tasks &amp; Boards</div></div>
        <div class="stat-card" data-switch-nav="documents"><div class="stat-value">${counts.documents || 0}</div><div class="stat-label">Documents / Specs</div></div>
        <div class="stat-card" data-switch-nav="atoms"><div class="stat-value">${counts.atoms || 0}</div><div class="stat-label">Atoms &amp; Contracts</div></div>
        <div class="stat-card" data-switch-nav="code"><div class="stat-value">${counts.code || 0}</div><div class="stat-label">Code &amp; Symbols</div></div>
        <div class="stat-card" data-switch-nav="graph"><div class="stat-value">${counts.graph || 0}</div><div class="stat-label">Graph &amp; Relations</div></div>
        <div class="stat-card"><div class="stat-value">${st.total_edges || 0}</div><div class="stat-label">Tracked Edges</div></div>
      </div>

      <div class="doc-section">
        <div class="doc-section-header"><span class="doc-section-title">Active Board Tasks (${boardTasks.length})</span></div>
        <div class="change-list">
          ${
            boardTasks.length
              ? boardTasks
                  .map(
                    (t) => `
                <div class="change-item" data-jump-node="TaskDoc:${esc(t.id)}">
                  <div>
                    <strong>${esc(t.title || t.id)}</strong>
                    <div style="color:var(--muted); font-family:var(--mono); font-size:11px; margin-top:2px;">
                      TaskDoc:${esc(t.id)} · stage: ${esc(t.current_node || '—')}
                    </div>
                  </div>
                  <span class="badge-ok">● ${esc(t.status || 'active')}</span>
                </div>`
                  )
                  .join('')
              : '<div style="color:var(--muted);">No hay tareas activas en Board.md.</div>'
          }
        </div>
      </div>
    </div>`;
}

function renderAgentsSurface() {
  const workers = state.overview?.workers?.workers || [];
  const err = state.overview?.workers?.error;
  return `
    <div class="doc-card" style="max-width:880px;">
      <div class="eyebrow">Runtime · Deskops &amp; Herdr</div>
      <h1>Active Agents (${workers.length})</h1>
      ${err ? `<div class="warning" style="margin-bottom:12px;">⚠ ${esc(err)}</div>` : ''}
      <div class="change-list">
        ${
          workers.length
            ? workers
                .map(
                  (w) => `
              <div class="change-item">
                <div>
                  <strong>${esc(w.label || w.name || w.id)}</strong>
                  <div style="color:var(--muted); font-family:var(--mono); font-size:11px;">
                    id: ${esc(w.id)} · space: ${esc(w.space || '—')} · cmd: ${esc(w.command || '—')}
                  </div>
                </div>
                <span class="badge-ok">● ${esc(w.status || 'running')}</span>
              </div>`
                )
                .join('')
            : '<div style="color:var(--muted);">No hay workers activos reportados por deskops runtime workers.</div>'
        }
      </div>
    </div>`;
}

function renderRunsSurface() {
  const runs = state.overview?.runs || [];
  return `
    <div class="doc-card" style="max-width:880px;">
      <div class="eyebrow">Runtime · Subagent &amp; Closeout Ledger</div>
      <h1>Recent Runs (${runs.length})</h1>
      <div class="change-list">
        ${runs
          .map(
            (r) => `
          <div class="change-item" ${r.task_id ? `data-jump-node="${esc(r.task_id)}"` : ''}>
            <div>
              <strong>${esc(r.task_id || r.run_id || 'Run')}</strong>
              <div style="color:var(--muted); font-family:var(--mono); font-size:11px;">
                ${esc(r.run_dir || 'manual closeout')} ${r.commit ? `· commit ${esc(shortHash(r.commit))}` : ''}
              </div>
            </div>
            <span class="badge-info">${esc(r.mode)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

function renderHistorySurface() {
  const commits = state.overview?.history || [];
  return `
    <div class="doc-card" style="max-width:880px;">
      <div class="eyebrow">Knowledge &amp; Repository Ledger</div>
      <h1>Git Commit History (${commits.length})</h1>
      <div class="change-list">
        ${commits
          .map(
            (c) => `
          <div class="change-item">
            <div>
              <strong>${esc(c.subject)}</strong>
              <div style="color:var(--muted); font-family:var(--mono); font-size:11px;">
                ${esc(c.short_hash)} · ${esc(c.author)} · ${esc(c.date)}
              </div>
            </div>
            <span class="badge-ok">${esc(c.short_hash)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

function renderWorkspace() {
  const contentEl = document.getElementById('workspace-content');
  const d = state.selectedNodeData;

  if ( d ) {
    const gCount = (d.projections?.graph?.nodes || []).length;
    const cCount = (d.projections?.code?.files || []).length;
    const chCount = (d.projections?.changes?.impact_nodes || []).length;
    document.getElementById('tab-count-graph').textContent = gCount;
    document.getElementById('tab-count-code').textContent = cCount;
    document.getElementById('tab-count-changes').textContent = chCount;
    document.getElementById('workspace-active-node-pill').textContent = d.node?.id || '—';
  }

  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', state.surfaceMode === 'node' && t.dataset.tab === state.activeTab);
  });

  if (state.surfaceMode === 'overview') {
    contentEl.innerHTML = renderOverviewSurface();
    return;
  }
  if (state.surfaceMode === 'agents') {
    contentEl.innerHTML = renderAgentsSurface();
    return;
  }
  if (state.surfaceMode === 'runs') {
    contentEl.innerHTML = renderRunsSurface();
    return;
  }
  if (state.surfaceMode === 'history') {
    contentEl.innerHTML = renderHistorySurface();
    return;
  }

  if (!d) {
    contentEl.innerHTML = `<div class="doc-card">Selecciona un nodo del catálogo izquierdo.</div>`;
    return;
  }

  if (state.activeTab === 'document') {
    contentEl.innerHTML = renderDocumentProjection(d);
  } else if (state.activeTab === 'graph') {
    contentEl.innerHTML = renderGraphProjection(d);
  } else if (state.activeTab === 'code') {
    contentEl.innerHTML = renderCodeProjection(d);
  } else if (state.activeTab === 'changes') {
    contentEl.innerHTML = renderChangesProjection(d);
  }
}

async function selectNode(ident, options = {}) {
  if (!ident) return;
  let targetId = ident;
  if (!state.nodeById.has(targetId) && state.nodeByName.has(targetId)) {
    targetId = state.nodeByName.get(targetId).id;
  }
  try {
    const depth = options.depth || state.graphDepth || 1;
    const data = await fetchJson(`/api/workspace/node?id=${encodeURIComponent(targetId)}&depth=${depth}`);
    state.selectedNodeId = data.node.id;
    state.selectedNodeData = data;
    state.surfaceMode = 'node';
    if (options.tab) {
      state.activeTab = options.tab;
    }
    if (!options.keepCodeIndex) {
      state.selectedCodeIndex = 0;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('id', state.selectedNodeId);
    window.history.replaceState({}, '', url);
    renderCatalog();
    renderWorkspace();
    renderContextSidebar();
  } catch (err) {
    document.getElementById('workspace-content').innerHTML =
      `<div class="doc-card"><div class="warning">⚠ No se pudo cargar el nodo <strong>${esc(ident)}</strong>: ${esc(err.message)}</div></div>`;
  }
}

function wireEvents() {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      state.activeNav = nav;
      document.querySelectorAll('.nav-item').forEach((el) => el.classList.toggle('active', el === item));
      if (['overview', 'agents', 'runs', 'history'].includes(nav)) {
        state.surfaceMode = nav;
      } else if (nav === 'changes') {
        state.surfaceMode = 'node';
        state.activeTab = 'changes';
      } else {
        state.surfaceMode = 'node';
      }
      renderCatalog();
      renderWorkspace();
    });
  });

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.surfaceMode = 'node';
      state.activeTab = tab.dataset.tab;
      renderWorkspace();
    });
  });

  document.getElementById('catalog-filter-input').addEventListener('input', (e) => {
    state.catalogFilter = e.target.value;
    renderCatalog();
  });

  document.getElementById('catalog-list').addEventListener('click', (e) => {
    const card = e.target.closest('[data-node-id]');
    if (card) {
      selectNode(card.dataset.nodeId);
    }
  });

  document.body.addEventListener('click', (e) => {
    const jumpNode = e.target.closest('[data-jump-node]');
    if (jumpNode) {
      selectNode(jumpNode.dataset.jumpNode);
      return;
    }
    const jumpCode = e.target.closest('[data-jump-code]');
    if (jumpCode && state.selectedNodeData) {
      const ref = jumpCode.dataset.jumpCode;
      const files = state.selectedNodeData.projections?.code?.files || [];
      const foundIdx = files.findIndex((f) => f.reference === ref || f.path === ref || (f.path && ref.endsWith(f.path)));
      state.surfaceMode = 'node';
      state.activeTab = 'code';
      if (foundIdx >= 0) state.selectedCodeIndex = foundIdx;
      renderWorkspace();
      return;
    }
    const codePill = e.target.closest('[data-code-idx]');
    if (codePill) {
      state.selectedCodeIndex = Number(codePill.dataset.codeIdx);
      renderWorkspace();
      return;
    }
    const depthChip = e.target.closest('[data-graph-depth]');
    if (depthChip) {
      const d = Number(depthChip.dataset.graphDepth);
      state.graphDepth = d;
      if (state.selectedNodeId) {
        selectNode(state.selectedNodeId, { depth: d, tab: 'graph', keepCodeIndex: true });
      }
      return;
    }
    const modelChip = e.target.closest('[data-graph-model]');
    if (modelChip) {
      state.graphModelFilter = modelChip.dataset.graphModel;
      renderWorkspace();
      return;
    }
    const edgeChip = e.target.closest('[data-graph-edge]');
    if (edgeChip) {
      state.graphEdgeFilter = edgeChip.dataset.graphEdge;
      renderWorkspace();
      return;
    }
    const switchNav = e.target.closest('[data-switch-nav]');
    if (switchNav) {
      const targetNav = document.querySelector(`.nav-item[data-nav="${switchNav.dataset.switchNav}"]`);
      if (targetNav) targetNav.click();
    }
  });

  // Global search
  const searchInput = document.getElementById('global-search');
  const resultsBox = document.getElementById('global-search-results');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      resultsBox.classList.remove('open');
      return;
    }
    const matches = state.nodes
      .filter(
        (n) =>
          n.id.toLowerCase().includes(q) ||
          (n.title || '').toLowerCase().includes(q) ||
          (n.path || '').toLowerCase().includes(q)
      )
      .slice(0, 25);
    resultsBox.innerHTML = matches.length
      ? matches
          .map(
            (m) => `
          <div class="search-result-item" data-search-pick="${esc(m.id)}">
            <div class="search-result-top">
              <span class="search-result-title">${esc(m.title || m.name)}</span>
              <span class="search-result-model">${esc(m.model_name)}</span>
            </div>
            <div class="search-result-id">${esc(m.id)} · ${esc(m.path || '')}</div>
          </div>`
          )
          .join('')
      : '<div class="search-result-item"><span class="search-result-id">Sin resultados</span></div>';
    resultsBox.classList.add('open');
  });

  resultsBox.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-search-pick]');
    if (pick) {
      resultsBox.classList.remove('open');
      searchInput.value = '';
      selectNode(pick.dataset.searchPick);
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrap')) {
      resultsBox.classList.remove('open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape' && resultsBox.classList.contains('open')) {
      resultsBox.classList.remove('open');
      searchInput.blur();
    }
  });
}

async function boot() {
  wireEvents();
  const [ov, cat] = await Promise.all([
    fetchJson('/api/workspace/overview'),
    fetchJson('/api/workspace/nodes'),
  ]);
  state.overview = ov;
  state.nodes = cat.nodes || [];
  state.nodeById.clear();
  state.nodeByName.clear();
  for (const n of state.nodes) {
    state.nodeById.set(n.id, n);
    if (!state.nodeByName.has(n.name)) {
      state.nodeByName.set(n.name, n);
    }
  }
  updateChromeFromOverview();
  renderCatalog();

  const urlId = new URL(window.location.href).searchParams.get('id');
  const firstTask =
    state.nodes.find((n) => n.id.includes('task-vista-changes')) ||
    state.nodes.find((n) => n.model_name === 'TaskDoc') ||
    state.nodes[0];
  const initialId = urlId || (firstTask && firstTask.id);
  if (initialId) {
    await selectNode(initialId);
  }
}

boot();
