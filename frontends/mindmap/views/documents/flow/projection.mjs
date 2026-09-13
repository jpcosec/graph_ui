// Pure layout data for the Flujo view: a directed graph over DOCUMENTS (not
// classes, unlike views/models/diagram/projection.mjs), generic over any
// store/class. Unlike the KB map's projection.mjs (views/documents/map/), it
// never nests containment as parent/child groups: every relationship — the
// same ones source/graph.mjs already computes for the map's optional
// "Referencias" edges and the map's nested groups — becomes a drawn edge
// here, containment and reference alike, so the flow reads as one directed
// graph instead of a tree with a side channel.
//
// kgdb's RelationDoc convention (a document that IS an edge: payload has
// source_id/target_id, see source/graph.mjs isRelationDocument) collapses by
// default into a single labeled edge between its two endpoints instead of a
// third node floating between them — it is the relation, not a participant.
// `relationsAsNodes` (the `.flow-relations-as-nodes` checkbox) opts back into
// the old, literal reading: the RelationDoc drawn as its own small node, with
// its source_id/target_id resolving to two ordinary reference edges (they are
// already in REFERENCE_FIELDS) since it is a document like any other then.
import {graphMaps, relationships, isRelationDocument, localIdOf} from '../../../source/graph.mjs';
import {classStyle} from '../../../shared/classes.mjs';
import {titleOf} from '../../../shared/documents.mjs';

export function flowGraph(documents, models, {relationsAsNodes = false} = {}) {
  const docs = documents || [];
  const maps = graphMaps(models);
  const relationDocs = relationsAsNodes ? [] : docs.filter(isRelationDocument);
  const relationIds = new Set(relationDocs.map(d => d.id));
  const nodeDocs = docs.filter(d => !relationIds.has(d.id));
  const nodes = nodeDocs.map(doc => ({id: doc.id, doc}));
  const nodeIds = new Set(nodes.map(n => n.id));

  const edges = relationships(nodeDocs, maps).map(r => ({
    id: `${r.source}.${r.field}>${r.target}`,
    source: r.source, target: r.target, field: r.field, contains: r.contains,
  }));

  if (relationDocs.length) {
    // Same alias convention as source/graph.mjs relationships(): exact id,
    // path, path basename or export-id local segment (Model:doc / Store:Model:doc).
    const aliases = new Map();
    docs.forEach(d => [d.id, d.path, d.payload.id, d.path?.split('/').pop()?.replace(/\.md$/, '')]
      .filter(Boolean).forEach(a => aliases.set(a, d.id)));
    const resolve = value => {
      if (typeof value !== 'string') return null;
      const resolved = aliases.get(value) || aliases.get(value.split('/').pop()?.replace(/\.md$/, '')) || aliases.get(localIdOf(value));
      return resolved && nodeIds.has(resolved) ? resolved : null;
    };
    relationDocs.forEach(doc => {
      const source = resolve(doc.payload.source_id), target = resolve(doc.payload.target_id);
      if (!source || !target) return; // both endpoints must exist among the drawn nodes
      edges.push({id: `${source}.rel:${doc.id}>${target}`, source, target,
        field: doc.payload.relation_type || doc.model_name, contains: false, relationDoc: doc.id});
    });
  }

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
