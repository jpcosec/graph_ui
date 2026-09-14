import {test} from 'node:test';
import assert from 'node:assert/strict';
import {brainstormToSource,brainstormIssues} from '../frontends/mindmap/source/draft.mjs';
import {appendChild,removeDocument,hierarchy,relationships,graphMaps,localIdOf,isRelationDocument} from '../frontends/mindmap/source/graph.mjs';
import {changesBetween,conflictsBetween} from '../frontends/mindmap/source/batch.mjs';
import {defaultsFor,quickPayload,searchDocuments,referenceFieldsOf} from '../frontends/mindmap/shared/documents.mjs';
import {project} from '../frontends/mindmap/views/documents/map/projection.mjs';
import * as history from '../frontends/mindmap/source/history.mjs';
const board={id:'board',model_name:'BoardDoc',payload:{title:'Board',tasks:[]}};
const child={id:'task',model_name:'TaskDoc',path:'desk/tasks/task.md',payload:{title:'Task'}};

test('children are real references; collapsed containers hide and restore them',()=>{
  const docs=appendChild([board],'board',child,'tasks');
  const full=project(docs);
  assert.equal(full.parents.task.source,'board');
  assert.equal(full.nodes.find(n=>n.id==='task').parentId,'board');
  assert.equal(project(docs,{collapsed:['board']}).nodes.length,1);
  assert.equal(project(docs).nodes.length,2);
  assert.deepEqual(changesBetween([board],docs).map(c=>c.action),['update','create']);
});

test('path references resolve and containment cycles cannot trap layout',()=>{
  const docs=[{...board,payload:{tasks:['desk/tasks/task.md']}},child];
  assert.equal(hierarchy(docs).parents.task.source,'board');
  const routines=[{id:'a',model_name:'RoutineDoc',payload:{decomposition:['b']}},{id:'b',model_name:'RoutineDoc',payload:{decomposition:['a']}}];
  assert.equal(project(routines).nodes.length,2);
});

test('removing a document also removes its edge documents and stale references',()=>{
  const docs=[{...board,payload:{tasks:['task']}},child,{id:'edge',model_name:'EdgeDoc',payload:{source:'task',target:'other'}},{id:'routine',model_name:'RoutineDoc',payload:{edges:['edge']}}];
  const result=removeDocument(docs,'task');
  assert(!result.some(d=>['task','edge'].includes(d.id)));
  assert.deepEqual(result.find(d=>d.id==='board').payload.tasks,[]);
  assert.deepEqual(result.find(d=>d.id==='routine').payload.edges,[]);
});

test('removing a container retains its independent child documents',()=>{
  assert.deepEqual(removeDocument(appendChild([board],'board',child,'tasks'),'board'),[child]);
});

test('defaultsFor uses the schema real defaults for quick captures',()=>{
  const model={id:'TaskDoc',fields:[
    {name:'id',kind:'string',required:true},
    {name:'title',kind:'string',required:true},
    {name:'status',kind:'enum',required:false,default:'open',enum:['open','done']},
    {name:'tasks',kind:'stringlist',required:false},
    {name:'done',kind:'boolean',required:false},
  ]};
  const defaults=defaultsFor(model);
  assert.equal(defaults.status,'open');
  assert.deepEqual(defaults.tasks,[]);
  assert.equal(defaults.done,false);
  assert.ok(!defaults.title);
});

test('quickPayload builds a complete payload from just a title',()=>{
  const model={id:'TaskDoc',fields:[
    {name:'id',kind:'string',required:true},
    {name:'title',kind:'string',required:true},
    {name:'status',kind:'enum',required:false,default:'open'},
    {name:'checklists',kind:'stringlist',required:false},
  ]};
  const payload=quickPayload(model,'Onboarding rápido');
  assert.equal(payload.title,'Onboarding rápido');
  assert.equal(payload.id,'onboarding-rapido');
  assert.equal(payload.status,'open');
  assert.deepEqual(payload.checklists,[]);
  assert.equal(quickPayload(model,'').title,'Sin título');
  assert.equal(quickPayload(model,'Same Title').id,quickPayload(model,'Same Title').id);
  assert.equal(quickPayload(model,'Custom','manual-id').id,'manual-id');
});

test('reference edges are labeled and dashed to differ from containment groups',()=>{
  const board={id:'board',model_name:'BoardDoc',payload:{title:'B',tasks:['t1'],rituals:['r1']}};
  const task={id:'t1',model_name:'TaskDoc',payload:{title:'T1',routine:'r1'}};
  const ritual={id:'r1',model_name:'RitualDoc',payload:{title:'R'}};
  const {nodes,edges,parents}=project([board,task,ritual]);
  assert.equal(parents.t1.source,'board');
  assert.equal(parents.r1.source,'board');
  const ref=edges.find(e=>e.source==='t1'&&e.target==='r1');
  assert.ok(ref,'la referencia horizontal debe dibujarse como arista');
  assert.equal(ref.label,'routine');
  assert.equal(ref.style.strokeDasharray,'5 4');
  assert.equal(ref.markerEnd.type,'arrowclosed');
  // La contención no dibuja líneas: es el grupo anidado.
  assert(!edges.some(e=>e.source==='board'&&e.target==='t1'));
  assert(nodes.find(n=>n.id==='t1').parentId==='board');
});

