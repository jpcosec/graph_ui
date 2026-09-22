// Proyección del IR de sldb serve hacia la ficha del documento (vuelta 5).
// Pura, sin DOM. El IR ES el parse oficial del markdown (lo construye sldb
// con `build_document_ir_json`, el mismo de `sldb sections show`): el cliente
// NO parsea markdown. Se usa exactamente lo que el IR trae:
//   structure -> secciones reales del documento (árbol, span cuando existe)
//   nodes     -> campos planos con field_path + value; span solo si no es null
// No se inventa agrupación que el IR no provea: los campos se listan en el
// bloque «Campos», no se cuelgan de secciones por adivinanza (en el shape
// observado los fields traen owning_section null).
export const irSections = ir => Array.isArray(ir?.structure) ? ir.structure : [];
export const irFields = (ir, payload) => (Array.isArray(ir?.nodes) ? ir.nodes : [])
  .filter(n => n?.kind === 'field')
  .map(n => ({
    field_path: n.field_path ?? n.name,
    value: n.value ?? payload?.[n.field_path] ?? null,
    span: irSpanOf(n.span),
  }));
// Span solo cuando el IR trae líneas reales (los fields de front-matter
// traen line_start/line_end null: viven en el YAML, no en el cuerpo).
export const irSpanOf = span => (span && (span.line_start != null || span.line_end != null))
  ? {line_start: span.line_start, line_end: span.line_end}
  : null;
export const irSectionsWithCleanMeta = ir => irSections(ir).map(s => ({
  kind: s.kind ?? 'section', name: s.name ?? '', title: s.title ?? s.name ?? '',
  span: irSpanOf(s.span), children: Array.isArray(s.children) ? s.children : [],
}));
export const irMeta = (ir, doc) => ({
  model_name: doc.model_name ?? ir?.context?.semantic?.model ?? null,
  path: ir?.context?.physical?.path ?? doc.path ?? null,
});
// Campos de referencia/contención (ids de otros documentos) desde el IR, para
// inspectores de relación (el inspector de la vista Flujo): mismo field_path y
// value que la ficha (irFields), filtrados a los campos que el descriptor
// declara como referencias. refs es un Set de nombres de campo.
export const irRefFields = (ir, payload, refs) =>
  irFields(ir, payload).filter(f => refs?.has(f.field_path));