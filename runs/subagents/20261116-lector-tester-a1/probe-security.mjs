// Sonda propia del tester: renderBlocks con el motor real sobre contenido hostil.
import {register} from 'node:module';
import {readFileSync} from 'node:fs';
import {renderBlocks, createMarkdown, inlineText} from '../../../frontends/mindmap/views/workspace/node/reader.mjs';
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(s, c, n) { const p = c.parentURL || '';
  if (s.startsWith('https://')) return {url: s, shortCircuit: true};
  if (p.startsWith('https://') && /^[./]/.test(s)) return {url: new URL(s, p).href, shortCircuit: true};
  return n(s, c); }
export async function load(u, c, n) { if (!u.startsWith('https://')) return n(u, c);
  const r = await fetch(u); return {format: 'module', source: await r.text(), shortCircuit: true}; }`));
const {default: MarkdownIt} = await import('https://esm.sh/markdown-it@14.1.0');
const md = createMarkdown(MarkdownIt);
const doc = readFileSync(process.argv[2], 'utf-8');
const blocks = renderBlocks(doc, md);
const types = new Set();
const walkI = ns => (ns || []).forEach(n => { types.add(n.type); walkI(n.children); });
const walkB = bs => bs.forEach(b => { walkI(b.inline); if (b.blocks) walkB(b.blocks); (b.items || []).forEach(it => walkB(it.blocks)); });
walkB(blocks);
console.log(JSON.stringify({kinds: blocks.map(b => [b.kind, b.line_start, b.line_end]), inlineTypes: [...types]}, null, 0));
console.log(JSON.stringify(blocks, null, 1));