test('graph metadata comes from the schema, not hardcoded lists',()=>{
  const board={id:'board',model_name:'BoardDoc',payload:{title:'B',tasks:['t1'],rituals:['r1']}};
  const task={id:'t1',model_name:'TaskDoc',payload:{title:'T1',routine:'r1'}};
  const ritual={id:'r1',model_name:'RitualDoc',payload:{title:'R'}};
  const schema=[
    {id:'BoardDoc',fields:[{name:'tasks',kind:'stringlist'}],containment:{tasks:['TaskDoc'],rituals:['RitualDoc']},references:[]},
    {id:'TaskDoc',fields:[{name:'routine',kind:'string'}],containment:{},references:['routine']},
    {id:'RitualDoc',fields:[],containment:{},references:[]},
  ];
  const maps=graphMaps(schema);
  assert.ok(maps,'el schema declara metadatos');
  const {nodes,edges,parents}=project([board,task,ritual],{},maps);
  assert.equal(parents.t1.source,'board');
  assert.equal(parents.r1.source,'board');
  assert(!edges.some(e=>e.source==='board'&&e.target==='t1'));
  const ref=edges.find(e=>e.source==='t1'&&e.target==='r1');
  assert.ok(ref&&ref.label==='routine');
  // Sin metadatos declarados, graphMaps devuelve null y cae al legacy.
  assert.equal(graphMaps([{id:'X'}]),null);
});

test('mixed stores keep per-model legacy fallback',()=>{
  const board={id:'board',model_name:'BoardDoc',payload:{title:'B',tasks:['t1']}};
  const task={id:'t1',model_name:'LegacyDoc',payload:{title:'T',references:['r1']}};
  const other={id:'r1',model_name:'OtherDoc',payload:{title:'R'}};
  // Store mixto: LegacyDoc no declara metadatos; BoardDoc sí.
  const schema=[
    {id:'BoardDoc',fields:[{name:'tasks',kind:'stringlist'}],containment:{tasks:['LegacyDoc']},references:[]},
    {id:'LegacyDoc',fields:[{name:'references',kind:'stringlist'}]},
    {id:'OtherDoc',fields:[]},
  ];
  const maps=graphMaps(schema);
  assert.ok(maps,'al menos un modelo declara metadatos');
  const {parents,}=hierarchy([board,task,other],maps);
  assert.equal(parents.t1.source,'board');            // contención declarada
  const links=relationships([task,other],maps);
  assert.ok(links.some(l=>l.source==='t1'&&l.target==='r1'&&l.field==='references')); // legacy global por campo
  // Sin declaración de ningún modelo: null y fallback completo.
  assert.equal(graphMaps([{id:'XDoc',fields:[]}]),null);
});

test('localIdOf strips an export-id prefix (kgdb/pron Model:doc, Store:Model:doc convention)',()=>{
  assert.equal(localIdOf('SurfaceDoc:x'),'x');
  assert.equal(localIdOf('A:SurfaceDoc:x'),'x');
  assert.equal(localIdOf('x'),'x');
});

test('isRelationDocument: a document IS an edge when its payload has string source_id/target_id',()=>{
  assert.ok(isRelationDocument({payload:{source_id:'A:a',target_id:'B:b'}}));
  assert.ok(!isRelationDocument({payload:{source:'a',target:'b'}}),'EdgeDoc source/target no cuenta: la regla es estructural, no por nombre de campo');
  assert.ok(!isRelationDocument({payload:{source_id:'a'}}),'falta target_id');
  assert.ok(!isRelationDocument({payload:{}}));
  assert.ok(!isRelationDocument(null));
});

test('relationships() resolves kgdb export ids (Model:doc) to the plain document id in legacy mode',()=>{
  const surface={id:'surface-a',model_name:'SurfaceDoc',payload:{title:'Surface A'}};
  const relation={id:'rel-1',model_name:'RelationDoc',payload:{title:'implements--SurfaceDoc:surface-a--SpecDoc:spec-1',source_id:'SurfaceDoc:surface-a',target_id:'SpecDoc:spec-1',relation_type:'implements'}};
  const links=relationships([surface,relation]);
  assert.ok(links.some(l=>l.source==='rel-1'&&l.target==='surface-a'&&l.field==='source_id'),'source_id con prefijo de export id debe resolver al documento local');
});

