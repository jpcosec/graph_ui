// Chequeo de claridad semiótica y distancia visual (Moody 2009) sobre un mapeo constructo -> símbolo.
// Ejecutar: node docs/representacion/01-fundamentos/ejemplos/claridad-semiotica.mjs
//
// Un símbolo es un objeto { variable visual: valor }. Dos símbolos son el mismo si todas sus variables
// coinciden; su distancia visual es cuántas variables difieren.

const key = s => JSON.stringify(Object.keys(s).sort().map(k => [k, s[k]]));
const distance = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => a[k] !== b[k]).length;

export function audit({constructs, mapping, symbols = []}) {
  const bySymbol = new Map(), byConstruct = new Map();
  for (const {construct, symbol} of mapping) {
    bySymbol.set(key(symbol), [...(bySymbol.get(key(symbol)) || []), construct]);
    byConstruct.set(construct, [...(byConstruct.get(construct) || []), symbol]);
  }
  const report = {
    sobrecarga: [...bySymbol.values()].filter(cs => new Set(cs).size > 1),          // varios constructos, un símbolo
    redundancia: [...byConstruct].filter(([, ss]) => new Set(ss.map(key)).size > 1).map(([c]) => c), // un constructo, varios símbolos
    deficit: constructs.filter(c => !byConstruct.has(c)),                             // constructo sin símbolo
    exceso: symbols.filter(s => !bySymbol.has(key(s))),                               // símbolo sin constructo
    distanciaBaja: [],
  };
  const pairs = [...byConstruct].map(([c, ss]) => [c, ss[0]]);
  for (let i = 0; i < pairs.length; i++) for (let j = i + 1; j < pairs.length; j++) {
    const d = distance(pairs[i][1], pairs[j][1]);
    if (d === 1) report.distanciaBaja.push(`${pairs[i][0]} ~ ${pairs[j][0]}`);
  }
  return report;
}

// 1. Aristas de la vista Schema actual de graph_ui (views/models/diagram/diagram-view.js).
const schemaActual = {
  constructs: ['contención declarada', 'relación declarada con instancias', 'relación declarada sin instancias',
    'relación observada no declarada', 'referencia inferida'],
  mapping: [
    {construct: 'contención declarada', symbol: {color: 'color de la clase origen', trazo: 'sólido', terminal: 'flecha llena'}},
    {construct: 'relación declarada con instancias', symbol: {color: 'accent', trazo: 'sólido', terminal: 'flecha llena'}},
    {construct: 'relación declarada sin instancias', symbol: {color: 'accent', trazo: 'punteado 2 3', terminal: 'flecha llena'}},
    {construct: 'relación observada no declarada', symbol: {color: 'accent', trazo: 'sólido', terminal: 'flecha llena'}},
    {construct: 'referencia inferida', symbol: {color: 'edge', trazo: 'punteado 5 4', terminal: 'flecha llena'}},
  ],
};

// 2. Un subconjunto de UML de clases (notación estándar).
const umlClases = {
  constructs: ['generalización', 'realización', 'composición', 'agregación', 'asociación', 'dependencia'],
  mapping: [
    {construct: 'generalización', symbol: {trazo: 'sólido', terminalDestino: 'triángulo hueco', terminalOrigen: 'nada'}},
    {construct: 'realización', symbol: {trazo: 'punteado', terminalDestino: 'triángulo hueco', terminalOrigen: 'nada'}},
    {construct: 'composición', symbol: {trazo: 'sólido', terminalDestino: 'nada', terminalOrigen: 'rombo lleno'}},
    {construct: 'agregación', symbol: {trazo: 'sólido', terminalDestino: 'nada', terminalOrigen: 'rombo hueco'}},
    {construct: 'asociación', symbol: {trazo: 'sólido', terminalDestino: 'nada', terminalOrigen: 'nada'}},
    {construct: 'dependencia', symbol: {trazo: 'punteado', terminalDestino: 'flecha abierta', terminalOrigen: 'nada'}},
  ],
};

for (const [nombre, notacion] of Object.entries({'Schema actual de graph_ui': schemaActual, 'UML de clases': umlClases})) {
  console.log(`\n== ${nombre}`);
  console.log(JSON.stringify(audit(notacion), null, 2));
}
