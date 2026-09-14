// Pure layout data for the Schema view: CLASS graph (not documents) from
// /api/schema, with three kinds of typed edges:
// - containment (`kind:'containment'`): declared `__containment__`, unchanged.
// - relation (`kind:'relation'`): a kgdb RelationTypeDoc-like document
//   declares `source_types -> target_types`; a kgdb RelationDoc-like
//   document (source_id/target_id) is an observed *instance* of one, merged
//   in by (source class, type, target class) with a count. Declared-but-
//   unseen relations keep `count:0`; observed-but-undeclared relations still
//   draw (declared:false) — a store's `RelationDoc`s are ground truth even
//   when the `RelationTypeDoc` used an abstract endpoint we can't resolve.
// - reference (`kind:'reference'`): `__references__` only carries a field
//   name with no target class, so the target is inferred from the actual
//   values documents of that class hold in that field, grouped by the
//   target document's class.
import {graphMaps, CONTAINMENT, REFERENCE_FIELDS, isRelationDocument, isRelationTypeDocument, buildAliases, resolveAlias} from '../../../source/graph.mjs';
import {classStyle} from '../../../shared/classes.mjs';

// `projection` (a ProjectionDoc, or null) never hides a class/relation here
// — Schema always shows the full design (see docs/mindmap-developer.md). It
// only marks `included`/`displayTemplate` per node and `included` per
// relation edge, for the view to dim what the projection leaves out.
// `models`/`relations` empty on the projection means "every one included",
// same semantics as source/projections.mjs applyProjection.
export function schemaGraph(models, documents=[], projection=null) {
  const maps=graphMaps(models);
  const counts={};documents.forEach(d=>{counts[d.model_name]=(counts[d.model_name]||0)+1;});
  const known=new Set((models||[]).map(m=>m.id));
  const byId=Object.fromEntries(documents.map(d=>[d.id,d]));
  const aliases=buildAliases(documents);
  const projModels=new Set(projection?.payload?.models||[]);
  const projModelsDeclared=projModels.size>0;
  const projRelations=new Set((projection?.payload?.relations||[]).map(r=>r.name));
  const projRelationsDeclared=projRelations.size>0;

  const nodes=(models||[]).map(m=>{
    const containment=maps?maps.containment[m.id]||{}:(CONTAINMENT[m.id]||{});
    const declaredRefs=maps?maps.references[m.id]:null;
    const isRef=f=>declaredRefs===null?REFERENCE_FIELDS.has(f):declaredRefs.has(f);
    const fields=(m.fields||[]).map(f=>({...f,
      contains:containment[f.name]?containment[f.name].filter(t=>known.has(t)):null,
      reference:!containment[f.name]&&isRef(f.name)}));
    return {id:m.id,model:m,fields,docCount:counts[m.id]||0,relationTypes:new Set(),
      relational:fields.filter(f=>f.contains||f.reference).length,
      included:!projection||!projModelsDeclared||projModels.has(m.id),
      displayTemplate:projection?.payload?.display?.[m.id]||null};
  });
  const nodeById=Object.fromEntries(nodes.map(n=>[n.id,n]));

  const edges=[];

  // Contención: sin cambios salvo el `kind` para que la vista distinga aristas.
  nodes.forEach(n=>n.fields.forEach(f=>(f.contains||[]).forEach(target=>
    edges.push({id:`${n.id}.${f.name}>${target}`,source:n.id,target,field:f.name,kind:'containment'}))));

  // Relaciones declaradas por un RelationTypeDoc: un tipo abstracto (no una
  // clase registrada) en un extremo simplemente no genera arista para ese par.
  const relationEdges=new Map();
  documents.forEach(doc=>{
    if(!isRelationTypeDocument(doc))return;
    const {name:type,source_types=[],target_types=[]}=doc.payload;
    source_types.forEach(S=>target_types.forEach(T=>{
      if(!known.has(S)||!known.has(T))return;
      const id=`rel:${type}:${S}>${T}`;
      const included=!projection||!projRelationsDeclared||projRelations.has(type);
      if(!relationEdges.has(id))relationEdges.set(id,{id,source:S,target:T,type,declared:true,count:0,kind:'relation',included});
    }));
  });
  // Relaciones observadas (RelationDoc): cuentan sobre la declarada si existe
  // el mismo (origen, tipo, destino); si no, la instancia misma es la prueba
  // de que la relación existe, declarada o no.
  const observed=new Map();
  documents.forEach(doc=>{
    if(!isRelationDocument(doc))return;
    const type=doc.payload.relation_type;
    if(typeof type!=='string')return;
    const sourceDoc=byId[resolveAlias(doc.payload.source_id,aliases)];
    const targetDoc=byId[resolveAlias(doc.payload.target_id,aliases)];
    if(!sourceDoc||!targetDoc)return;
    const S=sourceDoc.model_name,T=targetDoc.model_name,id=`rel:${type}:${S}>${T}`;
    const entry=observed.get(id)||{source:S,target:T,type,count:0};
    entry.count+=1;observed.set(id,entry);
  });
  observed.forEach((info,id)=>{
    const declared=relationEdges.get(id);
    if(declared)declared.count=info.count;
    else relationEdges.set(id,{id,source:info.source,target:info.target,type:info.type,declared:false,count:info.count,kind:'relation',
      included:!projection||!projRelationsDeclared||projRelations.has(info.type)});
  });
  relationEdges.forEach(e=>{
    nodeById[e.source]?.relationTypes.add(e.type);
    nodeById[e.target]?.relationTypes.add(e.type);
  });
  edges.push(...relationEdges.values());

  // Referencias inferidas: `__references__` no trae clase destino, así que se
  // deduce escaneando los valores reales de ese campo en documentos de esa
  // clase y viendo a qué clase pertenece el documento resuelto.
  nodes.forEach(n=>{
    const docsOfClass=documents.filter(d=>d.model_name===n.id);
    n.fields.forEach(f=>{
      if(!f.reference)return;
      const perTarget=new Map();
      docsOfClass.forEach(d=>{
        const raw=d.payload[f.name];
        (Array.isArray(raw)?raw:[raw]).forEach(value=>{
          const targetDoc=byId[resolveAlias(value,aliases)];
          if(!targetDoc)return;
          perTarget.set(targetDoc.model_name,(perTarget.get(targetDoc.model_name)||0)+1);
        });
      });
      if(!perTarget.size)return;
      f.inferred=[...perTarget.keys()];
      perTarget.forEach((count,T)=>edges.push({id:`ref:${n.id}.${f.name}>${T}`,source:n.id,target:T,field:f.name,count,kind:'reference'}));
    });
  });

  nodes.forEach(n=>{n.relationTypes=[...n.relationTypes];});
  return {nodes,edges};
}
// Filtro de texto sobre una card: nombre de clase, campos, tipos, destinos
// declarados/inferidos y tipos de relación en los que participa la clase.
export function schemaMatches(node,query) {
  const q=(query||'').trim().toLowerCase();
  if(!q)return true;
  const style=classStyle(node.id);
  const haystack=[node.id,style.name,node.model.model_ref||'',...(node.relationTypes||[]),
    ...node.fields.flatMap(f=>[f.name,f.kind||'',f.annotation||'',...(f.contains||[]),...(f.inferred||[])])].join(' ').toLowerCase();
  return haystack.includes(q);
}

// Distinct relation type names present in the store, from both a
// RelationTypeDoc's declaration (`name`) and a RelationDoc's own
// `relation_type` — a type instantiated with no RelationTypeDoc still shows
// up (same "instances are ground truth" rule as schemaGraph above), for the
// projection editor's relation checklist.
export function relationTypesOf(documents) {
  const names=new Set();
  (documents||[]).forEach(doc=>{
    if(isRelationTypeDocument(doc))names.add(doc.payload.name);
    if(isRelationDocument(doc)&&typeof doc.payload.relation_type==='string')names.add(doc.payload.relation_type);
  });
  return [...names].sort();
}
