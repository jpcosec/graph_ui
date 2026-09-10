import {test} from 'node:test';
import assert from 'node:assert/strict';
import {brainstormToSource,brainstormIssues} from '../frontends/mindmap/model.mjs';
import {appendChild,project,removeDocument,changesBetween,hierarchy,relationships,defaultsFor,quickPayload,graphMaps,searchDocuments,referenceFieldsOf} from '../frontends/mindmap/model.mjs';
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
  // Las ideas inválidas se reportan y no entran al spec.
  const issues=brainstormIssues(ideas,models);
  assert.deepEqual(issues.map(i=>i.id).sort(),['c','d']);
  assert.ok(!source.documents.some(d=>d.id==='ghost'));
});
