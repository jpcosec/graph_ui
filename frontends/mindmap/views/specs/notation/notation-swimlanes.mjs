// Carriles UML de una activity (spec2viz §14, `data.partition`): una columna por partición, en orden
// de aparición, y el flujo bajando por filas. ELK no sirve aquí: los pasos de una partición no son
// contiguos en el flujo (Dev -> Script -> Dev), y un contenedor por partición lo apila en bloques. El
// layout y el ruteo ortogonal son propios y puros; la vista los recibe con la misma forma que el de
// ELK (nodos con padre, aristas con recorrido, rótulos colocados por placeLabels).
import {sizeGlyph, containerHeader, edgeLabelBox, placeLabels} from './notation-layout.mjs';

export const LANE_PAD = 24, ROW_GAP = 36, ITEM_GAP = 24, TRACK = 8, GUTTER = 9, NOTE_WRAP = 150, LANE_GAP = 4;

// Filas: el rango de cada paso es su camino más largo desde el inicio por las aristas hacia adelante.
// Una arista es un bucle (hacia atrás) si en un DFS desde el inicio llega a un paso todavía abierto.
export function flowRanks(nodes, edges) {
  const ids = nodes.map(n => n.id), index = new Map(ids.map((id, i) => [id, i]));
  const out = new Map(ids.map(id => [id, []]));
  for (const e of [...edges].sort((a, b) => (a.order || 0) - (b.order || 0))) if (out.has(e.source) && index.has(e.target)) out.get(e.source).push(e);
  const incoming = new Set(edges.map(e => e.target));
  const roots = [...nodes.filter(n => n.glyph?.shape === 'filled-circle'), ...nodes.filter(n => !incoming.has(n.id)), ...nodes].map(n => n.id);
  const state = new Map(), back = new Set(), discovery = [];
  for (const root of roots) {
    if (state.has(root)) continue;
    const stack = [[root, 0]];
    state.set(root, 1); discovery.push(root);
    while (stack.length) {
      const top = stack[stack.length - 1], list = out.get(top[0]);
      if (top[1] >= list.length) { state.set(top[0], 2); stack.pop(); continue; }
      const e = list[top[1]++];
      const s = state.get(e.target);
      if (s === 1) back.add(e.id);
      else if (!s) { state.set(e.target, 1); discovery.push(e.target); stack.push([e.target, 0]); }
    }
  }
  const forward = edges.filter(e => !back.has(e.id) && index.has(e.source) && index.has(e.target));
  const rank = new Map(ids.map(id => [id, 0]));
  const indeg = new Map(ids.map(id => [id, 0]));
  for (const e of forward) indeg.set(e.target, indeg.get(e.target) + 1);
  const queue = ids.filter(id => !indeg.get(id));
  while (queue.length) {
    const id = queue.shift();
    for (const e of forward.filter(f => f.source === id)) {
      rank.set(e.target, Math.max(rank.get(e.target), rank.get(id) + 1));
      indeg.set(e.target, indeg.get(e.target) - 1);
      if (!indeg.get(e.target)) queue.push(e.target);
    }
  }
  return {rank, back, discovery};
}

// Carril de un paso sin partición (inicio, fin, un merge suelto): el de su predecesor, si no el de
// su sucesor, si no el primero.
function laneOf(nodes, edges, back) {
  const lane = new Map(nodes.filter(n => n.lane).map(n => [n.id, n.lane]));
  const forward = edges.filter(e => !back.has(e.id));
  for (let pass = 0; pass < nodes.length && lane.size < nodes.length; pass++) {
    for (const n of nodes) {
      if (lane.has(n.id)) continue;
      const pred = forward.find(e => e.target === n.id && lane.has(e.source));
      const succ = forward.find(e => e.source === n.id && lane.has(e.target));
      if (pred) lane.set(n.id, lane.get(pred.source)); else if (succ) lane.set(n.id, lane.get(succ.target));
    }
  }
  return lane;
}

