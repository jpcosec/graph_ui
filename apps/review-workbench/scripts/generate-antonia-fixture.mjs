#!/usr/bin/env node
// generate-antonia-fixture.mjs
// Reads the REAL Antonia ConversationStep atoms (sldb documents) and projects
// them into a RawData fixture the graph-editor can load through the
// `conversation-step` node type. No hand-authored data: every node/edge is
// parsed from the actual markdown atoms.
//
// Source of truth: gemini_test/knowledge/atoms/step-antonia-*.md
// Output:          src/features/antonia-flow/antonia-fixture.generated.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

// Locate the real Antonia atoms. Configurable via env for portability.
const ATOMS_DIR =
  process.env.ANTONIA_ATOMS_DIR ||
  '/home/jp/proyectos/gemini_test/knowledge/atoms';

const OUT_DIR = path.join(APP_ROOT, 'src/features/antonia-flow');
const OUT_FILE = path.join(OUT_DIR, 'antonia-fixture.generated.json');

/** Parse a very small subset of YAML frontmatter (scalars + simple string lists). */
function parseFrontmatter(block) {
  const out = {};
  const lines = block.split('\n');
  let currentListKey = null;
  for (const line of lines) {
    if (/^\s*-\s+/.test(line) && currentListKey) {
      out[currentListKey].push(line.replace(/^\s*-\s+/, '').trim());
      continue;
    }
    const m = line.match(/^([a-zA-Z_][\w]*):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const val = rawVal.trim();
    if (val === '') {
      // could be the start of a list; assume list until a scalar/other key
      out[key] = [];
      currentListKey = key;
    } else {
      out[key] = val;
      currentListKey = null;
    }
  }
  return out;
}

/** Extract a "## Heading" section body: everything between this ## line and the
 * next ## line. Line-anchored so EMPTY sections stay empty (do not bleed the
 * following heading into the field). */
function section(md, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const headingRe = new RegExp(`^##\\s+${escaped}\\s*$`, 'i');
  const lines = md.split('\n');
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start === -1) return '';
  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

/** conversation:steps.<name>  ->  the atom id that carries that tag/name. */
function transitionKeys(raw) {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s.startsWith('conversation:steps.'))
    .map((s) => s.replace('conversation:steps.', ''));
}

function main() {
  if (!fs.existsSync(ATOMS_DIR)) {
    console.error(`[antonia-fixture] atoms dir not found: ${ATOMS_DIR}`);
    console.error('Set ANTONIA_ATOMS_DIR to the real knowledge/atoms path.');
    process.exit(1);
  }
  const files = fs
    .readdirSync(ATOMS_DIR)
    .filter((f) => f.startsWith('step-antonia-') && f.endsWith('.md'));
  if (files.length === 0) {
    console.error(`[antonia-fixture] no step-antonia-*.md found in ${ATOMS_DIR}`);
    process.exit(1);
  }

  const records = [];
  for (const file of files) {
    const md = fs.readFileSync(path.join(ATOMS_DIR, file), 'utf8');
    const fmMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) continue;
    const fm = parseFrontmatter(fmMatch[1]);
    const body = fmMatch[2];

    // Build the tag "steps.<name>" -> id map key: derive short name from id.
    const shortName = String(fm.id || '').replace(/^step-antonia-/, '').replace(/-/g, '_');

    records.push({
      id: fm.id,
      shortName,
      title: fm.title || fm.id,
      kind: fm.kind || 'interaccion_simple',
      instructions: section(body, 'Instructions'),
      required_slots: section(body, 'Required Slots'),
      handout_target: section(body, 'Handout Target'),
      tool_ref: section(body, 'Tool'),
      allowed_transitions: section(body, 'Allowed Transitions'),
      grounding_atoms: section(body, 'Grounding Atoms'),
      completion_condition: section(body, 'Completion Condition'),
      domain_ref: fm.domain_ref || '',
      tags: Array.isArray(fm.tags) ? fm.tags : [],
    });
  }

  // Map "steps.<shortName>" -> real atom id, to resolve transitions to edges.
  const byShort = new Map(records.map((r) => [r.shortName, r.id]));

  const nodes = records.map((r) => ({
    id: r.id,
    type: 'conversation-step',
    name: r.title,
    properties: {
      id: r.id,
      title: r.title,
      kind: r.kind,
      instructions: r.instructions,
      required_slots: r.required_slots,
      handout_target: r.handout_target,
      tool_ref: r.tool_ref,
      allowed_transitions: r.allowed_transitions,
      grounding_atoms: r.grounding_atoms,
      completion_condition: r.completion_condition,
      domain_ref: r.domain_ref,
      // stringlist field: join with newlines (renderer splits it back)
      tags: r.tags.join('\n'),
    },
  }));

  const edges = [];
  for (const r of records) {
    for (const key of transitionKeys(r.allowed_transitions)) {
      const target = byShort.get(key);
      if (target) {
        edges.push({ id: `${r.id}__to__${target}`, source: r.id, target, kind: 'flows_to' });
      }
    }
  }

  const fixture = {
    generatedFrom: ATOMS_DIR,
    model: 'ConversationStep (conversation family)',
    stepCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(fixture, null, 2), 'utf8');
  console.log(
    `[antonia-fixture] wrote ${nodes.length} real steps + ${edges.length} transitions to ${path.relative(APP_ROOT, OUT_FILE)}`,
  );
}

main();
