// Pure layout data for the Schema view: CLASS graph (not documents) from
// /api/schema. The only edges are declared containment (`__containment__`:
// field -> target classes); `__references__` only carries field names with no
// target class, so they are annotated on the card, never turned into an edge.
import {graphMaps, CONTAINMENT, REFERENCE_FIELDS} from '../../../source/graph.mjs';
import {classStyle} from '../../../shared/classes.mjs';

export function schemaGraph(models, documents=[]) {
  const maps=graphMaps(models);
  const counts={};documents.forEach(d=>{counts[d.model_name]=(counts[d.model_name]||0)+1;});
  const known=new Set((models||[]).map(m=>m.id));
  const nodes=(models||[]).map(m=>{
    const containment=maps?maps.containment[m.id]||{}:(CONTAINMENT[m.id]||{});
    const declaredRefs=maps?maps.references[m.id]:null;
    const isRef=f=>declaredRefs===null?REFERENCE_FIELDS.has(f):declaredRefs.has(f);
    const fields=(m.fields||[]).map(f=>({...f,
      contains:containment[f.name]?containment[f.name].filter(t=>known.has(t)):null,
      reference:!containment[f.name]&&isRef(f.name)}));
    return {id:m.id,model:m,fields,docCount:counts[m.id]||0,
      relational:fields.filter(f=>f.contains||f.reference).length};
  });
  const edges=[];
  nodes.forEach(n=>n.fields.forEach(f=>(f.contains||[]).forEach(target=>
    edges.push({id:`${n.id}.${f.name}>${target}`,source:n.id,target,field:f.name}))));
  return {nodes,edges};
}
// Filtro de texto sobre una card: nombre de clase, campos, tipos y destinos.
export function schemaMatches(node,query) {
  const q=(query||'').trim().toLowerCase();
  if(!q)return true;
  const style=classStyle(node.id);
  const haystack=[node.id,style.name,node.model.model_ref||'',
    ...node.fields.flatMap(f=>[f.name,f.kind||'',f.annotation||'',...(f.contains||[])])].join(' ').toLowerCase();
  return haystack.includes(q);
}
