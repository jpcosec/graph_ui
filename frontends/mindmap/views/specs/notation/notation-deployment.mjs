// Layout propio de un despliegue (spec2viz §14) grande y anidado, cuando ELK no lo deja legible: con
// INCLUDE_CHILDREN, cada nivel de anidado suma su encabezado y su padding en cada capa, y ni el plegado
// ni la compactación actúan dentro de los contenedores. Aquí cada contenedor acomoda a sus hijos en
// columnas por flujo (de afuera hacia adentro) o en una grilla, eligiendo la proporción que maximiza
// el zoom del diagrama entero en su lienzo; las aristas se rutean ortogonales con A* sobre una grilla
// de visibilidad que esquiva nodos y títulos. Puro: la vista lo recibe con la misma forma que el de
// ELK (nodos con padre y posición relativa, aristas con recorrido, rótulos de placeLabels).
import {sizeGlyph, containerHeader, edgeLabelBox, placeLabels, absoluteBoxes, labelsOnNodes} from './notation-layout.mjs';

// STUB: tramo recto que sale de cada puerto; CLEAR: holgura de las líneas de la grilla alrededor de cada obstáculo.
// LABEL_ROOM: holgura alrededor de un rótulo en el hueco entre dos hermanos.
export const LABEL_ROOM = 20, PAD = 14, HEAD_GAP = 14, CLEAR = 10, STUB = 5, BEND = 40, REUSE = 60, NUDGE = 9;
// Proporciones (ancho/alto) que se prueban para cada contenedor; gana la que da más zoom al todo.
export const ASPECTS = [0.6, 0.9, 1.2, 1.5, 2, 2.8, 4];

// Rango de flujo entre hermanos: cada arista sube al par de hijos del ancestro común que la contienen;
// el rango es el camino más largo desde las fuentes (los ciclos se cortan por DFS).
export function siblingRanks(scene, labelSize = () => null) {
  const parent = new Map(scene.nodes.map(n => [n.id, n.parent || '']));
  const chain = id => { const out = []; for (let p = id; p; p = parent.get(p)) out.unshift(p); return out; };
  const kids = new Map();
  for (const n of scene.nodes) kids.set(n.parent || '', [...(kids.get(n.parent || '') || []), n.id]);
  const pairs = new Map(), labelBetween = new Map(), edgePair = new Map();
  for (const e of scene.edges) {
    const a = chain(e.source), b = chain(e.target);
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i >= a.length || i >= b.length) continue; // de un nodo a su descendiente: no ordena hermanos
    const group = i ? a[i - 1] : '';
    if (!pairs.has(group)) pairs.set(group, []);
    pairs.get(group).push([a[i], b[i]]);
    // El par de hermanos que separa cada arista: si su rótulo no cabe, el hueco entre ellos lo aloja.
    const size = labelSize(e), key = [a[i], b[i]].sort().join('|');
    edgePair.set(e.id, key);
    if (size) { const old = labelBetween.get(key) || {width: 0, height: 0}; labelBetween.set(key, {width: Math.max(old.width, size.width), height: Math.max(old.height, size.height)}); }
  }
  const rank = new Map();
  for (const [group, ids] of kids) {
    const out = new Map(ids.map(id => [id, []]));
    for (const [s, t] of pairs.get(group) || []) if (s !== t && out.has(s) && out.has(t)) out.get(s).push(t);
    const state = new Map(), forward = [];
    const visit = id => { state.set(id, 1); for (const t of out.get(id)) { if (!state.has(t)) { forward.push([id, t]); visit(t); } else if (state.get(t) === 2) forward.push([id, t]); } state.set(id, 2); };
    const incoming = new Set([...out.values()].flat());
    for (const id of [...ids.filter(id => !incoming.has(id)), ...ids]) if (!state.has(id)) visit(id);
    for (const id of ids) rank.set(id, 0);
    for (let pass = 0; pass < ids.length; pass++) for (const [s, t] of forward) rank.set(t, Math.max(rank.get(t), rank.get(s) + 1));
  }
  return {rank, kids, labelBetween, edgePair};
}

