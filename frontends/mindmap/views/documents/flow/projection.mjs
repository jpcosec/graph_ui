// Pure layout data for the Flujo view: a directed graph over DOCUMENTS (not
// classes, unlike views/models/diagram/projection.mjs), generic over any
// store/class. Unlike the KB map's projection.mjs (views/documents/map/), it
// never nests containment as parent/child groups: every relationship — the
// same ones source/graph.mjs already computes for the map's optional
// "Referencias" edges and the map's nested groups — becomes a drawn edge
// here, containment and reference alike, so the flow reads as one directed
// graph instead of a tree with a side channel.
import {graphMaps, relationships} from '../../../source/graph.mjs';
import {classStyle} from '../../../shared/classes.mjs';
import {titleOf} from '../../../shared/documents.mjs';

export function flowGraph(documents, models) {
  const maps = graphMaps(models);
  const nodes = (documents || []).map(doc => ({id: doc.id, doc}));
  const edges = relationships(documents || [], maps).map(r => ({
    id: `${r.source}.${r.field}>${r.target}`,
    source: r.source, target: r.target, field: r.field, contains: r.contains,
  }));
  return {nodes, edges};
}

// Text filter over a flow node: title, id, class id and class label all match.
export function flowMatches(node, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  if (!node) return false;
  const style = classStyle(node.doc.model_name);
  const haystack = [node.id, titleOf(node.doc), node.doc.model_name, style.name].join(' ').toLowerCase();
  return haystack.includes(q);
}

// Classes actually present among the given nodes, for the `.flow-class`
// <select> — not every model registered in the schema, only the ones with
// at least one document in this graph.
export function flowClasses(nodes) {
  return [...new Set((nodes || []).map(n => n.doc.model_name))].sort();
}
