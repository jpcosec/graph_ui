// Vite dev plugin: serves the gemini_test flow_editor UI verbatim and wires its
// /api/* endpoints to THIS workbench's sldb serve (via the existing /sldb proxy).
// The flow_editor index.html is copied unmodified from gemini_test; the only
// bridge is this adapter that reshapes sldb `/graph` -> flow_editor `/api/flow`.
//
// flow_editor is read-only (its Save button is decorative); no writes happen here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.resolve(__dirname, 'app.html.tpl');

// Same split() semantics as gemini_test/frontends/flow_editor/export_flow.py
function splitField(v) {
  if (!v) return [];
  return String(v)
    .replace(/\n/g, ',')
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p && !['ninguno', 'ninguna', 'ninguna (paso terminal)'].includes(p.toLowerCase()));
}

// Reshape sldb `/graph` documents into the flow.json shape export_flow.py emits.
function buildFlow(graph) {
  const docs = (graph && graph.documents) || [];
  const steps = docs.filter((d) => d.model_name === 'ConversationStep');

  // tag conversation:steps.<name> -> step id
  const tagToId = {};
  for (const s of steps) {
    const tags = (s.payload && s.payload.tags) || s.semantic_tags || [];
    for (const t of tags) {
      if (typeof t === 'string' && t.startsWith('conversation:steps.')) tagToId[t] = s.id;
    }
  }

  const nodes = [];
  const edges = [];
  for (const s of steps) {
    const p = s.payload || {};
    const tags = p.tags || s.semantic_tags || [];
    const stepTag = tags.find((t) => typeof t === 'string' && t.startsWith('conversation:steps.')) || null;
    nodes.push({
      id: s.id,
      step_tag: stepTag,
      title: p.title || s.id,
      kind: p.kind || 'interaccion_simple',
      instructions: p.instructions || '',
      required_slots: splitField(p.required_slots),
      handout_target: p.handout_target || '',
      tool_ref: p.tool_ref || '',
      allowed_transitions: splitField(p.allowed_transitions),
      grounding_atoms: splitField(p.grounding_atoms),
      completion_condition: p.completion_condition || '',
      domain_ref: p.domain_ref ?? null,
    });
    for (const tag of splitField(p.allowed_transitions)) {
      const target = tagToId[tag];
      if (target) edges.push({ source: s.id, target, relation: 'flows_to' });
    }
  }
  return { nodes, edges };
}

// Project only the mepu atoms (scope:teva-mepu) into the flow shape,
// grouped by knowledge_type. Group container nodes hold their atom members
// as edges (relation grouped_in) so the editor shows one mepu cluster.
function buildMepuFlow(graph) {
  const docs = (graph && graph.documents) || [];
  const tagVal = (tags, prefix) => {
    const t = (tags || []).find((x) => typeof x === 'string' && x.startsWith(prefix));
    return t ? t.slice(prefix.length) : '';
  };
  // The mepu store is entirely mepu atoms; group by 5WH1+ facet.
  const atoms = docs.filter((d) => d.model_name === 'AtomDoc');

  const nodes = [];
  const edges = [];
  const groups = new Set();

  for (const a of atoms) {
    const p = a.payload || {};
    const tags = p.tags || [];
    const kt = p.five_wh_one_plus || 'other';
    const layer = tagVal(tags, 'layer:') || tagVal(tags, 'service:') || '';
    const groupId = `group:${kt}`;
    groups.add(kt);
    nodes.push({
      id: a.id,
      step_tag: null,
      title: (p.title || a.id).replace(/^MEPU:\s*/, ''),
      kind: kt,
      instructions: p.answer || '',
      required_slots: layer ? [layer] : [],
      handout_target: '',
      tool_ref: '',
      allowed_transitions: [],
      grounding_atoms: [],
      completion_condition: '',
      domain_ref: p.provenance || null,
    });
    edges.push({ source: groupId, target: a.id, relation: 'grouped_in' });
  }

  for (const kt of groups) {
    const count = atoms.filter((a) => (a.payload.five_wh_one_plus || 'other') === kt).length;
    nodes.push({
      id: `group:${kt}`,
      step_tag: null,
      title: `${kt} (${count})`,
      kind: 'group',
      instructions: '',
      required_slots: [],
      handout_target: '',
      tool_ref: '',
      allowed_transitions: [],
      grounding_atoms: [],
      completion_condition: '',
      domain_ref: null,
    });
  }

  return { nodes, edges };
}

async function fetchGraph(sldbBase) {
  const res = await fetch(`${sldbBase}/graph`);
  if (!res.ok) throw new Error(`sldb /graph ${res.status}`);
  return res.json();
}

export function flowEditorPlugin(options = {}) {
  const sldbBase = options.sldbUrl || process.env.VITE_SLDB_URL || 'http://127.0.0.1:8787';

  return {
    name: 'flow-editor-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];

        // --- flow_editor API surface (mirrors gemini_test runtime) ---
        if (url === '/api/flow') {
          try {
            const graph = await fetchGraph(sldbBase);
            const scope = new URLSearchParams((req.url || '').split('?')[1] || '').get('scope');
            let flow = scope === 'mepu' ? buildMepuFlow(graph) : buildFlow(graph);
            // Default to the mepu projection when there are no ConversationStep docs.
            if (!flow.nodes.length && scope !== 'mepu') flow = buildMepuFlow(graph);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(flow));
          } catch (e) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }
        if (url === '/api/config') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              name: 'Antonia',
              runtime_title: 'Antonia — flow_editor (live sldb)',
              kb_label: 'knowledge/.sldb',
              nav_labels: { flow: 'Flow' },
            }),
          );
          return;
        }
        if (url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        }
        if (url === '/api/tools') {
          // No ToolAtom surface exposed by sldb serve yet; empty list (UI handles it).
          res.setHeader('Content-Type', 'application/json');
          res.end('[]');
          return;
        }

        // --- serve the flow_editor HTML verbatim at /flow-editor and /flow ---
        if (url === '/flow-editor' || url === '/flow-editor/' || url === '/flow') {
          try {
            const html = fs.readFileSync(HTML_PATH, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.end(html);
          } catch (e) {
            res.statusCode = 500;
            res.end(String(e));
          }
          return;
        }

        next();
      });
    },
  };
}