export function swimlaneLayout(scene, {measure, wrapWidth = 170} = {}) {
  const lanes = scene.lanes || [];
  const notes = scene.nodes.filter(n => n.glyph?.function === 'note');
  const steps = scene.nodes.filter(n => n.glyph?.function !== 'note');
  const flow = scene.edges.filter(e => !e.note);
  const noteOf = new Map(scene.edges.filter(e => e.note).map(e => [e.source, notes.find(n => n.id === e.target)]));
  const {rank, back, discovery} = flowRanks(steps, flow);
  const lane = laneOf(steps, flow, back);
  for (const n of steps) if (!lane.has(n.id)) lane.set(n.id, lanes[0].id);
  // Una nota va al lado de su paso: más angosta, para no ensanchar el carril.
  const sizes = new Map(scene.nodes.map(n => [n.id, sizeGlyph(n.glyph, {measure, wrapWidth: n.glyph?.function === 'note' ? Math.min(wrapWidth, NOTE_WRAP) : wrapWidth})]));
  const heads = new Map(lanes.map(l => [l.id, containerHeader(l.glyph, {measure, wrapWidth: wrapWidth + 60})]));

  // Celdas (fila x carril): los pasos en orden de descubrimiento, cada nota justo a la derecha del suyo.
  const rows = Math.max(0, ...steps.map(n => rank.get(n.id))) + 1;
  const cells = new Map();
  const cell = (r, l) => { const key = `${r}|${l}`; if (!cells.has(key)) cells.set(key, []); return cells.get(key); };
  for (const id of discovery) {
    cell(rank.get(id), lane.get(id)).push(id);
    if (noteOf.get(id)) cell(rank.get(id), lane.get(id)).push(noteOf.get(id).id);
  }
  const extent = ids => ids.reduce((w, id) => w + sizes.get(id).width, 0) + ITEM_GAP * Math.max(0, ids.length - 1);
  const headH = Math.max(...[...heads.values()].map(h => h.height));
  const laneW = new Map(lanes.map(l => [l.id, Math.max(heads.get(l.id).width,
    ...Array.from({length: rows}, (_, r) => extent(cells.get(`${r}|${l.id}`) || []))) + LANE_PAD * 2]));
  const laneX = new Map();
  let x = 0;
  for (const l of lanes) { laneX.set(l.id, x); x += laneW.get(l.id) + LANE_GAP; }
  x -= LANE_GAP;
  const outsideH = id => (sizes.get(id).outside ? sizes.get(id).outside.height + 4 : 0);
  const rowH = Array.from({length: rows}, (_, r) => Math.max(0, ...[...cells.entries()].filter(([k]) => k.startsWith(`${r}|`))
    .flatMap(([, ids]) => ids.map(id => sizes.get(id).height + outsideH(id)))));
  const rowTop = [];
  let y = headH + ROW_GAP;
  for (let r = 0; r < rows; r++) { rowTop.push(y); y += rowH[r] + ROW_GAP; }
  const height = y - ROW_GAP / 2;

  // Cajas absolutas.
  const box = new Map();
  for (const [key, ids] of cells) {
    const [r, l] = [Number(key.split('|')[0]), key.slice(key.indexOf('|') + 1)];
    let cx = laneX.get(l) + (laneW.get(l) - extent(ids)) / 2;
    for (const id of ids) {
      const s = sizes.get(id);
      box.set(id, {x: cx, y: rowTop[r] + (rowH[r] - s.height - outsideH(id)) / 2, width: s.width, height: s.height});
      cx += s.width + ITEM_GAP;
    }
  }
  const laneOfAny = id => lane.get(id) ?? lane.get(scene.edges.find(e => e.note && e.target === id)?.source);

  // ---- ruteo ----
  const leaves = [...box.entries()];
  const freeV = (x0, y0, y1, skip) => !leaves.some(([id, b]) => !skip.includes(id) && x0 > b.x - 4 && x0 < b.x + b.width + 4
    && Math.max(y0, y1) > b.y - 2 && Math.min(y0, y1) < b.y + b.height + 2);
  const freeH = (y0, x0, x1, skip) => !leaves.some(([id, b]) => !skip.includes(id) && y0 > b.y - 2 && y0 < b.y + b.height + 2
    && Math.max(x0, x1) > b.x - 4 && Math.min(x0, x1) < b.x + b.width + 4);
  // Pistas de cada canal (el hueco sobre la fila c): dos tramos horizontales que se solapan van a pistas distintas.
  const tracks = new Map();
  const channelY = (c, x0, x1) => {
    const lo = Math.min(x0, x1) - 6, hi = Math.max(x0, x1) + 6;
    const used = tracks.get(c) || []; tracks.set(c, used);
    let k = 0;
    while (used.some(t => t.k === k && t.lo < hi && lo < t.hi)) k++;
    used.push({k, lo, hi});
    const top = c === 0 ? headH : rowTop[c - 1] + rowH[c - 1];
    const span = (c === 0 ? rowTop[0] : rowTop[c]) - top;
    // Pistas alrededor del centro del canal: 0, +1, -1, +2...
    return top + span / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * TRACK;
  };
  const gutters = new Map();
  const gutterX = (l, side) => {
    const key = `${l}|${side}`, k = gutters.get(key) || 0; gutters.set(key, k + 1);
    return side === 'right' ? laneX.get(l) + laneW.get(l) - GUTTER - k * 7 : laneX.get(l) + GUTTER + k * 7;
  };
  const isDiamond = id => sizes.has(id) && scene.nodes.find(n => n.id === id)?.glyph?.shape === 'diamond';
  const cxOf = b => b.x + b.width / 2, cyOf = b => b.y + b.height / 2;
  const usedVertex = new Map();
  const takeVertex = (id, v) => { const set = usedVertex.get(id) || new Set(); usedVertex.set(id, set); if (set.has(v)) return false; set.add(v); return true; };
  const neighbour = (id, side) => {
    const b = box.get(id), l = laneOfAny(id);
    return leaves.some(([o, ob]) => o !== id && laneOfAny(o) === l && Math.abs(cyOf(ob) - cyOf(b)) < b.height / 2 + ob.height / 2
      && (side === 'right' ? ob.x >= b.x + b.width : ob.x + ob.width <= b.x));
  };
  // Puertos repartidos: las salidas por abajo y las entradas por arriba de una caja, ordenadas por x.
  const ports = (id, list, other) => {
    const b = box.get(id), sorted = [...list].sort((a, c) => cxOf(box.get(other(a))) - cxOf(box.get(other(c))));
    const point = isDiamond(id) || !['box', 'rounded-box', 'node-box', 'class-box'].includes(scene.nodes.find(n => n.id === id)?.glyph?.shape);
    return new Map(sorted.map((e, i) => [e.id, point ? cxOf(b) : b.x + b.width * (i + 1) / (sorted.length + 1)]));
  };
  const forwardOut = new Map(), forwardIn = new Map();
  for (const e of flow) if (!back.has(e.id)) {
    forwardOut.set(e.source, [...(forwardOut.get(e.source) || []), e]);
    forwardIn.set(e.target, [...(forwardIn.get(e.target) || []), e]);
  }
  // Las entradas por arriba incluyen los bucles que no entran por el costado: cada flecha, su punto.
  const sideEntry = e => back.has(e.id) && lane.get(e.target) === lane.get(e.source) && !isDiamond(e.target)
    && !neighbour(e.target, 'right') && !neighbour(e.target, 'left');
  const topIn = new Map();
  for (const e of flow) if (!sideEntry(e)) topIn.set(e.target, [...(topIn.get(e.target) || []), e]);
  const outPort = new Map(), inPort = new Map();
  for (const [id, list] of topIn) for (const [k, v] of ports(id, list, e => e.source)) inPort.set(k, v);

  const routes = new Map();
  const simplify = pts => pts.filter((p, i) => i === 0 || Math.abs(p.x - pts[i - 1].x) > 0.1 || Math.abs(p.y - pts[i - 1].y) > 0.1)
    .filter((p, i, a) => i === 0 || i === a.length - 1 || !((Math.abs(a[i - 1].x - p.x) < 0.1 && Math.abs(p.x - a[i + 1].x) < 0.1)
      || (Math.abs(a[i - 1].y - p.y) < 0.1 && Math.abs(p.y - a[i + 1].y) < 0.1)));
  // Baja desde (x0, y0) de la fila r1 a la entrada (ex, top) de la fila r2, por canales y un pasillo libre.
  const descend = (x0, y0, r1, ex, t, r2, skip) => {
    const top = box.get(t).y;
    if (r2 === r1 + 1) { const yc = channelY(r2, x0, ex); return [{x: x0, y: y0}, {x: x0, y: yc}, {x: ex, y: yc}, {x: ex, y: top}]; }
    const y1 = rowTop[r1 + 1], y2 = rowTop[r2 - 1] + rowH[r2 - 1];
    const candidates = [ex, x0, ...[...laneX.keys()].flatMap(l => [laneX.get(l) + GUTTER + 14, laneX.get(l) + laneW.get(l) - GUTTER - 14])]
      .sort((a, b) => Math.abs(a - ex) - Math.abs(b - ex));
    const cx = candidates.find(c => freeV(c, y1, y2, skip)) ?? ex;
    if (cx === x0) { const yc = channelY(r2, x0, ex); return [{x: x0, y: y0}, {x: x0, y: yc}, {x: ex, y: yc}, {x: ex, y: top}]; }
    const ya = channelY(r1 + 1, x0, cx);
    if (cx === ex) return [{x: x0, y: y0}, {x: x0, y: ya}, {x: ex, y: ya}, {x: ex, y: top}];
    const yb = channelY(r2, cx, ex);
    return [{x: x0, y: y0}, {x: x0, y: ya}, {x: cx, y: ya}, {x: cx, y: yb}, {x: ex, y: yb}, {x: ex, y: top}];
  };
  // Primero las ramas de los rombos (eligen vértice), después el resto, en el orden del spec.
  const ordered = [...flow].sort((a, b) => isDiamond(b.source) - isDiamond(a.source) || (a.order || 0) - (b.order || 0));
  for (const [id, list] of forwardOut) if (!isDiamond(id)) for (const [k, v] of ports(id, list, e => e.target)) outPort.set(k, v);
  for (const e of ordered) {
    const s = box.get(e.source), t = box.get(e.target);
    if (!s || !t) continue;
    const r1 = rank.get(e.source), r2 = rank.get(e.target), skip = [e.source, e.target];
    if (!back.has(e.id)) {
      const ex = inPort.get(e.id) ?? cxOf(t);
      if (isDiamond(e.source)) {
        const side = Math.abs(ex - cxOf(s)) < 2 ? 'S' : ex < cxOf(s) ? 'W' : 'E';
        if (side !== 'S' && takeVertex(e.source, side) && r2 === r1 + 1) {
          const vx = side === 'W' ? s.x : s.x + s.width, vy = cyOf(s);
          const beyond = side === 'W' ? ex < vx - 8 : ex > vx + 8;
          if (beyond && freeH(vy, vx, ex, skip) && freeV(ex, vy, t.y, skip)) { routes.set(e.id, [{x: vx, y: vy}, {x: ex, y: vy}, {x: ex, y: t.y}]); continue; }
          const gx = side === 'W' ? vx - 14 : vx + 14;
          routes.set(e.id, [{x: vx, y: vy}, ...descend(gx, vy, r1, ex, e.target, r2, skip)]);
          continue;
        }
        if (!takeVertex(e.source, 'S')) takeVertex(e.source, side === 'W' ? 'E' : 'W');
        routes.set(e.id, descend(cxOf(s), s.y + s.height, r1, ex, e.target, r2, skip));
        continue;
      }
      routes.set(e.id, descend(outPort.get(e.id) ?? cxOf(s), s.y + s.height, r1, ex, e.target, r2, skip));
      continue;
    }
    // Bucle: sale por un costado al pasillo de su carril, sube y entra por el costado (o por arriba).
    let side = neighbour(e.source, 'right') ? 'left' : 'right';
    if (isDiamond(e.source) && !takeVertex(e.source, side === 'right' ? 'E' : 'W')) { side = side === 'right' ? 'left' : 'right'; takeVertex(e.source, side === 'right' ? 'E' : 'W'); }
    const sx = side === 'right' ? s.x + s.width : s.x, sy = cyOf(s);
    const gx = gutterX(lane.get(e.source), side);
    const sameLane = lane.get(e.target) === lane.get(e.source);
    const enterSide = isDiamond(e.target) ? sameLane && !neighbour(e.target, side) && takeVertex(e.target, side === 'right' ? 'E' : 'W') : sideEntry(e);
    if (enterSide) {
      const tx = side === 'right' ? t.x + t.width : t.x;
      routes.set(e.id, [{x: sx, y: sy}, {x: gx, y: sy}, {x: gx, y: cyOf(t)}, {x: tx, y: cyOf(t)}]);
    } else {
      const ex = inPort.get(e.id) ?? cxOf(t), yc = channelY(r2, gx, ex);
      routes.set(e.id, [{x: sx, y: sy}, {x: gx, y: sy}, {x: gx, y: yc}, {x: ex, y: yc}, {x: ex, y: t.y}]);
    }
  }
  for (const e of scene.edges.filter(f => f.note)) {
    const s = box.get(e.source), t = box.get(e.target);
    if (s && t) routes.set(e.id, [{x: s.x + s.width, y: cyOf(s)}, {x: t.x, y: cyOf(s)}]);
  }

  // ---- salida con la forma del layout de ELK ----
  const nodes = lanes.map(l => ({id: l.id, parent: null, depth: 0, x: laneX.get(l.id), y: 0, width: laneW.get(l.id), height,
    container: true, glyph: l.glyph, lines: heads.get(l.id).lines, header: {...heads.get(l.id), x: 0, y: 0, width: laneW.get(l.id), height: headH}, outside: null}));
  for (const n of scene.nodes) {
    const b = box.get(n.id); if (!b) continue;
    const s = sizes.get(n.id), parent = n.lane || null, dx = parent ? laneX.get(parent) : 0;
    const outside = s.outside ? {x: (b.width - s.outside.width) / 2, y: b.height + 4, width: s.outside.width, height: s.outside.height, lines: s.outside.lines} : null;
    nodes.push({id: n.id, parent, depth: parent ? 1 : 0, x: b.x - dx, y: b.y, width: b.width, height: b.height, container: false,
      glyph: n.glyph, lines: s.lines || [], header: null, outside});
  }
  const edges = scene.edges.filter(e => routes.has(e.id)).map(e => ({...e, points: simplify(routes.get(e.id)),
    labelSize: e.label ? edgeLabelBox(e.label, {measure}) : null, labelBox: null}));
  const layout = {nodes, edges, width: x, height, swimlanes: true};
  placeLabels(layout);
  return layout;
}