test('searchDocuments matches title, id and path; referenceFieldsOf merges references and containment',()=>{
  const docs=[
    {id:'task-onboarding',model_name:'TaskDoc',path:'desk/t/task-onboarding.md',payload:{title:'Onboarding'}},
    {id:'task-review',model_name:'TaskDoc',payload:{title:'Review plan'}},
  ];
  assert.deepEqual(searchDocuments(docs,'onboard').map(r=>r.id),['task-onboarding']);
  assert.deepEqual(searchDocuments(docs,'review plan').map(r=>r.id),['task-review']);
  assert.deepEqual(searchDocuments(docs,'task-').map(r=>r.id),['task-onboarding','task-review']);
  assert.deepEqual(searchDocuments(docs,'').map(r=>r.id),docs.map(d=>d.id));
  const descriptor={references:['blocks'],containment:{tasks:['TaskDoc']},fields:[]};
  assert.deepEqual([...referenceFieldsOf(descriptor)].sort(),['blocks','tasks']);
  assert.equal(referenceFieldsOf(null).size,0);
});

test('brainstormToSource builds a contract-v1 spec with containment on the parent payload',()=>{
  
  const models=[
    {id:'BoardDoc',model_ref:'x.models:BoardDoc',fields:[{name:'id',kind:'string'},{name:'title',kind:'string',default:''},{name:'tasks',kind:'stringlist'}],containment:{tasks:['TaskDoc']}},
    {id:'TaskDoc',model_ref:'x.models:TaskDoc',fields:[{name:'id',kind:'string'},{name:'title',kind:'string'},{name:'status',kind:'enum',enum:['open']}]}];
  const ideas=[
    {id:'a',parentId:null,title:'Main board',className:'BoardDoc'},
    {id:'b',parentId:'a',title:'First task',className:'TaskDoc'},
    {id:'c',parentId:null,title:'   ',className:null},
    {id:'d',parentId:null,title:'Ghost',className:'GhostDoc'}];
  const {source,docIds}=brainstormToSource(ideas,models);
  assert.equal(source.version,1);
  assert.deepEqual(source.models,[{name:'BoardDoc',ref:'x.models:BoardDoc'},{name:'TaskDoc',ref:'x.models:TaskDoc'}]);
  const board=source.documents.find(d=>d.id==='main-board');
  assert.equal(board.payload.tasks.includes('first-task'),true,'la contención va en el payload del padre');
  assert.deepEqual(docIds,{a:'main-board',b:'first-task'});
  assert.equal(source.view,undefined,'Brainstorm no debe reemplazar el layout de la KB');
  // Las ideas inválidas se reportan y no entran al spec.
  const issues=brainstormIssues(ideas,models);
  assert.deepEqual(issues.map(i=>i.id).sort(),['c','d']);
  assert.ok(!source.documents.some(d=>d.id==='ghost'));
});

test('brainstormToSource gives collisions unique IDs without replacing existing documents',()=>{
  const models=[{id:'NoteDoc',model_ref:'x.models:NoteDoc',fields:[
    {name:'id',kind:'string'},{name:'title',kind:'string'}]}];
  const ideas=[
    {id:'one',parentId:null,title:'Misma idea',className:'NoteDoc'},
    {id:'two',parentId:null,title:'Misma idea',className:'NoteDoc'},
    {id:'three',parentId:null,title:'Misma Idea!',className:'NoteDoc'},
  ];
  const {source,docIds}=brainstormToSource(ideas,models,['misma-idea']);
  assert.deepEqual(source.documents.map(d=>d.id),['misma-idea-2','misma-idea-3','misma-idea-4']);
  assert.deepEqual(docIds,{one:'misma-idea-2',two:'misma-idea-3',three:'misma-idea-4'});
});

// ---------------------------------------------------------------- Schema
import {isProjectionDocument,projectionsOf,findProjection,applyProjection,renderDisplay,titleFor} from '../frontends/mindmap/source/projections.mjs';
import {schemaGraph,schemaMatches,relationTypesOf} from '../frontends/mindmap/views/models/diagram/projection.mjs';

test('schemaGraph: la contención declarada da aristas tipadas; las referencias solo se anotan',()=>{
  const models=[
    {id:'BoardDoc',model_ref:'m:BoardDoc',containment:{tasks:['TaskDoc'],ghosts:['GhostDoc']},references:[],
      fields:[{name:'id',kind:'string',required:true},{name:'tasks',kind:'stringlist'},{name:'ghosts',kind:'stringlist'}]},
    {id:'TaskDoc',model_ref:'m:TaskDoc',containment:{},references:['blocks'],
      fields:[{name:'id',kind:'string',required:true},{name:'blocks',kind:'stringlist'},{name:'status',kind:'string'}]},
  ];
  const docs=[{id:'t1',model_name:'TaskDoc',payload:{}},{id:'t2',model_name:'TaskDoc',payload:{}}];
  const g=schemaGraph(models,docs);
  // GhostDoc no está registrado: se anota en la card pero nunca se inventa una arista.
  assert.deepEqual(g.edges,[{id:'BoardDoc.tasks>TaskDoc',source:'BoardDoc',target:'TaskDoc',field:'tasks',kind:'containment'}]);
  const board=g.nodes.find(n=>n.id==='BoardDoc'),task=g.nodes.find(n=>n.id==='TaskDoc');
  assert.deepEqual(board.fields.find(f=>f.name==='tasks').contains,['TaskDoc']);
  assert.deepEqual(board.fields.find(f=>f.name==='ghosts').contains,[]);
  assert.equal(task.fields.find(f=>f.name==='blocks').reference,true);
  assert.equal(task.fields.find(f=>f.name==='status').reference,false);
  assert.equal(task.docCount,2);assert.equal(board.docCount,0);
  assert.equal(task.relational,1);assert.equal(board.relational,2);
});

