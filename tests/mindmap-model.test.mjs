import {test} from 'node:test';
import assert from 'node:assert/strict';
import {appendChild,project,removeDocument,changesBetween,hierarchy} from '../frontends/mindmap/model.mjs';
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