// Formas de acomodar a los hijos: columnas por rango (el flujo va de izquierda a derecha y cada columna
// apila sus hijos) y grillas de k columnas en orden de lectura (rango y después el orden del spec).
function arrangements(ids, rank) {
  const order = [...ids].sort((a, b) => rank.get(a) - rank.get(b));
  const ranks = [...new Set(order.map(id => rank.get(id)))];
  // Columnas por rango: cada una apila a sus hijos por su cuenta (stack); grilla: filas compartidas.
  const out = [{stack: true, cols: ranks.map(r => order.filter(id => rank.get(id) === r))}];
  for (let k = 1; k <= order.length; k++) {
    const cols = Array.from({length: k}, () => []);
    order.forEach((id, i) => cols[i % k].push(id));
    out.push({stack: false, cols: cols.filter(c => c.length)});
  }
  return out;
}

// Medidas de una disposición en columnas con el tamaño elegido de cada hijo.
// Entre dos columnas (o filas) vecinas, el hueco es `gap` o lo que pida el rótulo más grande de las
// aristas entre sus hijos.
function measureCols({stack, cols}, sizeOf, gap, labelBetween) {
  const between = (as, bs, side) => Math.max(0, ...as.flatMap(a => bs.map(b => labelBetween.get([a, b].sort().join('|'))?.[side] || 0)));
  const colW = cols.map(c => Math.max(...c.map(id => sizeOf(id).width)));
  const colGap = cols.slice(1).map((c, i) => Math.max(gap, between(cols[i], c, 'width') + LABEL_ROOM));
  const width = colW.reduce((a, b) => a + b, 0) + colGap.reduce((a, b) => a + b, 0);
  if (stack) {
    // Cada columna apila a sus hijos; el hueco entre dos vecinos de la columna aloja su rótulo si hace falta.
    const itemGap = cols.map(c => c.slice(1).map((id, i) => Math.max(gap, between([c[i]], [id], 'height') + LABEL_ROOM)));
    const colH = cols.map((c, ci) => c.reduce((h, id) => h + sizeOf(id).height, 0) + itemGap[ci].reduce((a, b) => a + b, 0));
    return {stack, colW, colGap, itemGap, colH, width, height: Math.max(...colH)};
  }
  const rows = Math.max(...cols.map(c => c.length));
  const rowH = Array.from({length: rows}, (_, r) => Math.max(0, ...cols.map(c => (c[r] ? sizeOf(c[r]).height : 0))));
  const rowsOf = r => cols.map(c => c[r]).filter(Boolean);
  const rowGap = Array.from({length: rows - 1}, (_, r) => Math.max(gap, between(rowsOf(r), rowsOf(r + 1), 'height') + LABEL_ROOM));
  return {stack, colW, rowH, colGap, rowGap, width, height: rowH.reduce((a, b) => a + b, 0) + rowGap.reduce((a, b) => a + b, 0)};
}

// Frente de Pareto: de cada ancho, el menos alto; como mucho `limit`, repartidos.
function pareto(options, limit = 12) {
  const sorted = [...options].sort((a, b) => a.width - b.width || a.height - b.height);
  const front = [];
  for (const o of sorted) if (!front.length || o.height < front[front.length - 1].height - 0.5) front.push(o);
  if (front.length <= limit) return front;
  return Array.from({length: limit}, (_, i) => front[Math.round(i * (front.length - 1) / (limit - 1))]);
}