test('schemaGraph sin metadatos declarados cae a las tablas legacy por clase',()=>{
  const g=schemaGraph([{id:'BoardDoc',fields:[{name:'tasks',kind:'stringlist'}]},
    {id:'TaskDoc',fields:[{name:'checklists',kind:'stringlist'},{name:'routine',kind:'string'}]}]);
  assert.deepEqual(g.edges.map(e=>e.id),['BoardDoc.tasks>TaskDoc']); // ChecklistDoc no registrado: sin arista
  const task=g.nodes.find(n=>n.id==='TaskDoc');
  assert.deepEqual(task.fields.find(f=>f.name==='checklists').contains,[]);
  assert.equal(task.fields.find(f=>f.name==='routine').reference,true);
});

test('schemaGraph: relaciones declaradas por un RelationTypeDoc ignoran extremos abstractos; las instancias (RelationDoc) cuentan sobre la declarada o se sostienen solas',()=>{
  const models=[
    {id:'SurfaceDoc',model_ref:'m:SurfaceDoc',containment:{},references:[],fields:[{name:'id',kind:'string'}]},
    {id:'SpecDoc',model_ref:'m:SpecDoc',containment:{},references:[],fields:[{name:'id',kind:'string'}]},
    {id:'CliCommandDoc',model_ref:'m:CliCommandDoc',containment:{},references:[],fields:[{name:'id',kind:'string'}]},
  ];
  const docs=[
    // sldb_model es un token abstracto de kgdb, no una clase registrada: no genera arista.
    {id:'rt1',model_name:'RelationTypeDoc',payload:{name:'implements',source_types:['SurfaceDoc','CliCommandDoc','sldb_model'],target_types:['SpecDoc']}},
    {id:'surface-x',model_name:'SurfaceDoc',payload:{}},
    {id:'surface-y',model_name:'SurfaceDoc',payload:{}},
    {id:'cli-1',model_name:'CliCommandDoc',payload:{}},
    {id:'spec-01',model_name:'SpecDoc',payload:{}},
    {id:'r1',model_name:'RelationDoc',payload:{source_id:'surface-x',target_id:'spec-01',relation_type:'implements'}},
    {id:'r2',model_name:'RelationDoc',payload:{source_id:'surface-y',target_id:'spec-01',relation_type:'implements'}},
    {id:'r3',model_name:'RelationDoc',payload:{source_id:'cli-1',target_id:'spec-01',relation_type:'implements'}},
    // 'mentions' no lo declara ningún RelationTypeDoc: la instancia sola basta.
    {id:'r4',model_name:'RelationDoc',payload:{source_id:'surface-x',target_id:'spec-01',relation_type:'mentions'}},
  ];
  const g=schemaGraph(models,docs);
  const rel=id=>g.edges.find(e=>e.id===id);
  assert.deepEqual(rel('rel:implements:SurfaceDoc>SpecDoc'),{id:'rel:implements:SurfaceDoc>SpecDoc',source:'SurfaceDoc',target:'SpecDoc',type:'implements',declared:true,count:2,kind:'relation',included:true});
  assert.deepEqual(rel('rel:implements:CliCommandDoc>SpecDoc'),{id:'rel:implements:CliCommandDoc>SpecDoc',source:'CliCommandDoc',target:'SpecDoc',type:'implements',declared:true,count:1,kind:'relation',included:true});
  assert.deepEqual(rel('rel:mentions:SurfaceDoc>SpecDoc'),{id:'rel:mentions:SurfaceDoc>SpecDoc',source:'SurfaceDoc',target:'SpecDoc',type:'mentions',declared:false,count:1,kind:'relation',included:true});
  assert.ok(!g.edges.some(e=>e.source==='sldb_model'||e.target==='sldb_model'));
  assert.equal(g.edges.filter(e=>e.kind==='relation').length,3);
  const surface=g.nodes.find(n=>n.id==='SurfaceDoc');
  assert.deepEqual(new Set(surface.relationTypes),new Set(['implements','mentions']));
});

