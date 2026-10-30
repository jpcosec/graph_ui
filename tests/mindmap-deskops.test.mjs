import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterTasks,counts,canAdvance,statusLabel} from '../frontends/mindmap/views/workflow/deskops/deskops.mjs';
test('empty state and unknown status are preserved',()=>{assert.deepEqual(filterTasks([]),[]);assert.deepEqual(counts([]),{});assert.equal(statusLabel('custom'),'custom');assert.equal(canAdvance(null),false);});
test('filtering composes text and status without changing source',()=>{const tasks=[{id:'uno',title:'Revisar contrato',status:'open'},{id:'dos',goal:'Revisar navegador',status:'active'}];assert.deepEqual(filterTasks(tasks,' REVISAR ','active'),[tasks[1]]);assert.deepEqual(counts(tasks),{open:1,active:1});assert.equal(tasks.length,2);});
test('closeout never offers advance even with a passing terminal gate',()=>{const detail={task:{current_node:'ritual-closeout'},gates:[{holds:true,target:'complete'}]};assert.equal(canAdvance(detail),false);detail.task.current_node='ritual-testing';assert.equal(canAdvance(detail),false);detail.gates=[{holds:false,target:'ritual-closeout'}];assert.equal(canAdvance(detail),false);detail.gates[0].holds=true;assert.equal(canAdvance(detail),true);});
