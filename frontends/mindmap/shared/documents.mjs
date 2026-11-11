// Presentation adapters over SLDB documents/payloads. Pure, DOM-free: the
// class remains SLDB-owned (see shared/classes.mjs for icon/name/slot).
export const titleOf = doc => doc.payload.title || doc.payload.name || doc.id;
export const slugify = value => String(value||'nuevo-documento').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100)||'nuevo-documento';
// Valid defaults from the schema (adapter exposes the model's real defaults).
export function defaultsFor(model) {
  return Object.fromEntries((model?.fields||[]).map(f=>[f.name,
    f.name==='id'?quickId(model,slugify('nuevo-documento')+'-'+Math.random().toString(36).slice(2,6)):
    f.default!==undefined?f.default:
    f.kind==='enum'?(f.enum&&f.enum.length?f.enum[0]:''):
    ['stringlist','list','enumlist'].includes(f.kind)?[]:
    f.kind==='boolean'?false:
    f.kind==='object'?{}:'']));
}
// Payload for a quick capture: real title plus schema defaults for the rest.
export function quickPayload(model,title,rawId) {
  const fields=model?.fields||[];
  const payload={...defaultsFor(model)};
  const titleField=fields.some(f=>f.name==='name')&&!fields.some(f=>f.name==='title')?'name':'title';
  payload[titleField]=String(title||'').trim()||'Sin título';
  payload.id=rawId||quickId(model,slugify(payload[titleField]));
  return payload;
}
// Id for a captured document. The adapter publishes id_prefix when the model only
// accepts ids like `atom-<slug>` (its real validator decided it, not graph_ui).
export function quickId(model,slug) {
  const prefix=model?.id_prefix||'';
  return prefix&&!slug.startsWith(prefix)?prefix+slug:slug;
}
// Auto-id of a document created from the document dialog: `mm-<seed>` with the
// model's id_prefix, as quickId does for captures (AtomDoc only accepts atom-<slug>).
export function newDocumentId(model,seed) {
  return quickId(model,'mm-'+seed);
}
// The server marks models whose title-only payload fails SLDB's round-trip
// (patterns, non-empty validators the schema does not expose). A descriptor
// without the flag (remote backend) is assumed capturable.
export function quickCapturable(model) {
  return Boolean(model)&&model.quick_capture!==false;
}
// Reference search for the document modal: matches title, id and alias.
export function searchDocuments(documents,query,limit=10) {
  const needle=String(query||'').trim().toLowerCase();
  if(!needle)return documents.slice(0,limit).map(d=>({id:d.id,title:titleOf(d),model_name:d.model_name}));
  return documents.filter(d=>[titleOf(d),d.id,d.path||''].join(' ').toLowerCase().includes(needle))
    .slice(0,limit).map(d=>({id:d.id,title:titleOf(d),model_name:d.model_name}));
}
// Which fields of a schema descriptor are document references (single or list).
export function referenceFieldsOf(descriptor) {
  if(!descriptor)return new Set();
  const containment=Object.keys(descriptor.containment||{});
  return new Set([...(descriptor.references||[]),...containment]);
}
// Human label for a field name, shared by the document dialogs and any
// other view that needs it.
export const labelFor=field=>({title:'Título',name:'Nombre',body:'Contenido',status:'Estado',goal:'Objetivo',scope:'Alcance',purpose:'Propósito',implementation_path:'Ruta de implementación',done_when:'Criterio de término',entrypoint:'Nodo de entrada',source:'Origen',target:'Destino',subject:'Sujeto',predicate:'Condición',answer:'Respuesta',summary:'Resumen'}[field]||field.replaceAll('_',' '));
export const isList=field=>['stringlist','enumlist','list'].includes(field.kind);