test('schemaGraph: los campos ⇢ infieren su clase destino de los documentos reales, incluida una auto-relación',()=>{
  const models=[{id:'TaskDoc',model_ref:'m:TaskDoc',containment:{},references:['blocks'],
    fields:[{name:'id',kind:'string'},{name:'blocks',kind:'stringlist'}]}];
  const docs=[
    {id:'task-a',model_name:'TaskDoc',payload:{blocks:['task-b']}},
    {id:'task-b',model_name:'TaskDoc',payload:{}},
  ];
  const g=schemaGraph(models,docs);
  assert.deepEqual(g.edges.find(e=>e.kind==='reference'),{id:'ref:TaskDoc.blocks>TaskDoc',source:'TaskDoc',target:'TaskDoc',field:'blocks',count:1,kind:'reference'});
  const task=g.nodes.find(n=>n.id==='TaskDoc');
  assert.deepEqual(task.fields.find(f=>f.name==='blocks').inferred,['TaskDoc']);
});

test('schemaMatches encuentra clases por el tipo de relación en el que participan',()=>{
  const models=[
    {id:'SurfaceDoc',model_ref:'m:SurfaceDoc',containment:{},references:[],fields:[{name:'id',kind:'string'}]},
    {id:'SpecDoc',model_ref:'m:SpecDoc',containment:{},references:[],fields:[{name:'id',kind:'string'}]},
  ];
  const docs=[
    {id:'rt1',model_name:'RelationTypeDoc',payload:{name:'implements',source_types:['SurfaceDoc'],target_types:['SpecDoc']}},
    {id:'surface-x',model_name:'SurfaceDoc',payload:{}},
    {id:'spec-01',model_name:'SpecDoc',payload:{}},
  ];
  const [surface]=schemaGraph(models,docs).nodes;
  assert.ok(schemaMatches(surface,'implements'));
  assert.ok(schemaMatches(surface,'IMPLEMENTS'));
  assert.ok(!schemaMatches(surface,'depends'));
});

test('schemaMatches filtra por clase, campo, tipo y clase destino',()=>{
  const [board]=schemaGraph([{id:'BoardDoc',containment:{tasks:['TaskDoc']},references:[],
    fields:[{name:'tasks',kind:'stringlist',annotation:'list'}]},{id:'TaskDoc',containment:{},references:[],fields:[]}]).nodes;
  assert.ok(schemaMatches(board,''));
  assert.ok(schemaMatches(board,'board'));
  assert.ok(schemaMatches(board,'TASKDOC'));
  assert.ok(schemaMatches(board,'stringlist'));
  assert.ok(!schemaMatches(board,'pill'));
});

// ---------------------------------------------------------------- Flujo
import {flowGraph,flowMatches,flowClasses} from '../frontends/mindmap/views/documents/flow/projection.mjs';

test('flowGraph draws containment and reference as edges, never nesting',()=>{
  const board={id:'board',model_name:'BoardDoc',payload:{title:'B',tasks:['t1']}};
  const task={id:'t1',model_name:'TaskDoc',payload:{title:'T1',routine:'r1'}};
  const ritual={id:'r1',model_name:'RitualDoc',payload:{title:'R'}};
  const {nodes,edges}=flowGraph([board,task,ritual]);
  assert.equal(nodes.length,3);
  assert.deepEqual(nodes.map(n=>n.id).sort(),['board','r1','t1']);
  assert(!nodes.some(n=>n.parentId),'flowGraph nunca anida: cada relación es una arista');
  assert.equal(edges.length,2);
  const contain=edges.find(e=>e.source==='board'&&e.target==='t1');
  assert.ok(contain,'la contención declarada también se dibuja como arista aquí');
  assert.equal(contain.field,'tasks');
  assert.equal(contain.contains,true);
  const ref=edges.find(e=>e.source==='t1'&&e.target==='r1');
  assert.ok(ref);
  assert.equal(ref.field,'routine');
  assert.equal(ref.contains,false);
});

test('flowGraph respects declared schema metadata over the legacy fallback',()=>{
  const board={id:'board',model_name:'BoardDoc',payload:{title:'B',tasks:['t1']}};
  const task={id:'t1',model_name:'TaskDoc',payload:{title:'T1',blocks:['t1-other']}};
  const other={id:'t1-other',model_name:'TaskDoc',payload:{title:'Other'}};
  const models=[
    {id:'BoardDoc',fields:[{name:'tasks',kind:'stringlist'}],containment:{tasks:['TaskDoc']},references:[]},
    {id:'TaskDoc',fields:[{name:'blocks',kind:'stringlist'}],containment:{},references:['blocks']},
  ];
  const {nodes,edges}=flowGraph([board,task,other],models);
  assert.equal(nodes.length,3);
  assert.equal(edges.length,2);
  assert.ok(edges.find(e=>e.source==='board'&&e.target==='t1'&&e.contains===true));
  assert.ok(edges.find(e=>e.source==='t1'&&e.target==='t1-other'&&e.field==='blocks'&&e.contains===false));
});

