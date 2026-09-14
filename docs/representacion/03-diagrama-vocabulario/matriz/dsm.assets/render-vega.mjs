// Renderiza un spec de Vega o Vega-Lite a SVG con las bibliotecas oficiales, sin navegador.
// Uso: node render-vega.mjs <spec.json> <salida.svg>   (con vega@6 y vega-lite@6 instalados)
import { readFileSync, writeFileSync } from 'node:fs';
import * as vega from 'vega';
import { compile } from 'vega-lite';

const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const vgSpec = String(spec.$schema || '').includes('vega-lite') ? compile(spec).spec : spec;
const view = new vega.View(vega.parse(vgSpec), { renderer: 'none' });
writeFileSync(process.argv[3], await view.toSVG());