// Todas las formas (ancho, alto) en que se puede dibujar el árbol: cada contenedor ofrece su frente de
// Pareto, combinando cada disposición con las formas de sus hijos que mejor se ajustan a una proporción
// (ASPECTS); la raíz elige la que más zoom da en el lienzo.
function pack(scene, {measure, wrapWidth, gap, canvas, roomFor = new Set()}) {
  const {rank, kids, labelBetween: all} = siblingRanks(scene, e => (e.label ? edgeLabelBox(e.label, {measure}) : null));
  const labelBetween = new Map([...all].filter(([key]) => roomFor.has(key)));
  const byId = new Map(scene.nodes.map(n => [n.id, n]));
  const cells = new Map(), sizes = new Map(), headers = new Map(), lines = new Map();
  const placeCols = (cols, m, pick, offsetX, offsetY) => {
    let x = offsetX;
    cols.forEach((col, ci) => {
      // Apiladas: la columna se centra en el alto disponible; en grilla, cada hijo en su fila.
      let y = offsetY + (m.stack ? (m.height - m.colH[ci]) / 2 : 0);
      col.forEach((id, r) => {
        const o = pick.get(id);
        const rowH = m.stack ? o.height : m.rowH[r];
        cells.set(id, {x: x + (m.colW[ci] - o.width) / 2, y: y + (rowH - o.height) / 2});
        o.choose();
        y += rowH + ((m.stack ? m.itemGap[ci][r] : m.rowGap[r]) || 0);
      });
      x += m.colW[ci] + (m.colGap[ci] || 0);
    });
  };
  // Opciones de cada hijo según la proporción a la que se ajusta.
  const fitting = (list, aspect) => list.reduce((best, o) => (!best || Math.max(o.width / aspect, o.height) < Math.max(best.width / aspect, best.height) ? o : best), null);
  const candidates = (ids, head) => {
    const opts = new Map(ids.map(id => [id, options(id)]));
    const out = [];
    for (const aspect of ASPECTS) {
      const pick = new Map(ids.map(id => [id, fitting(opts.get(id), aspect)]));
      for (const arrangement of arrangements(ids, rank)) {
        const m = measureCols(arrangement, id => pick.get(id), gap, labelBetween);
        out.push({m, cols: arrangement.cols, pick, head});
      }
    }
    return out;
  };
  const memo = new Map();
  const options = id => {
    if (memo.has(id)) return memo.get(id);
    const children = kids.get(id) || [];
    let list;
    if (!children.length) {
      const s = sizeGlyph(byId.get(id).glyph, {measure, wrapWidth});
      lines.set(id, s.lines || []);
      list = [{width: s.width, height: s.height, choose: () => sizes.set(id, {width: s.width, height: s.height})}];
    } else {
      const head = containerHeader(byId.get(id).glyph, {measure, wrapWidth: wrapWidth + 60});
      lines.set(id, head.lines);
      const top = head.height + HEAD_GAP;
      list = pareto(candidates(children, head).map(({m, cols, pick}) => {
        const width = Math.max(m.width, head.width) + PAD * 2, height = top + m.height + PAD;
        return {width, height, choose: () => {
          sizes.set(id, {width, height});
          headers.set(id, {...head, x: PAD, y: 2, width: Math.min(head.width, width - PAD * 2)});
          placeCols(cols, m, pick, PAD + (width - PAD * 2 - m.width) / 2, top);
        }};
      }));
    }
    memo.set(id, list);
    return list;
  };
  const roots = kids.get('') || [];
  const margin = CLEAR * 3;
  let best = null;
  for (const {m, cols, pick} of candidates(roots, null)) {
    const width = m.width + margin * 2, height = m.height + margin * 2;
    const zoom = Math.min(canvas.width / width, canvas.height / height);
    if (!best || zoom > best.zoom + 1e-6) best = {m, cols, pick, width, height, zoom};
  }
  placeCols(best.cols, best.m, best.pick, margin, margin);
  const nodes = scene.nodes.map(n => ({id: n.id, parent: n.parent || null, x: cells.get(n.id).x, y: cells.get(n.id).y,
    width: sizes.get(n.id).width, height: sizes.get(n.id).height, container: Boolean((kids.get(n.id) || []).length), glyph: n.glyph,
    lines: lines.get(n.id) || [], header: headers.get(n.id) || null, outside: null}));
  const depth = id => { let d = 0; for (let p = byId.get(id)?.parent; p; p = byId.get(p)?.parent) d++; return d; };
  for (const n of nodes) n.depth = depth(n.id);
  return {nodes, width: best.width, height: best.height, zoom: best.zoom};
}

