// Funciones puras de foco con dueño (WS13.1 correccion). Las entradas tienen la forma exacta que
// entrega /api/workspace/node (aristas con `provenance` y `owner`); la prueba sobre respuestas
// reales del servidor esta en tests/test_mindmap_workspace_reader.py (test_focus_uses_only_...).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import {
  createMarkdown,
  renderBlocks,
  splitInline,
  linksByRaw,
  inlineText,
  edgeFields,
  edgeDeclarations,
  edgeHighlighted,
  fieldHighlighted,
  referenceHighlighted,
  correspondence,
  edgeFocus,
  fieldFocus,
  referenceFocus,
  ownedProvenance,
} from '../frontends/mindmap/views/workspace/node/reader.mjs';

const A = 'TaskDoc:a';
const B = 'TaskDoc:b';
const C = 'TaskDoc:c';
const D = 'TaskDoc:d';
const prov = (owner, field, declared, extra = {}) => ({origin: 'schema', owner, field, declared, ...extra});
const edge = (source, target, provenance, type = 'references') => ({source, target, type, origin: 'schema', relationDoc: null, provenance});

// A.depends_on = [c]; B.depends_on = [a] (entrante, mismo nombre de campo); D.depends_on = [b] (2 saltos)
const aToC = edge(A, C, [prov(A, 'depends_on', 'c')]);
const bToA = edge(B, A, [prov(B, 'depends_on', 'a')]);
const dToB = edge(D, B, [prov(D, 'depends_on', 'b')]);
const edges = [aToC, bToA, dToB];
const fields = [{field_path: 'depends_on'}, {field_path: 'title'}];

test('la arista saliente resalta el campo del documento abierto', () => {
  assert.deepEqual(edgeFields(aToC, A), ['depends_on']);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(aToC), edges, A), true);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), A), true);
});

test('la entrante de otro documento con el mismo nombre de campo no resalta el campo propio', () => {
  assert.deepEqual(edgeFields(bToA, A), []);
  assert.equal(fieldHighlighted('depends_on', edgeFocus(bToA), edges, A), false);
  assert.equal(edgeHighlighted(bToA, fieldFocus('depends_on'), A), false);
  // su declaracion se conserva y se atribuye a su dueño
  assert.deepEqual(edgeDeclarations(bToA), [{owner: B, field: 'depends_on', declared: 'a'}]);
});

test('el vecino a dos saltos tampoco resalta campos del documento abierto', () => {
  assert.equal(fieldHighlighted('depends_on', edgeFocus(dToB), edges, A), false);
  assert.equal(edgeHighlighted(dToB, fieldFocus('depends_on'), A), false);
});

test('el foco de campo solo resalta las aristas que declara el documento abierto', () => {
  const hl = edges.filter(e => edgeHighlighted(e, fieldFocus('depends_on'), A));
  assert.deepEqual(hl, [aToC]);
});

