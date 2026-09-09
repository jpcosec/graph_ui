// Presentation adapters. Document classes and payloads remain SLDB-owned.
export const CLASSES = {
  BoardDoc: {icon:'🗂️',color:'#2563eb',name:'Board'},
  TaskDoc: {icon:'🎯',color:'#d97706',name:'Task'},
  RoutineDoc: {icon:'🔁',color:'#7c3aed',name:'Routine'},
  ChecklistDoc: {icon:'☑️',color:'#0891b2',name:'Checklist'},
  ConditionDoc: {icon:'🔎',color:'#059669',name:'Condition'},
  EdgeDoc: {icon:'🔗',color:'#e11d48',name:'Edge'},
  OperatorDoc: {icon:'⚙️',color:'#c026d3',name:'Operator'},
  AtomDoc: {icon:'⚛️',color:'#65a30d',name:'Atom'},
  PillDoc: {icon:'💊',color:'#ea580c',name:'Pill'},
  RitualDoc: {icon:'🪄',color:'#4f46e5',name:'Ritual'},
  FAQDoc: {icon:'❓',color:'#0284c7',name:'FAQ'},
  HookDoc: {icon:'🪝',color:'#be123c',name:'Hook'},
  InboxNoteDoc: {icon:'📥',color:'#a16207',name:'Inbox Note'},
  MaterializationContractDoc: {icon:'📐',color:'#475569',name:'Materialization Contract'},
  RoleDoc: {icon:'👤',color:'#0f766e',name:'Role'},
  PrimitiveDoc: {icon:'🧩',color:'#9333ea',name:'Primitive'},
  StepDoc: {icon:'👣',color:'#b45309',name:'Step'},
};
Object.assign(CLASSES, {
  DomainAtom:{icon:'🌐',color:'#2563eb',name:'Domain Atom'},
  RuleAtom:{icon:'📏',color:'#d97706',name:'Rule Atom'},
  ToolAtom:{icon:'🛠️',color:'#059669',name:'Tool Atom'},
  TraitAtom:{icon:'🧬',color:'#c026d3',name:'Trait Atom'},
  ConversationStep:{icon:'💬',color:'#0891b2',name:'Conversation Step'},
  SelfDeclaration:{icon:'🪪',color:'#7c3aed',name:'Self Declaration'},
  StyleGuide:{icon:'🎨',color:'#db2777',name:'Style Guide'},
  CapabilityBoundary:{icon:'🛡️',color:'#0f766e',name:'Capability Boundary'},
  StrategyRule:{icon:'♟️',color:'#4f46e5',name:'Strategy Rule'},
  FallbackRule:{icon:'🛟',color:'#ea580c',name:'Fallback Rule'},
  GateCriterion:{icon:'🚦',color:'#65a30d',name:'Gate Criterion'},
  AgentFraming:{icon:'🤖',color:'#9333ea',name:'Agent Framing'},
  RelationTypeDoc:{icon:'🧭',color:'#475569',name:'Relation Type'},
  RelationDoc:{icon:'🔗',color:'#e11d48',name:'Relation'},
  RepositoryDoc:{icon:'🗃️',color:'#0369a1',name:'Repository'},
  CompositionDoc:{icon:'🧱',color:'#a16207',name:'Composition'},
});
const FALLBACK_ICONS=['🔷','🔶','🟢','🟣','🔺','⭐','💠','✳️'];
const FALLBACK_COLORS=['#2563eb','#c2410c','#047857','#7c3aed','#be123c','#a16207','#0e7490','#4d7c0f'];
export function classStyle(name) {
  if(CLASSES[name])return CLASSES[name];
  let hash=2166136261;
  for(const character of name||'Documento')hash=Math.imul(hash^character.charCodeAt(0),16777619)>>>0;
  return {icon:FALLBACK_ICONS[(hash>>>8)%FALLBACK_ICONS.length],color:FALLBACK_COLORS[hash%FALLBACK_COLORS.length],name:(name||'Documento').replace(/Doc$/,'').replace(/([a-z])([A-Z])/g,'$1 $2')};
}
// Fit small maps completely; large maps open at a readable scale near their origin.
export function readingViewport(nodes,width,height) {
  if(!nodes.length||!width||!height)return {x:24,y:40,zoom:1};
  const roots=nodes.filter(n=>!n.parentId);
  const left=Math.min(...roots.map(n=>n.position.x)),top=Math.min(...roots.map(n=>n.position.y));
  const right=Math.max(...roots.map(n=>n.position.x+Number(n.style?.width||244)));
  const bottom=Math.max(...roots.map(n=>n.position.y+Number(n.style?.height||82)));
  const scale=Math.min(1,(width-64)/(right-left),(height-96)/(bottom-top));
  if(scale>=.72)return {x:(width-(right-left)*scale)/2-left*scale,y:(height-(bottom-top)*scale)/2-top*scale,zoom:scale};
  const zoom=width<500?.8:.9;
  return {x:32-left*zoom,y:48-top*zoom,zoom};
}
export const titleOf = doc => doc.payload.title || doc.payload.name || doc.id;
// These fields are containment in the registered deskops models, not arbitrary links.
export const CONTAINMENT = {
  BoardDoc:{tasks:['TaskDoc'],pills:['PillDoc'],rituals:['RitualDoc']},
  TaskDoc:{checklists:['ChecklistDoc'],pills:['PillDoc'],atoms:['AtomDoc']},
  RoutineDoc:{decomposition:['ChecklistDoc','ConditionDoc','OperatorDoc','PrimitiveDoc','StepDoc'],edges:['EdgeDoc']},
  ChecklistDoc:{condition_refs:['ConditionDoc']},
  RitualDoc:{steps:['StepDoc']},
};
export const REFERENCE_FIELDS = new Set(['routine','current_node','entrypoint','source','target','condition_ref','condition_refs','allowed_transitions','decomposition','edges','tasks','pills','steps','depends_on','references','conditions','operators','checklists','grounding_atoms','atoms','rituals','terminal_nodes']);
export function relationships(documents) {
  const aliases = new Map();
  documents.forEach(d=>[d.id,d.path,d.payload.id,d.path?.split('/').pop()?.replace(/\.md$/,'')].filter(Boolean).forEach(a=>aliases.set(a,d.id)));
  const result=[];
  documents.forEach(d=>Object.entries(d.payload).forEach(([field,raw])=>{
    if(!REFERENCE_FIELDS.has(field))return;
    (Array.isArray(raw)?raw:[raw]).forEach(value=>{
      if(typeof value!=='string')return;
      const target=aliases.get(value)||aliases.get(value.split('/').pop()?.replace(/\.md$/,''));
      if(target&&target!==d.id)result.push({source:d.id,target,field,contains:Boolean(CONTAINMENT[d.model_name]?.[field])});
    });
  }));
  return result;
}
export function hierarchy(documents) {
  const links=relationships(documents),parents={},byId=Object.fromEntries(documents.map(d=>[d.id,d]));
  const priority={BoardDoc:0,RoutineDoc:1,TaskDoc:2,ChecklistDoc:3};
  links.filter(e=>e.contains).sort((a,b)=>(priority[byId[a.source].model_name]??4)-(priority[byId[b.source].model_name]??4)).forEach(e=>{
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
  const fields=new Set(models.find(m=>m.id===parent.model_name)?.fields.map(f=>f.name)||[]);
  return Object.entries(CONTAINMENT[parent.model_name]||{}).flatMap(([field,types])=>fields.has(field)?types.filter(t=>available.has(t)).map(model=>({field,model})):[]);
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
export function changesBetween(baseline,documents) {
  const old=new Map(baseline.map(d=>[d.id,d])),current=new Map(documents.map(d=>[d.id,d]));
  const result=[];
  documents.forEach(d=>{const before=old.get(d.id);if(!before)result.push({action:'create',id:d.id,model:d.model_name,payload:d.payload});else if(JSON.stringify(before.payload)!==JSON.stringify(d.payload))result.push({action:'update',id:d.id,model:d.model_name,payload:d.payload,expected:before.payload});});
  baseline.forEach(d=>{if(!current.has(d.id))result.push({action:'delete',id:d.id,expected:d.payload});});
  return result;
}
export function project(documents, view={}) {
  const {parents,links}=hierarchy(documents),byId=Object.fromEntries(documents.map(d=>[d.id,d])),children={};
  documents.forEach(d=>{children[d.id]=[];});
  Object.entries(parents).forEach(([id,e])=>children[e.source].push(id));
  const boxes={},nodes=[],collapsed=new Set(view.collapsed||[]);
  function measure(id) {
    const nested=collapsed.has(id)?[]:children[id];
    if(!nested.length)return boxes[id]={width:244,height:82};
    nested.forEach(measure);
    const cols=Math.min(3,nested.length),rows=Math.ceil(nested.length/cols);
    const widths=Array(cols).fill(0),heights=Array(rows).fill(0);
    nested.forEach((child,i)=>{widths[i%cols]=Math.max(widths[i%cols],boxes[child].width);heights[Math.floor(i/cols)]=Math.max(heights[Math.floor(i/cols)],boxes[child].height);});
    return boxes[id]={width:widths.reduce((a,b)=>a+b,0)+(cols-1)*24+40,height:heights.reduce((a,b)=>a+b,0)+(rows-1)*24+88,widths,heights,cols};
  }
  function place(id,position,parentId) {
    const box=boxes[id],doc=byId[id],saved=view.positions?.[id];
    const safeSaved=saved&&saved.parentId===(parentId||null)&&Number.isFinite(saved.x)&&Number.isFinite(saved.y);
    // Child drags are constrained to their container; retain them only if they fit.
    const fits=!parentId||(saved?.x>=0&&saved?.y>=60&&saved.x+box.width<=boxes[parentId].width&&saved.y+box.height<=boxes[parentId].height);
    nodes.push({id,type:'document',position:safeSaved&&fits?{x:saved.x,y:saved.y}:position,...(parentId?{parentId,extent:'parent'}:{}),style:{width:box.width,height:box.height},data:{doc,group:Boolean(box.cols),count:children[id].length,collapsed:collapsed.has(id)}});
    if(!box.cols)return;
    children[id].forEach((child,i)=>{const c=i%box.cols,r=Math.floor(i/box.cols);place(child,{x:20+box.widths.slice(0,c).reduce((a,b)=>a+b,0)+c*24,y:68+box.heights.slice(0,r).reduce((a,b)=>a+b,0)+r*24},id);});
  }
  const roots=documents.filter(d=>!parents[d.id]);roots.forEach(d=>measure(d.id));
  // Large containers occupy their own row; loose documents use a compact grid.
  const area=roots.reduce((sum,d)=>sum+(boxes[d.id].width+32)*(boxes[d.id].height+40),0);
  const targetWidth=Math.max(1100,Math.sqrt(area*1.55),...roots.map(d=>boxes[d.id].width));
  let x=0,y=0,rowHeight=0;
  roots.sort((a,b)=>boxes[b.id].height-boxes[a.id].height).forEach(d=>{const box=boxes[d.id];if(x&&x+box.width>targetWidth){x=0;y+=rowHeight+40;rowHeight=0;}place(d.id,{x,y});x+=box.width+32;rowHeight=Math.max(rowHeight,box.height);});
  const visible=new Set(nodes.map(n=>n.id));
  const edges=links.filter(e=>visible.has(e.source)&&visible.has(e.target)&&(!e.contains||parents[e.target]?.source!==e.source)).map((e,i)=>({id:'ref-'+i,source:e.source,target:e.target,type:'smoothstep',label:e.field,style:{stroke:'#94a3b8',strokeWidth:1.5},labelStyle:{fontSize:10,fill:'#64748b'},data:e}));
  return {nodes,edges,parents,children};
}
