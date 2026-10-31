import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  TABS,
  filterCatalog,
  formatHash,
  parseCodeSnippet,
  formatProblems,
  filterGraphEdges,
  distinctEdgeTypes
} from '../frontends/mindmap/views/workspace/node/workspace.mjs';
import {
  irSectionsWithCleanMeta,
  irFields
} from '../frontends/mindmap/shared/document-ir.mjs';

test('TABS contains document, graph, and code projections', () => {
  const ids = TABS.map(t => t.id);
  assert.deepEqual(ids, ['document', 'graph', 'code']);
});

test('filterCatalog filters by query and model without modifying input', () => {
  const nodes = [
    { id: 'TaskDoc:task-alpha', model_name: 'TaskDoc', title: 'Setup auth' },
    { id: 'TaskDoc:task-beta', model_name: 'TaskDoc', title: 'Implement routing' },
    { id: 'AtomDoc:atom-auth', model_name: 'AtomDoc', title: 'Authentication atom' }
  ];

  // Empty query returns all
  assert.equal(filterCatalog(nodes, '', '').length, 3);

  // Search by id substring
  const byId = filterCatalog(nodes, 'beta', '');
  assert.equal(byId.length, 1);
  assert.equal(byId[0].id, 'TaskDoc:task-beta');

  // Search by title substring (case-insensitive)
  const byTitle = filterCatalog(nodes, 'ROUTING', '');
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 'TaskDoc:task-beta');

  // Filter by model_name
  const byModel = filterCatalog(nodes, '', 'TaskDoc');
  assert.equal(byModel.length, 2);

  // Combined query and model
  const combined = filterCatalog(nodes, 'auth', 'TaskDoc');
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, 'TaskDoc:task-alpha');

  // Input array was not mutated
  assert.equal(nodes.length, 3);
});

test('formatHash formats hashes safely', () => {
  assert.equal(formatHash(null), '');
  assert.equal(formatHash(undefined), '');
  assert.equal(formatHash(''), '');
  assert.equal(formatHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), 'e3b0c442');
  assert.equal(formatHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 12), 'e3b0c44298fc');
});

test('parseCodeSnippet slices content with target line highlighted', () => {
  const content = 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10';

  // No target line returns all lines
  const full = parseCodeSnippet(content, null);
  assert.equal(full.lines.length, 10);
  assert.equal(full.lines[0].number, 1);
  assert.equal(full.lines[0].text, 'line 1');
  assert.equal(full.lines.some(l => l.isTarget), false);

  // Target line 5 with context 2 (lines 3 to 7)
  const snippet = parseCodeSnippet(content, 5, 2);
  assert.equal(snippet.startLine, 3);
  assert.equal(snippet.endLine, 7);
  assert.equal(snippet.lines.length, 5);

  const targetLine = snippet.lines.find(l => l.isTarget);
  assert.ok(targetLine);
  assert.equal(targetLine.number, 5);
  assert.equal(targetLine.text, 'line 5');

  // Non-target lines inside the snippet
  const beforeTarget = snippet.lines.find(l => l.number === 4);
  assert.equal(beforeTarget.isTarget, false);
});

test('formatProblems distinguishes clean, node problems, store problems, and errors', () => {
  // Empty data
  const empty = formatProblems(null);
  assert.equal(empty.state, 'clean');
  assert.equal(empty.hasProblems, false);

  // Clean data
  const healthy = formatProblems({ ok: true, problems: [], store_problems_count: 0 });
  assert.equal(healthy.state, 'clean');
  assert.equal(healthy.hasProblems, false);
  assert.equal(healthy.count, 0);

  // Node specific problems
  const nodeFault = formatProblems({
    ok: true,
    problems: ["relation 'requires': target 'TaskDoc:missing' is not a tracked document"],
    store_problems_count: 1
  });
  assert.equal(nodeFault.state, 'node_problems');
  assert.equal(nodeFault.hasProblems, true);
  assert.equal(nodeFault.count, 1);

  // Store-wide problems where this node is not named
  const storeWide = formatProblems({
    ok: true,
    problems: [],
    store_problems_count: 3
  });
  assert.equal(storeWide.state, 'store_problems');
  assert.equal(storeWide.hasProblems, true);
  assert.equal(storeWide.storeTotal, 3);

  // Error loading store
  const withError = formatProblems({
    ok: false,
    problems: [],
    error: 'Store corrupted'
  });
  assert.equal(withError.state, 'error');
  assert.equal(withError.hasProblems, true);
  assert.equal(withError.error, 'Store corrupted');
});

test('filterGraphEdges and distinctEdgeTypes filter and extract relation types', () => {
  const edges = [
    { source: 'A', target: 'B', type: 'depends_on' },
    { source: 'A', target: 'C', rel: 'specifies' },
    { source: 'B', target: 'C', type: 'depends_on' }
  ];

  const types = distinctEdgeTypes(edges);
  assert.deepEqual(types, ['depends_on', 'specifies']);

  const filtered = filterGraphEdges(edges, 'depends_on');
  assert.equal(filtered.length, 2);

  const filteredRel = filterGraphEdges(edges, 'specifies');
  assert.equal(filteredRel.length, 1);
  assert.equal(filteredRel[0].target, 'C');

  const all = filterGraphEdges(edges, '');
  assert.equal(all.length, 3);
});

test('irSectionsWithCleanMeta extracts hierarchical IR structure with line spans', () => {
  const fakeIr = {
    structure: [
      {
        kind: 'section',
        name: 'heading-1',
        title: 'Objetivo Principal',
        span: { line_start: 10, line_end: 25 },
        children: [
          {
            kind: 'section',
            name: 'sub-heading',
            title: 'Sub-sección de Alcance',
            span: { line_start: 15, line_end: 20 },
            children: []
          }
        ]
      }
    ],
    nodes: [
      {
        kind: 'field',
        name: 'goal',
        field_path: 'goal',
        value: 'Probar IR en Workspace',
        span: { line_start: 12, line_end: 14 }
      }
    ]
  };

  const sections = irSectionsWithCleanMeta(fakeIr);
  assert.equal(sections.length, 1);
  assert.equal(sections[0].title, 'Objetivo Principal');
  assert.deepEqual(sections[0].span, { line_start: 10, line_end: 25 });
  assert.equal(sections[0].children.length, 1);
  assert.equal(sections[0].children[0].title, 'Sub-sección de Alcance');

  const fields = irFields(fakeIr, { goal: 'Probar IR en Workspace' });
  assert.equal(fields.length, 1);
  assert.equal(fields[0].field_path, 'goal');
  assert.equal(fields[0].value, 'Probar IR en Workspace');
});
