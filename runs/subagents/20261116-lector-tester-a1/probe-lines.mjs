// Sonda: line_start/line_end de renderBlocks contra las lineas reales del archivo.
import {register} from 'node:module';
import {readFileSync} from 'node:fs';
import {renderBlocks, createMarkdown} from '../../../frontends/mindmap/views/workspace/node/reader.mjs';
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(s, c, n) { const p = c.parentURL || '';
  if (s.startsWith('https://')) return {url: s, shortCircuit: true};
  if (p.startsWith('https://') && /^[./]/.test(s)) return {url: new URL(s, p).href, shortCircuit: true};
  return n(s, c); }
export async function load(u, c, n) { if (!u.startsWith('https://')) return n(u, c);
  const r = await fetch(u); return {format: 'module', source: await r.text(), shortCircuit: true}; }`));
const {default: MarkdownIt} = await import('https://esm.sh/markdown-it@14.1.0');
const md = createMarkdown(MarkdownIt);
for (const f of process.argv.slice(2)) {
  const text = readFileSync(f, 'utf-8'); const L = text.split('\n');
  const bad = []; let n = 0;
  const chk = (b, depth) => {
    n++;
    const first = L[b.line_start - 1] ?? '', last = L[b.line_end - 1] ?? '';
    const ok = {
      frontmatter: () => first === '---' && last.trim() === '---',
      heading: () => /^\s*#/.test(first) || /^\s*[=-]+\s*$/.test(L[b.line_start] ?? ''),
      quote: () => /^\s*>/.test(first),
      code: () => (/^\s*(```|~~~)/.test(first) && /^\s*(```|~~~)/.test(last)) || /^( {4}|\t)/.test(first),
      list: () => /^\s*(>\s*)*([-*+]|\d+[.)])(\s|$)/.test(first),
      paragraph: () => first.trim() !== '' && (depth > 0 || last.trim() !== ''),
      hr: () => true, raw: () => first.trim() !== '',
    }[b.kind]?.() ?? true;
    // el bloque no debe pasarse del siguiente contenido: la linea siguiente a line_end, si es contenido, no pertenece a otro bloque ya
    if (!ok) bad.push({kind: b.kind, line_start: b.line_start, line_end: b.line_end, first, last});
    (b.blocks || []).forEach(c => chk(c, depth + 1));
    (b.items || []).forEach(it => it.blocks.forEach(c => chk(c, depth + 1)));
  };
  const blocks = renderBlocks(text, md);
  blocks.forEach(b => chk(b, 0));
  // cobertura: toda linea no vacia de nivel superior cae en algun bloque
  const covered = new Set(); blocks.forEach(b => { for (let i = b.line_start; i <= b.line_end; i++) covered.add(i); });
  const uncovered = L.map((l, i) => [i + 1, l]).filter(([i, l]) => l.trim() !== '' && !covered.has(i));
  const heads = blocks.filter(b => b.kind === 'heading').map(b => b.line_start);
  console.log(JSON.stringify({file: f, blocks: blocks.length, checked: n, mismatches: bad, uncovered_nonblank: uncovered, frontmatter: blocks[0]?.kind === 'frontmatter' ? [blocks[0].line_start, blocks[0].line_end] : null, heading_lines: heads}));
}