// ---- ruteo ortogonal ----
class Heap {
  constructor() { this.a = []; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
    if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; }
}

const SIDES = {E: [1, 0], W: [-1, 0], S: [0, 1], N: [0, -1]};

export function routeEdges(layout) {
  const abs = absoluteBoxes(layout);
  const leaves = layout.nodes.filter(n => !n.container).map(n => ({id: n.id, ...abs.get(n.id)}));
  const heads = layout.nodes.filter(n => n.container && n.header).map(n => { const b = abs.get(n.id);
    return {id: n.id, x: b.x + n.header.x, y: b.y + n.header.y, width: n.header.width, height: n.header.height}; });
  const obstacles = [...leaves, ...heads];
  // Puertos: el costado que mira al otro extremo; varios en un mismo costado se reparten.
  const centre = id => { const b = abs.get(id); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; };
  const sideOf = (from, to) => { const a = centre(from), b = centre(to), bf = abs.get(from);
    const dx = (b.x - a.x) / bf.width, dy = (b.y - a.y) / bf.height; return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N'); };
  const ends = [];
  for (const e of layout.edges) {
    ends.push({e, end: 'source', node: e.source, side: sideOf(e.source, e.target), other: e.target});
    ends.push({e, end: 'target', node: e.target, side: sideOf(e.target, e.source), other: e.source});
  }
  const groups = new Map();
  for (const x of ends) { const k = `${x.node}|${x.side}`; groups.set(k, [...(groups.get(k) || []), x]); }
  const port = new Map();
  for (const list of groups.values()) {
    const horizontal = list[0].side === 'N' || list[0].side === 'S';
    list.sort((a, b) => (horizontal ? centre(a.other).x - centre(b.other).x : centre(a.other).y - centre(b.other).y));
    list.forEach((x, i) => {
      const b = abs.get(x.node), f = (i + 1) / (list.length + 1);
      const p = {E: {x: b.x + b.width, y: b.y + b.height * f}, W: {x: b.x, y: b.y + b.height * f},
        S: {x: b.x + b.width * f, y: b.y + b.height}, N: {x: b.x + b.width * f, y: b.y}}[x.side];
      const [dx, dy] = SIDES[x.side];
      port.set(`${x.e.id}|${x.end}`, {p, stub: {x: p.x + dx * STUB, y: p.y + dy * STUB}});
    });
  }
  // Grilla de visibilidad: bordes de los obstáculos (con holgura), sus mitades, los puertos y un anillo exterior.
  const xs = new Set([-CLEAR, layout.width + CLEAR]), ys = new Set([-CLEAR, layout.height + CLEAR]);
  for (const o of obstacles) { xs.add(o.x - CLEAR); xs.add(o.x + o.width + CLEAR); ys.add(o.y - CLEAR); ys.add(o.y + o.height + CLEAR); }
  for (const n of layout.nodes.filter(m => m.container)) { const b = abs.get(n.id); xs.add(b.x + PAD / 2); xs.add(b.x + b.width - PAD / 2); ys.add(b.y + b.height - PAD / 2); }
  for (const {stub} of port.values()) { xs.add(stub.x); ys.add(stub.y); }
  const mids = set => { const v = [...set].sort((a, b) => a - b); for (let i = 1; i < v.length; i++) if (v[i] - v[i - 1] > 2 * CLEAR) set.add((v[i] + v[i - 1]) / 2); };
  mids(xs); mids(ys);
  const X = [...xs].sort((a, b) => a - b), Y = [...ys].sort((a, b) => a - b);
  const inside = (x, y) => obstacles.some(o => x > o.x - 0.5 && x < o.x + o.width + 0.5 && y > o.y - 0.5 && y < o.y + o.height + 0.5);
  const blockedH = (y, x1, x2) => obstacles.some(o => y > o.y - 0.5 && y < o.y + o.height + 0.5 && Math.min(x1, x2) < o.x + o.width + 0.5 && Math.max(x1, x2) > o.x - 0.5);
  const blockedV = (x, y1, y2) => obstacles.some(o => x > o.x - 0.5 && x < o.x + o.width + 0.5 && Math.min(y1, y2) < o.y + o.height + 0.5 && Math.max(y1, y2) > o.y - 0.5);
  const W = X.length, H = Y.length;
  const free = new Uint8Array(W * H);
  for (let i = 0; i < W; i++) for (let j = 0; j < H; j++) free[j * W + i] = inside(X[i], Y[j]) ? 0 : 1;
  const right = new Uint8Array(W * H), down = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i + 1 < W; i++) right[j * W + i] = free[j * W + i] && free[j * W + i + 1] && !blockedH(Y[j], X[i], X[i + 1]) ? 1 : 0;
  for (let i = 0; i < W; i++) for (let j = 0; j + 1 < H; j++) down[j * W + i] = free[j * W + i] && free[(j + 1) * W + i] && !blockedV(X[i], Y[j], Y[j + 1]) ? 1 : 0;
  const used = new Map();
  const segKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  const at = (x, y) => [X.indexOf(x), Y.indexOf(y)];
  const astar = (from, to) => {
    const [si, sj] = at(from.x, from.y), [ti, tj] = at(to.x, to.y);
    if (si < 0 || sj < 0 || ti < 0 || tj < 0) return null;
    const start = sj * W + si, goal = tj * W + ti;
    const best = new Map(), prev = new Map(), heap = new Heap();
    const h = k => Math.abs(X[k % W] - X[ti]) + Math.abs(Y[Math.floor(k / W)] - Y[tj]);
    for (let d = 0; d < 4; d++) { best.set(start * 4 + d, 0); heap.push([h(start), start, d, 0]); }
    while (heap.size) {
      const [, k, d, g] = heap.pop();
      if (g > (best.get(k * 4 + d) ?? Infinity)) continue;
      if (k === goal) { const path = [k]; let s = k * 4 + d; while (prev.has(s)) { s = prev.get(s); path.unshift(Math.floor(s / 4)); } return path; }
      const i = k % W, j = Math.floor(k / W);
      const steps = [[0, i + 1 < W && right[k], k + 1], [1, i > 0 && right[k - 1], k - 1], [2, j + 1 < H && down[k], k + W], [3, j > 0 && down[k - W], k - W]];
      for (const [nd, ok, n] of steps) {
        if (!ok) continue;
        const len = Math.abs(X[n % W] - X[i]) + Math.abs(Y[Math.floor(n / W)] - Y[j]);
        const reuse = (used.get(segKey(k, n)) || 0) * REUSE;
        const ng = g + len + (nd !== d && g > 0 ? BEND : 0) + reuse;
        const key = n * 4 + nd;
        if (ng < (best.get(key) ?? Infinity)) { best.set(key, ng); prev.set(key, k * 4 + d); heap.push([ng + h(n), n, nd, ng]); }
      }
    }
    return null;
  };
  for (const e of layout.edges) {
    const s = port.get(`${e.id}|source`), t = port.get(`${e.id}|target`);
    const path = astar(s.stub, t.stub);
    if (!path) { e.points = [s.p, s.stub, {x: t.stub.x, y: s.stub.y}, t.stub, t.p]; layout.unrouted = (layout.unrouted || 0) + 1; continue; }
    for (let i = 1; i < path.length; i++) used.set(segKey(path[i - 1], path[i]), (used.get(segKey(path[i - 1], path[i])) || 0) + 1);
    const pts = [s.p, ...path.map(k => ({x: X[k % W], y: Y[Math.floor(k / W)]})), t.p];
    e.points = simplify(pts);
  }
  nudge(layout, obstacles);
  return layout;
}