test('flowGraph collapses a kgdb RelationDoc into one labeled edge and drops its node',()=>{
  const source={id:'surface-pron-world',model_name:'SurfaceDoc',payload:{title:'World'}};
  const target={id:'spec-01',model_name:'SpecDoc',payload:{title:'Spec 01'}};
  const relation={id:'rel-1',model_name:'RelationDoc',payload:{title:'implements--SurfaceDoc:surface-pron-world--SpecDoc:spec-01',source_id:'SurfaceDoc:surface-pron-world',target_id:'SpecDoc:spec-01',relation_type:'implements'}};
  const {nodes,edges}=flowGraph([source,target,relation]);
  assert.deepEqual(nodes.map(n=>n.id).sort(),['spec-01','surface-pron-world'],'el RelationDoc no es un nodo por defecto');
  assert.equal(edges.length,1);
  const edge=edges[0];
  assert.equal(edge.source,'surface-pron-world');
  assert.equal(edge.target,'spec-01');
  assert.equal(edge.field,'implements');
  assert.equal(edge.contains,false);
  assert.equal(edge.relationDoc,'rel-1');
});

test('flowGraph keeps a RelationDoc as a small node when relationsAsNodes is on',()=>{
  const source={id:'surface-pron-world',model_name:'SurfaceDoc',payload:{title:'World'}};
  const target={id:'spec-01',model_name:'SpecDoc',payload:{title:'Spec 01'}};
  const relation={id:'rel-1',model_name:'RelationDoc',payload:{title:'implements--SurfaceDoc:surface-pron-world--SpecDoc:spec-01',source_id:'SurfaceDoc:surface-pron-world',target_id:'SpecDoc:spec-01',relation_type:'implements'}};
  const {nodes,edges}=flowGraph([source,target,relation],undefined,{relationsAsNodes:true});
  assert.deepEqual(nodes.map(n=>n.id).sort(),['rel-1','spec-01','surface-pron-world']);
  // source_id/target_id ya están en REFERENCE_FIELDS: el RelationDoc-como-nodo dibuja dos referencias ordinarias.
  assert.ok(edges.some(e=>e.source==='rel-1'&&e.target==='surface-pron-world'&&e.field==='source_id'));
  assert.ok(edges.some(e=>e.source==='rel-1'&&e.target==='spec-01'&&e.field==='target_id'));
});

test('flowMatches filters by title, id and class; flowClasses lists present classes only',()=>{
  const node={id:'t1',doc:{id:'t1',model_name:'TaskDoc',payload:{title:'Onboarding'}}};
  assert.ok(flowMatches(node,''));
  assert.ok(flowMatches(node,'onboard'));
  assert.ok(flowMatches(node,'taskdoc'));
  assert.ok(flowMatches(node,'t1'));
  assert.ok(!flowMatches(node,'nope'));
  assert.ok(!flowMatches(null,'anything'));
  const nodes=[node,{id:'b1',doc:{id:'b1',model_name:'BoardDoc',payload:{}}},{id:'t2',doc:{id:'t2',model_name:'TaskDoc',payload:{}}}];
  assert.deepEqual(flowClasses(nodes),['BoardDoc','TaskDoc']);
});

// ---------------------------------------------------------------- Skins/slots
import {classStyle as slotClassStyle,classVar,FALLBACK_SLOTS} from '../frontends/mindmap/shared/classes.mjs';

test('class colors are slots resolved by the active skin, not hardcoded hexes',()=>{
  assert.equal(slotClassStyle('BoardDoc').slot,1);
  assert.equal(slotClassStyle('TaskDoc').slot,2);
  const unknown=slotClassStyle('SomethingWeirdDoc');
  assert.ok(FALLBACK_SLOTS.includes(unknown.slot));
  assert.equal(slotClassStyle('SomethingWeirdDoc').slot,unknown.slot,'el hash del fallback debe ser estable entre llamadas');
  assert.equal(classVar(3),'var(--class-color-3)');
  assert.equal(slotClassStyle('SomethingDoc').name,'Something');
});

