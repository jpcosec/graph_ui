// Projections: pron's own concept for "what a session can name" (ProjectionDoc,
// spec 01/05) reused as-is instead of inventing a UI-only filter. Pure, DOM-free.
import {isRelationDocument, isRelationTypeDocument, buildAliases, resolveAlias} from './graph.mjs';
import {titleOf} from '../shared/documents.mjs';

// Nominal, not structural: ProjectionDoc is a real, named pron/sldb model
// (unlike kgdb's RelationDoc convention), so matching by model_name is right.
export function isProjectionDocument(doc) {
  return doc?.model_name === 'ProjectionDoc';
}
export function projectionsOf(documents) {
  return (documents || []).filter(isProjectionDocument);
}
export function findProjection(documents, name) {
  if (!name) return null;
  return projectionsOf(documents).find(d => d.payload?.name === name) || null;
}

// Entities pass when `models` is declared and lists their class; relation
// instances/types pass when `relations` is declared and names their type.
// Either list empty means "every one enters" (pron's own semantics).
export function applyProjection(documents, projection) {
  if (!projection) return documents;
  const models = new Set(projection.payload?.models || []);
  const modelsDeclared = models.size > 0;
  const relNames = new Set((projection.payload?.relations || []).map(r => r.name));
  const relationsDeclared = relNames.size > 0;
  return (documents || []).filter(doc => {
    if (isRelationDocument(doc)) return !relationsDeclared || relNames.has(doc.payload.relation_type);
    if (isRelationTypeDocument(doc)) return !relationsDeclared || relNames.has(doc.payload.name);
    return !modelsDeclared || models.has(doc.model_name);
  });
}

// `{field}` substitutes the document's own payload; `{rel.field}` follows a
// RelationDoc-convention edge of type `rel` out of this document to its
// first target and reads the target's field — mirrors pron's own
// Display.render (pron/display.py), the same templates these documents hold.
const FIELD_RE = /\{([A-Za-z_]\w*)(?:\.([A-Za-z_]\w*))?\}/g;
export function renderDisplay(template, doc, documents) {
  const aliases = buildAliases(documents || []);
  return template.replace(FIELD_RE, (_, head, sub) => {
    if (!sub) return String(doc.payload?.[head] ?? '');
    const edge = (documents || []).find(d => isRelationDocument(d)
      && d.payload.relation_type === head
      && resolveAlias(d.payload.source_id, aliases) === doc.id);
    if (!edge) return '';
    const target = (documents || []).find(d => d.id === resolveAlias(edge.payload.target_id, aliases));
    return target ? String(target.payload?.[sub] ?? '') : '';
  }).trim();
}

// A document's display name under a projection: its `display[model]`
// template if the active projection declares one, else the plain titleOf.
export function titleFor(doc, projection, documents) {
  const template = projection?.payload?.display?.[doc.model_name];
  if (!template) return titleOf(doc);
  return renderDisplay(template, doc, documents) || titleOf(doc);
}