const simplify = pts => pts.filter((p, i) => i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.1 || Math.abs(p.y - pts[i - 1].y) > 0.1)
  .filter((p, i, a) => i === 0 || i === a.length - 1 || !((Math.abs(a[i - 1].x - p.x) < 0.1 && Math.abs(p.x - a[i + 1].x) < 0.1)
    || (Math.abs(a[i - 1].y - p.y) < 0.1 && Math.abs(p.y - a[i + 1].y) < 0.1)));

// Tramos de aristas distintas sobre la misma línea y solapados: se separan NUDGE px, si el nuevo lugar
// no pisa un obstáculo. Solo los tramos interiores (los que salen de un puerto quedan pegados a él).
function nudge(layout, obstacles) {
  const segs = [];
  for (const e of layout.edges) for (let i = 1; i + 2 < e.points.length; i++) {
    const a = e.points[i], b = e.points[i + 1], horizontal = Math.abs(a.y - b.y) < 0.1;
    segs.push({e, i, horizontal, line: horizontal ? a.y : a.x, lo: Math.min(horizontal ? a.x : a.y, horizontal ? b.x : b.y), hi: Math.max(horizontal ? a.x : a.y, horizontal ? b.x : b.y)});
  }
  const groups = new Map();
  for (const s of segs) { const k = `${s.horizontal}|${s.line.toFixed(1)}`; groups.set(k, [...(groups.get(k) || []), s]); }
  const hits = (s, line) => obstacles.some(o => (s.horizontal
    ? line > o.y - 2 && line < o.y + o.height + 2 && s.lo < o.x + o.width && s.hi > o.x
    : line > o.x - 2 && line < o.x + o.width + 2 && s.lo < o.y + o.height && s.hi > o.y));
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    // Racimos de tramos que se solapan; cada uno se reparte alrededor de la línea.
    list.sort((a, b) => a.lo - b.lo);
    const clusters = [];
    for (const s of list) { const c = clusters[clusters.length - 1]; if (c && s.lo < c.hi - 1 && c.edges.has(s.e.id) === false) { c.items.push(s); c.hi = Math.max(c.hi, s.hi); c.edges.add(s.e.id); } else clusters.push({items: [s], hi: s.hi, edges: new Set([s.e.id])}); }
    for (const c of clusters) {
      if (c.items.length < 2) continue;
      c.items.forEach((s, k) => {
        const offset = (k - (c.items.length - 1) / 2) * NUDGE, line = s.line + offset;
        if (!offset || hits(s, line)) return;
        const a = s.e.points[s.i], b = s.e.points[s.i + 1];
        if (s.horizontal) { a.y = line; b.y = line; } else { a.x = line; b.x = line; }
      });
    }
  }
}