test('correspondence cuenta solo elementos del documento abierto', () => {
  assert.deepEqual(correspondence(edgeFocus(aToC), {fields, edges, files: [], docId: A}), {document: 1, graph: 1, code: 0});
  // la entrante antes contaba document:1 por igualdad de nombre de campo
  assert.deepEqual(correspondence(edgeFocus(bToA), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
  assert.deepEqual(correspondence(edgeFocus(dToB), {fields, edges, files: [], docId: A}), {document: 0, graph: 1, code: 0});
});

test('un campo propio cuya procedencia apunta a otro destino no cuenta para la referencia seleccionada', () => {
  const aToX = edge(A, 'TaskDoc:x', [prov(A, 'references', 'x')]);
  const aToY = edge(A, 'TaskDoc:y', [prov(A, 'references', 'y')]);
  const list = [aToX, aToY];
  const files = [{doc: A, field: 'references', position: 0, value: 'x'}, {doc: A, field: 'references', position: 1, value: 'y'}];
  const focus = referenceFocus(files[0]);
  assert.equal(edgeHighlighted(aToX, focus, A), true);
  assert.equal(edgeHighlighted(aToY, focus, A), false); // mismo campo, otro valor/destino
  assert.deepEqual(correspondence(focus, {fields: [{field_path: 'references'}], edges: list, files, docId: A}), {document: 1, graph: 1, code: 1});
  // la referencia de otro documento no resalta nada aqui
  const foreign = referenceFocus({doc: B, field: 'references', position: 0, value: 'x'});
  assert.equal(edgeHighlighted(aToX, foreign, A), false);
  assert.equal(fieldHighlighted('references', foreign, list, A), false);
  assert.equal(referenceHighlighted(files[0], referenceFocus({doc: B, field: 'references', position: 0, value: 'x'}), A), false);
});

test('relation_doc y structural no tienen campo: no resaltan ninguno', () => {
  const rel = {source: A, target: C, type: 'task_activates', origin: 'relation_doc', relationDoc: 'r1',
    provenance: [{origin: 'relation_doc', owner: null, condition: ''}]};
  assert.deepEqual(edgeFields(rel, A), []);
  assert.deepEqual(ownedProvenance(rel, A), []);
  assert.equal(edgeHighlighted(rel, fieldFocus('depends_on'), A), false);
});

test('se conservan todas las procedencias reales: varias del dueño correcto', () => {
  const multi = edge(A, C, [prov(A, 'depends_on', 'c'), prov(A, 'inherits_from', 'c'), prov(B, 'depends_on', 'zzz')]);
  assert.deepEqual(edgeFields(multi, A).sort(), ['depends_on', 'inherits_from']);
  assert.equal(multi.provenance.length, 3);
  assert.equal(edgeDeclarations(multi).length, 3);
});

test('sin identidad abierta no se resalta nada por propiedad', () => {
  assert.deepEqual(edgeFields(aToC, ''), []);
  assert.equal(edgeHighlighted(aToC, fieldFocus('depends_on'), ''), false);
});

// ---------------------------------------------------------------- render Markdown con el motor real
// El motor es el mismo modulo que carga el navegador: la URL sale del import map de index.html
// (markdown-it de esm.sh). Node no importa https por si mismo; este hook solo trae ese modulo
// (y sus dependencias relativas del mismo origen) por red, sin copia local.
const indexHtml = readFileSync(new URL('../frontends/mindmap/index.html', import.meta.url), 'utf-8');
const importMap = JSON.parse(indexHtml.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
const MD_URL = importMap.imports['markdown-it'];
// Integridad y plazo: cada modulo https que pide el hook (la URL que recibe load(), antes de
// redirecciones) debe estar en EXPECTED_SHA256 con el sha256 de su texto UTF-8; una URL ausente, un
// contenido distinto o un fetch que no termina en 20 s hacen fallar la prueba nombrando la URL.
// Para regenerar la tabla al cambiar la version del import map (las URLs de dependencias tambien
// cambian): correr `node --test tests/mindmap-workspace-reader.test.mjs` con red. Una URL nueva
// falla con 'GET <url> -> sin sha256 esperado en EXPECTED_SHA256': agregarla a la tabla con un hash
// cualquiera (p. ej. 64 ceros) y volver a correr; ahora falla con
// 'GET <url> -> sha256 <obtenido> != <esperado>', y <obtenido> es el hash real a copiar en su
// entrada. Repetir (cada modulo nuevo aparece al cargar el anterior) hasta que la prueba pase, y
// borrar las entradas de URLs que ya no se piden.
const EXPECTED_SHA256 = {
  'https://esm.sh/markdown-it@14.1.0':
    'ced1c1bb5a8502ed7924950ef10f8bcf524d541c9c2c111f8861a1a0820937df',
  'https://esm.sh/entities@^4.4.0?target=es2022':
    '6be2794a0aa9a0c29d15a0a4006a4e3e4a68a789396ab7f1c35134bd53fb5faa',
  'https://esm.sh/entities@4.5.0/es2022/lib/decode.mjs':
    'ef22e25f6bca668e40c4f7d4ecaebe2172a833a18372d55b54f997d0d8702dcd',
  'https://esm.sh/punycode.js@^2.3.1?target=es2022':
    'd1b84265b5e42da1f9c6e3d457985ead3d63633caa06b1df1b7578d09cfcec05',
  'https://esm.sh/linkify-it@^5.0.0?target=es2022':
    'f745edba9b39a27b310f0855021f58c5183c36c989ea3bd8d4869b494a058a9c',
  'https://esm.sh/mdurl@^2.0.0?target=es2022':
    '0432b26197f320df4fff103362a7f841fe2f23a5348f2353863a298e482bdda3',
  'https://esm.sh/markdown-it@14.1.0/es2022/markdown-it.mjs':
    '82ffca240d509b4840880b2e20e3625bb67c7e6c6777ba0da3f28815acbce558',
  'https://esm.sh/uc.micro@^2.1.0?target=es2022':
    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
  'https://esm.sh/uc.micro@^2.0.0?target=es2022':
    '2e800c745d87114386af3c466e66e6dcc2d428e9afd85bdac62e33be6f2ceb60',
  'https://esm.sh/punycode.js@2.3.1/es2022/punycode.mjs':
    '91fcd4eab87734cc0b84f71999b151c798f4bda8b922a337bfd3af3109a7e0b5',
  'https://esm.sh/entities@4.5.0/es2022/lib/escape.mjs':
    '116aef78e5ff05efa6f79851b8b59da025ab88f5c25d2262f73df98f4d57c3fa',
  'https://esm.sh/linkify-it@5.0.2/es2022/linkify-it.mjs':
    'a7f8bf81f86ab33b188173277252922bb577cb6c72e7f5f5b75d99d68a66a092',
  'https://esm.sh/mdurl@2.1.0/es2022/mdurl.mjs':
    '487149fd6591ee740f4e9df7cf13c4694bfd613650b49b5f6895ab3b1e81627d',
  'https://esm.sh/uc.micro@2.1.0/es2022/uc.micro.mjs':
    '549d36fd64ab29703da6e300957bed9de0dae7d7218eca8bbe6681994133e8b0',
  'https://esm.sh/entities@4.5.0/es2022/entities.mjs':
    '4a9306e4021ae1079e83b5db26e1678c536fa69c8f2839802bc3cc43282cef08',
};
const HTTPS_HOOKS = `
import {createHash} from 'node:crypto';
const EXPECTED_SHA256 = ${JSON.stringify(EXPECTED_SHA256)};
export async function resolve(specifier, context, next) {
  const parent = context.parentURL || '';
  if (specifier.startsWith('https://')) return {url: specifier, shortCircuit: true};
  if (parent.startsWith('https://') && /^[./]/.test(specifier)) return {url: new URL(specifier, parent).href, shortCircuit: true};
  return next(specifier, context);
}
export async function load(url, context, next) {
  if (!url.startsWith('https://')) return next(url, context);
  const expected = EXPECTED_SHA256[url];
  if (!expected) throw new Error('GET ' + url + ' -> sin sha256 esperado en EXPECTED_SHA256');
  let res, text;
  try {
    res = await fetch(url, {signal: AbortSignal.timeout(20000)});
    if (!res.ok) throw new Error('GET ' + url + ' -> ' + res.status);
    text = await res.text();
  } catch (err) {
    if (err && (err.name === 'TimeoutError' || err.name === 'AbortError')) throw new Error('GET ' + url + ' -> timeout 20 s');
    // undici corta la conexion (TCP + TLS) a los 10 s con su propio connect timeout
    if (err && (err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || err.code === 'UND_ERR_CONNECT_TIMEOUT')) throw new Error('GET ' + url + ' -> connect timeout');
    throw err;
  }
  const got = createHash('sha256').update(text, 'utf8').digest('hex');
  if (got !== expected) throw new Error('GET ' + url + ' -> sha256 ' + got + ' != ' + expected);
  return {format: 'module', source: text, shortCircuit: true};
}`;
register('data:text/javascript,' + encodeURIComponent(HTTPS_HOOKS));
const {default: MarkdownIt} = await import(MD_URL);
const md = createMarkdown(MarkdownIt);

const DOC = [
  '---',                                             // 1
  'id: guia',                                        // 2
  '---',                                             // 3
  '# Guia',                                          // 4
  '',                                                // 5
  '> Una cita con *énfasis* y [[otro.md]]',          // 6
  '> en dos lineas.',                                // 7
  '',                                                // 8
  'Texto **fuerte** con `codigo [[no.md]]` y [la web](https://example.com/x).', // 9
  'Segunda linea con _[[otro.md#Segunda parte]]_ y <script>alert(1)</script>.', // 10
  '',                                                // 11
  '- uno [pred:: [[otro.md]]]',                      // 12
  '- dos',                                           // 13
  '',                                                // 14
  '```',                                             // 15
  'x = 1',                                           // 16
  '```',                                             // 17
].join('\n') + '\n';

const find = (nodes, type) => {
  for (const n of nodes || []) {
    if (n.type === type) return n;
    const inner = find(n.children, type);
    if (inner) return inner;
  }
  return null;
};

test('el motor del import map es markdown-it 14.1.0 por esm.sh', () => {
  assert.equal(MD_URL, 'https://esm.sh/markdown-it@14.1.0');
  assert.equal(md.options.html, false);
  assert.equal(md.options.linkify, false);
});

test('renderBlocks: line_start/line_end en base 1 desde token.map, con el frontmatter separado', () => {
  const blocks = renderBlocks(DOC, md);
  assert.deepEqual(blocks.map(b => [b.kind, b.line_start, b.line_end]), [
    ['frontmatter', 1, 3],
    ['heading', 4, 4],
    ['quote', 6, 7],
    ['paragraph', 9, 10],
    ['list', 12, 14], // markdown-it incluye en el map de la lista la linea en blanco que la cierra
    ['code', 15, 17],
  ]);
  assert.deepEqual(blocks[0].lines, ['id: guia']);
  assert.deepEqual(blocks[5].lines, ['x = 1']);
  assert.deepEqual(blocks[4].items.map(it => [it.line_start, it.line_end]), [[12, 12], [13, 14]]);
});

test('renderBlocks: cita con énfasis y enlace SLDB dentro', () => {
  const quote = renderBlocks(DOC, md)[2];
  assert.equal(quote.kind, 'quote');
  const para = quote.blocks[0];
  assert.equal(para.kind, 'paragraph');
  assert.deepEqual(find(para.inline, 'em').children, [{type: 'text', text: 'énfasis'}]);
  const text = para.inline.find(n => n.type === 'text' && n.text.includes('[[otro.md]]'));
  assert.ok(text, JSON.stringify(para.inline));
  const links = linksByRaw([{raw: '[[otro.md]]', status: 'ok', open: {path: 'docs/otro.md'}}]);
  const seg = splitInline(text.text, links).find(s => s.type === 'link');
  assert.equal(seg.link.status, 'ok');
});

test('renderBlocks: negrita, código inline literal, enlace estándar sin clasificar y HTML como texto', () => {
  const para = renderBlocks(DOC, md)[3];
  assert.deepEqual(find(para.inline, 'strong').children, [{type: 'text', text: 'fuerte'}]);
  // [[…]] dentro de code_inline queda literal: es un nodo code, no un texto que splitInline resuelva
  assert.deepEqual(find(para.inline, 'code'), {type: 'code', text: 'codigo [[no.md]]'});
  assert.deepEqual(find(para.inline, 'std_link'), {type: 'std_link', href: 'https://example.com/x', text: 'la web'});
  assert.ok(para.inline.some(n => n.type === 'softbreak'));
  // el HTML del documento no se interpreta: llega como texto
  assert.ok(inlineText(para.inline).includes('<script>alert(1)</script>'));
  assert.equal(find(para.inline, 'html_inline'), null);
});

test('renderBlocks: un [[…]] dentro de énfasis conserva su resolución', () => {
  const para = renderBlocks(DOC, md)[3];
  const em = find(para.inline, 'em');
  assert.deepEqual(em.children, [{type: 'text', text: '[[otro.md#Segunda parte]]'}]);
  const links = linksByRaw([{raw: '[[otro.md#Segunda parte]]', status: 'roto', cause: 'ancla inexistente'}]);
  const [seg] = splitInline(em.children[0].text, links);
  assert.equal(seg.type, 'link');
  assert.equal(seg.label, 'otro.md#Segunda parte');
  assert.equal(seg.link.status, 'roto');
});

test('renderBlocks: items de lista con [pred:: [[…]]] en su texto', () => {
  const list = renderBlocks(DOC, md)[4];
  assert.equal(list.ordered, false);
  const [first] = list.items[0].blocks;
  assert.equal(first.tight, true);
  const segs = splitInline(first.inline[0].text);
  assert.deepEqual(segs.map(s => s.type), ['text', 'link']);
  assert.equal(segs[1].raw, '[pred:: [[otro.md]]]');
});

test('renderBlocks: sin frontmatter las lineas son las de la fuente; HTML de bloque queda como texto', () => {
  const blocks = renderBlocks('Intro\n\n<div onclick="x()">hola</div>\n\n## Fin\n', md);
  assert.deepEqual(blocks.map(b => [b.kind, b.line_start, b.line_end]), [['paragraph', 1, 1], ['paragraph', 3, 3], ['heading', 5, 5]]);
  assert.deepEqual(blocks[1].inline, [{type: 'text', text: '<div onclick="x()">hola</div>'}]);
});