// ---------------------------------------------------------------- source/batch.mjs
// NOTA: conflictsBetween reproduce EXACTAMENTE la lógica extraída de
// the documents facet's save(). Dos particularidades de esa lógica, no de este test:
// (1) un 'create' nunca se marca como conflicto — el filtro inicial solo
//     considera 'update'/'delete', así que un id ya existente en el servidor
//     al hacer create no aparece aquí (lo rechaza el propio /api/save, pero
//     no como fila de ConflictDialog).
// (2) un 'delete' cuyo documento YA NO EXISTE en el servidor igual se marca
//     como conflicto (la condición es `!cur || payload difiere`): el código
//     no distingue "ya lo borraron también" de "cambió de verdad".
test('conflictsBetween flags update/delete changes the server no longer matches',()=>{
  const changes=[
    {action:'update',id:'a',expected:{title:'old-a'}},
    {action:'update',id:'b',expected:{title:'old-b'}},
    {action:'delete',id:'c',expected:{title:'old-c'}},
    {action:'delete',id:'e',expected:{title:'old-e'}},
    {action:'create',id:'d',payload:{title:'new-d'}},
  ];
  // 'a' fue modificado por otra sesión: conflicto.
  // 'b' sigue igual en el servidor: no es conflicto.
  // 'c' ya no existe en el servidor: la lógica actual igual lo marca (ver nota (2) arriba).
  // 'e' sigue igual en el servidor (nadie lo tocó): no es conflicto, puede borrarse.
  // 'd' es un create y el servidor ya tiene ese id: nunca se marca como conflicto (ver nota (1)).
  const server=[{id:'a',payload:{title:'changed-elsewhere'}},{id:'b',payload:{title:'old-b'}},
    {id:'e',payload:{title:'old-e'}},{id:'d',payload:{title:'ya existía'}}];
  const conflicts=conflictsBetween(changes,server);
  assert.deepEqual(conflicts.map(c=>c.id).sort(),['a','c']);
  assert.equal(conflicts.find(c=>c.id==='a').current.payload.title,'changed-elsewhere');
  assert.equal(conflicts.find(c=>c.id==='c').current,undefined,'delete de un doc ya ausente: current es undefined');
  assert.ok(!conflicts.some(c=>c.id==='d'),"un create nunca se marca como conflicto con la lógica actual de App.save");
});

test('changesBetween + conflictsBetween round trip: unchanged documents never conflict',()=>{
  const baseline=[{id:'a',model_name:'TaskDoc',payload:{title:'A'}},{id:'b',model_name:'TaskDoc',payload:{title:'B'}}];
  const local=[{id:'a',model_name:'TaskDoc',payload:{title:'A edited locally'}},{id:'b',model_name:'TaskDoc',payload:{title:'B'}}];
  const changes=changesBetween(baseline,local);
  assert.deepEqual(changes.map(c=>c.action),['update']);
  // El servidor no cambió nada: ningún conflicto.
  assert.deepEqual(conflictsBetween(changes,baseline),[]);
  // El servidor cambió 'a' también: conflicto.
  const serverChanged=[{id:'a',model_name:'TaskDoc',payload:{title:'A changed on server'}},{id:'b',model_name:'TaskDoc',payload:{title:'B'}}];
  assert.deepEqual(conflictsBetween(changes,serverChanged).map(c=>c.id),['a']);
});

// ---------------------------------------------------------------- source/history.mjs
test('history: edit pushes one entry onto history and clears future',()=>{
  let state=history.initial({documents:['d0'],view:{}});
  state=history.edit(state,w=>({...w,documents:['d1']}));
  assert.deepEqual(state.working.documents,['d1']);
  assert.equal(state.history.length,1);
  assert.deepEqual(state.history[0].documents,['d0']);
  assert.deepEqual(state.future,[]);
});

test('history: undo/redo round trip restores the exact working copy',()=>{
  let state=history.initial({documents:['d0'],view:{}});
  state=history.edit(state,w=>({...w,documents:['d1']}));
  state=history.edit(state,w=>({...w,documents:['d2']}));
  state=history.undo(state);
  assert.deepEqual(state.working.documents,['d1']);
  state=history.undo(state);
  assert.deepEqual(state.working.documents,['d0']);
  assert.equal(state.history.length,0);
  state=history.redo(state);
  assert.deepEqual(state.working.documents,['d1']);
  state=history.redo(state);
  assert.deepEqual(state.working.documents,['d2']);
  assert.equal(state.future.length,0);
  // undo/redo con las pilas vacías no rompe: devuelve el mismo estado.
  assert.deepEqual(history.redo(state),state);
});

test('history: a new edit after undo clears the redo stack (future)',()=>{
  let state=history.initial({documents:['d0'],view:{}});
  state=history.edit(state,w=>({...w,documents:['d1']}));
  state=history.undo(state);
  assert.equal(state.future.length,1);
  state=history.edit(state,w=>({...w,documents:['d1-b']}));
  assert.equal(state.future.length,0,'un edit nuevo invalida el redo pendiente');
});

test('history: checkpoint + apply creates exactly one history entry (drag start/stop)',()=>{
  let state=history.initial({documents:[],view:{positions:{}}});
  state=history.checkpoint(state); // drag start
  assert.equal(state.history.length,1);
  state=history.apply(state,w=>({...w,view:{...w.view,positions:{n1:{x:10,y:20}}}})); // drag stop
  assert.equal(state.history.length,1,'apply no debe empujar una segunda entrada de historial');
  assert.deepEqual(state.working.view.positions,{n1:{x:10,y:20}});
  // El undo restaura el estado previo al drag, en un solo paso.
  state=history.undo(state);
  assert.deepEqual(state.working.view.positions,{});
});

