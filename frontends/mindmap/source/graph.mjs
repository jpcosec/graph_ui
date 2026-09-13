// Document-graph logic: containment/reference metadata declared by the SLDB
// schema (with a legacy per-model fallback), relationships, hierarchy and the
// document mutations that keep the graph consistent (append/remove). Pure,
// DOM-free.

// Legacy fallback for stores whose models do not declare graph metadata yet;
// the primary source is the schema exposed by the adapter.
export const CONTAINMENT = {
  BoardDoc:{tasks:['TaskDoc'],pills:['PillDoc'],rituals:['RitualDoc']},
  TaskDoc:{checklists:['ChecklistDoc'],pills:['PillDoc'],atoms:['AtomDoc']},
  RoutineDoc:{decomposition:['ChecklistDoc','ConditionDoc','OperatorDoc','PrimitiveDoc','StepDoc'],edges:['EdgeDoc']},
  ChecklistDoc:{condition_refs:['ConditionDoc']},
  RitualDoc:{steps:['StepDoc']},
};
export const REFERENCE_FIELDS = new Set(['routine','current_node','entrypoint','source','target','condition_ref','condition_refs','allowed_transitions','decomposition','edges','tasks','pills','steps','depends_on','references','conditions','operators','checklists','grounding_atoms','atoms','rituals','terminal_nodes']);
// Grafo declarativo desde el schema SLDB: model -> {field -> [targets]} (contención)
// y model -> Set(fields) (referencias). Es la única fuente cuando el schema
// declara metadatos; si no, se cae al legacy.
export function graphMaps(models) {
  const containment={},references={};
  let declared=false;
  for(const m of models||[]) {
    // Fallback POR MODELO: un modelo que no declara metadatos usa las tablas
    // legacy de su clase; así un store mixto no pierde contención.
    const modelDeclared=(m.containment&&Object.keys(m.containment).length)||(m.references&&m.references.length);
    if(modelDeclared) {
      declared=true;
      containment[m.id]=m.containment||{};
      references[m.id]=new Set(m.references||[]);
    } else {
      containment[m.id]=CONTAINMENT[m.id]||{};
      references[m.id]=null; // null = usar el conjunto legacy global de campos
    }
  }
  if(!declared)return null;
  return {containment,references};
}
export function containmentOf(doc,maps) {
  if(!maps)return CONTAINMENT[doc.model_name];
  return maps.containment[doc.model_name];
}
export function isReferenceField(modelName,field,maps) {
  if(!maps)return REFERENCE_FIELDS.has(field);
  const declared=maps.references[modelName];
  if(declared===null)return REFERENCE_FIELDS.has(field);
  return declared.has(field)||Boolean(maps.containment[modelName]?.[field]);
}
export function relationships(documents,maps) {
  const aliases = new Map();
  documents.forEach(d=>[d.id,d.path,d.payload.id,d.path?.split('/').pop()?.replace(/\.md$/,'')].filter(Boolean).forEach(a=>aliases.set(a,d.id)));
  const result=[];
  documents.forEach(d=>Object.entries(d.payload).forEach(([field,raw])=>{
    if(!isReferenceField(d.model_name,field,maps))return;
    (Array.isArray(raw)?raw:[raw]).forEach(value=>{
      if(typeof value!=='string')return;
      const target=aliases.get(value)||aliases.get(value.split('/').pop()?.replace(/\.md$/,''));
      const containsField=Boolean(containmentOf(d,maps)?.[field]);
      if(target&&target!==d.id)result.push({source:d.id,target,field,contains:containsField});
    });
  }));
  return result;
}
export function hierarchy(documents,maps) {
  const links=relationships(documents,maps),parents={},byId=Object.fromEntries(documents.map(d=>[d.id,d]));
  const priority={BoardDoc:0,RoutineDoc:1,TaskDoc:2,ChecklistDoc:3};
  const isContainment=e=>Boolean(containmentOf(byId[e.source],maps)?.[e.field]);
  links.filter(isContainment).sort((a,b)=>(priority[byId[a.source].model_name]??4)-(priority[byId[b.source].model_name]??4)).forEach(e=>{
    if(parents[e.target])return;
    let current=e.source;
    while(current&&current!==e.target)current=parents[current]?.source;
    if(current===e.target)return;
    parents[e.target]=e;
  });
  return {parents,links};
}
export function childOptions(parent, models) {
  const available=new Set(models.map(m=>m.id));
  const byId=Object.fromEntries(models.map(m=>[m.id,m]));
  const fields=new Set(byId[parent.model_name]?.fields.map(f=>f.name)||[]);
  const declared=byId[parent.model_name]?.containment;
  // {} vacío es truthy en JS: solo cuenta declaraciones con contenido.
  const table=declared&&Object.keys(declared).length?Object.entries(declared):Object.entries(CONTAINMENT[parent.model_name]||{});
  return table.flatMap(([field,types])=>fields.has(field)?types.filter(t=>available.has(t)).map(model=>({field,model})):[]);
}
export function appendChild(documents,parentId,child,field) {
  return [...documents.map(d=>d.id===parentId?{...d,payload:{...d.payload,[field]:[...new Set([...(d.payload[field]||[]),child.id])]}}:d),child];
}
export function removeDocument(documents,id) {
  const removed=documents.find(d=>d.id===id),aliases=new Set([id,removed?.path,removed?.payload.id].filter(Boolean));
  const matchesRemoved=v=>typeof v==='string'&&(aliases.has(v)||v.split('/').pop()?.replace(/\.md$/,'')===id);
  const removedIds=new Set([id]);
  documents.filter(d=>d.model_name==='EdgeDoc'&&(matchesRemoved(d.payload.source)||matchesRemoved(d.payload.target))).forEach(d=>{
    removedIds.add(d.id);[d.id,d.path,d.payload.id].filter(Boolean).forEach(a=>aliases.add(a));
  });
  // Remove dangling references, but retain child documents when removing a container.
  return documents.filter(d=>!removedIds.has(d.id)).map(d=>({...d,payload:Object.fromEntries(Object.entries(d.payload).map(([key,value])=>{
    if(!REFERENCE_FIELDS.has(key))return [key,value];
    const matches=v=>typeof v==='string'&&(aliases.has(v)||v.split('/').pop()?.replace(/\.md$/,'')===id);
    return [key,Array.isArray(value)?value.filter(v=>!matches(v)):matches(value)?'':value];
  }))}));
}
