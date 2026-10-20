// Estilo de notación (spec2viz §13) en la vista Specs: lógica pura de notation-style.mjs y el tamaño
// que el layout reserva para el ícono y las formas dibujadas como contorno.
import test from 'node:test';
import assert from 'node:assert/strict';
import {themed, paletteInk, glyphVars, readableInk, luminance, iconKey, OUTLINE_SHAPES, OUTLINES, SHAPE_INNER, shapeBox, innerVars} from '../frontends/mindmap/views/specs/notation/notation-style.mjs';
import {sizeGlyph} from '../frontends/mindmap/views/specs/notation/notation-layout.mjs';
import {buildScene} from '../frontends/mindmap/views/specs/notation/notation.mjs';

const measure = (text, size) => (text || '').length * size * 0.5;

test('themed elige el color del tema activo; un string vale para los dos', () => {
  assert.equal(themed({light: '#fff', dark: '#000'}, 'dark'), '#000');
  assert.equal(themed({light: '#fff', dark: '#000'}, 'light'), '#fff');
  assert.equal(themed({light: '#fff'}, 'dark'), '#fff');
  assert.equal(themed('#0072b2', 'dark'), '#0072b2');
  assert.equal(themed(null), null);
});

const INKS = {light: '#1f2328', dark: '#e6edf3'};

test('glyphVars: sin estilo no hay variables; con relleno el texto toma el ink de la paleta que contrasta', () => {
  assert.deepEqual(glyphVars(null), {});
  assert.deepEqual(glyphVars({icon: 'cpu'}), {});
  const vars = glyphVars({fill: {light: '#e8f4e8', dark: '#1f3a1f'}, stroke: {light: '#2e7d32', dark: '#81c784'}}, 'dark', INKS);
  assert.deepEqual(vars, {'--glyph-fill': '#1f3a1f', '--glyph-stroke': '#81c784', '--glyph-ink': INKS.dark});
  assert.equal(glyphVars({stroke: '#b35900'}, 'light', INKS)['--glyph-ink'], undefined);
});

test('readableInk: un relleno literal claro conserva el texto oscuro también en el tema oscuro', () => {
  assert.equal(glyphVars({fill: {light: '#fff1c2', dark: '#fff1c2'}}, 'dark', INKS)['--glyph-ink'], INKS.light);
  assert.equal(readableInk('#092c42', INKS), INKS.dark);
  assert.equal(readableInk('#dbebf4', INKS), INKS.light);
  assert.equal(readableInk('#fff', null), '#1f2328');
  assert.equal(readableInk('var(--x)', INKS), null);
  assert.ok(luminance('#ffffff') > 0.99 && luminance('#000') === 0);
});

test('paletteInk lee los dos inks del PaletteDoc que nombra la vista', () => {
  const documents = [{model_name: 'PaletteDoc', id: 'default', payload: {name: 'default', ink: {light: '#1a1a1a', dark: '#f0f0f0'}}}];
  assert.deepEqual(paletteInk(documents, 'default'), {light: '#1a1a1a', dark: '#f0f0f0'});
  assert.deepEqual(paletteInk(documents, 'PaletteDoc:default'), {light: '#1a1a1a', dark: '#f0f0f0'});
  assert.equal(paletteInk(documents, 'otra'), null);
  assert.equal(paletteInk(documents, null), null);
});

test('iconKey pasa el nombre kebab-case de lucide a la clave del objeto icons', () => {
  assert.equal(iconKey('app-window'), 'AppWindow');
  assert.equal(iconKey('database'), 'Database');
  assert.equal(iconKey('key-round'), 'KeyRound');
});

test('cada forma de contorno tiene trazo y área interior', () => {
  for (const shape of OUTLINE_SHAPES) {
    assert.ok(OUTLINES[shape], shape);
    const [t, r, b, l] = SHAPE_INNER[shape];
    assert.ok(t + b < 1 && l + r < 1, shape);
    assert.deepEqual(Object.keys(innerVars(shape)), ['--inner-top', '--inner-right', '--inner-bottom', '--inner-left']);
  }
  assert.deepEqual(innerVars('box'), {});
  assert.deepEqual(shapeBox('box', 100, 40), [100, 40]);
});

test('el layout reserva sitio para el ícono, y una forma de contorno crece hasta que el texto quepa en su área interior', () => {
  const plain = sizeGlyph({shape: 'box', label: 'Orders database'}, {measure, wrapWidth: 200});
  const icon = sizeGlyph({shape: 'box', label: 'Orders database', style: {icon: 'database'}}, {measure, wrapWidth: 200});
  assert.ok(icon.width >= plain.width + 20, [plain.width, icon.width]);
  for (const shape of OUTLINE_SHAPES) {
    const glyph = {shape, label: 'Orders database with a long name', keyword: '«external»', style: {icon: 'database'}};
    const size = sizeGlyph(glyph, {measure, wrapWidth: 200});
    const [t, r, b, l] = SHAPE_INNER[shape];
    const textW = Math.max(...size.lines.map(line => measure(line, 12.5))) + 20;
    assert.ok(size.width * (1 - l - r) >= textW, [shape, size.width, textW]);
    assert.ok(size.height * (1 - t - b) >= size.lines.length * 16 + 15, [shape, size.height]);
  }
});

test('buildScene pasa el color resuelto de cada relación y el estilo de cada elemento', () => {
  const view = {notation: 'infra', layout: {kind: 'graph', direction: 'TB'},
    nodes: [{doc: 'a', label: 'A', glyph: 'g.box', shape: 'box', style: {fill: {light: '#fff1c2'}, icon: 'workflow', source: 'glyph'}},
            {doc: 'b', label: 'B', glyph: 'g.box', shape: 'box'}],
    links: [{doc: 'r', source: 'a', target: 'b', relation: 'reads', draw: 'line', label: 'reads', color: {light: '#0072b2', dark: '#56b4e9'}}]};
  const scene = buildScene(view);
  assert.deepEqual(scene.edges.find(e => e.id === 'r').color, {light: '#0072b2', dark: '#56b4e9'});
  assert.equal(scene.nodes.find(n => n.id === 'a').glyph.style.icon, 'workflow');
});