test('history: caps at 40 entries',()=>{
  let state=history.initial({documents:[],view:{}});
  for(let i=0;i<45;i++)state=history.edit(state,w=>({...w,documents:[i]}));
  assert.equal(state.history.length,40);
  assert.deepEqual(state.history[0].documents,[4]); // las 5 primeras ediciones se descartaron
});

test('history: reset clears history/future and rebases working on the new baseline',()=>{
  let state=history.initial({documents:['d0'],view:{}});
  state=history.edit(state,w=>({...w,documents:['d1']}));
  state=history.undo(state);
  assert.ok(state.history.length||state.future.length);
  state=history.reset(state,{documents:['server-d'],view:{fromServer:true}});
  assert.deepEqual(state.working,{documents:['server-d'],view:{fromServer:true}});
  assert.deepEqual(state.history,[]);
  assert.deepEqual(state.future,[]);
});

// pron's own ProjectionDoc, reused as-is (see pron/src/pron/models/projection.py):
// a projection filters entities by `models` and relation types by `relations`,
// both empty meaning "everything enters" — never a UI-only concept.
const PROJ_DOCS=[
  {id:'projection-all',model_name:'ProjectionDoc',payload:{name:'all',models:['SurfaceDoc','SpecDoc'],relations:[{name:'implements',mode:'read'}],display:{SpecDoc:'{title}',SurfaceDoc:'{surface} ({implements.title})'}}},
  {id:'projection-open',model_name:'ProjectionDoc',payload:{name:'open',models:[],relations:[],display:{}}},
  {id:'surface-x',model_name:'SurfaceDoc',payload:{surface:'pron-world'}},
  {id:'spec-01',model_name:'SpecDoc',payload:{title:'Spec 01'}},
  {id:'cli-1',model_name:'CliCommandDoc',payload:{command_path:'pron ask'}},
  {id:'rt1',model_name:'RelationTypeDoc',payload:{name:'implements',source_types:['SurfaceDoc'],target_types:['SpecDoc']}},
  {id:'r1',model_name:'RelationDoc',payload:{source_id:'surface-x',target_id:'spec-01',relation_type:'implements'}},
  {id:'r2',model_name:'RelationDoc',payload:{source_id:'surface-x',target_id:'cli-1',relation_type:'mentions'}},
];

test('projectionsOf/findProjection: ProjectionDoc is matched nominally by model_name',()=>{
  assert.ok(isProjectionDocument(PROJ_DOCS[0]));
  assert.ok(!isProjectionDocument(PROJ_DOCS[2]));
  assert.deepEqual(projectionsOf(PROJ_DOCS).map(d=>d.id),['projection-all','projection-open']);
  assert.equal(findProjection(PROJ_DOCS,'all').id,'projection-all');
  assert.equal(findProjection(PROJ_DOCS,'missing'),null);
});

test('applyProjection: declared models/relations filter entities and relation (type) documents; empty means every one',()=>{
  const all=findProjection(PROJ_DOCS,'all');
  const filtered=applyProjection(PROJ_DOCS,all);
  // CliCommandDoc and both ProjectionDocs are not in `models`, `mentions` is
  // not in `relations`: all four drop, same as pron's own projection semantics.
  assert.deepEqual(filtered.map(d=>d.id).sort(),['r1','rt1','spec-01','surface-x']);
  const open=findProjection(PROJ_DOCS,'open');
  assert.deepEqual(applyProjection(PROJ_DOCS,open),PROJ_DOCS,'empty models/relations keeps every document, same array reference');
  assert.equal(applyProjection(PROJ_DOCS,null),PROJ_DOCS,'no active projection is an identity pass-through');
});

test('renderDisplay: {field} substitutes the payload, {rel.field} follows a RelationDoc edge to its target',()=>{
  assert.equal(renderDisplay('{surface}',PROJ_DOCS[2],PROJ_DOCS),'pron-world');
  assert.equal(renderDisplay('{surface} ({implements.title})',PROJ_DOCS[2],PROJ_DOCS),'pron-world (Spec 01)');
  assert.equal(renderDisplay('{missing.title}',PROJ_DOCS[2],PROJ_DOCS),'','an edge type with no matching RelationDoc renders empty, like pron');
});

test('titleFor: uses the active projection\'s display template when declared, else falls back to titleOf',()=>{
  const all=findProjection(PROJ_DOCS,'all');
  assert.equal(titleFor(PROJ_DOCS[3],all,PROJ_DOCS),'Spec 01');
  assert.equal(titleFor(PROJ_DOCS[4],all,PROJ_DOCS),'cli-1','CliCommandDoc has no display template in this projection');
  assert.equal(titleFor(PROJ_DOCS[3],null,PROJ_DOCS),'Spec 01','no active projection: same as titleOf');
});

test('relationTypesOf: distinct names from RelationTypeDoc declarations and RelationDoc instances, sorted',()=>{
  assert.deepEqual(relationTypesOf(PROJ_DOCS),['implements','mentions']);
  assert.deepEqual(relationTypesOf([]),[]);
});