// Separaciones entre hermanos que se prueban: más juntas dan más zoom; más holgadas dejan sitio a
// los rótulos. Gana el que no tiene problemas y, a igualdad, el de más zoom.
export const GAPS = [28, 36, 44];

export function deploymentLayout(scene, {measure, wrapWidth = 150, canvas, gaps = GAPS, issues}) {
  const {edgePair} = siblingRanks(scene);
  let best = null;
  for (const gap of gaps) {
    // Primero sin reservar sitio a los rótulos; los pares de hermanos cuyo rótulo quedó encima de un
    // nodo (aristas cortas entre vecinos) piden su hueco en la pasada siguiente.
    const roomFor = new Set();
    for (let pass = 0; pass < 4; pass++) {
      const packed = pack(scene, {measure, wrapWidth, gap, canvas, roomFor});
      const layout = {nodes: packed.nodes, width: packed.width, height: packed.height, engine: 'deployment', gap,
        edges: scene.edges.map(e => ({...e, points: [], labelSize: e.label ? edgeLabelBox(e.label, {measure}) : null, labelBox: null}))};
      routeEdges(layout);
      placeLabels(layout);
      layout.zoom = Math.min(canvas.width / layout.width, canvas.height / layout.height);
      layout.issues = issues ? issues(layout) : {total: 0};
      layout.issues.total += layout.unrouted || 0;
      if (!best || layout.issues.total < best.issues.total || (layout.issues.total === best.issues.total && layout.zoom > best.zoom + 1e-6)) best = layout;
      const covering = labelsOnNodes(layout).map(id => edgePair.get(id)).filter(k => k && !roomFor.has(k));
      if (!covering.length) break;
      covering.forEach(k => roomFor.add(k));
    }
  }
  return best;
}
