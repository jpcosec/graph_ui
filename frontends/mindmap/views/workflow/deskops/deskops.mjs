export const statusLabel = status => ({open:'Abierta',active:'Activa',in_progress:'En curso',ready_for_testing:'Lista para validar',ready_for_closeout:'Lista para cerrar',blocked:'Bloqueada',closed:'Cerrada',draft:'Borrador'}[status] || status || 'Sin estado');
export function filterTasks(tasks, query='', status='') {
  const text=query.trim().toLocaleLowerCase();
  return tasks.filter(t=>(!status || t.status===status) && (!text || [t.id,t.title,t.goal,t.current_node].join(' ').toLocaleLowerCase().includes(text)));
}
export const counts = tasks => tasks.reduce((out,t)=>({...out,[t.status]:(out[t.status]||0)+1}),{});
export const canAdvance = detail => !!detail && detail.task.current_node !== 'ritual-closeout' && detail.gates.some(g=>g.holds && g.target !== 'complete');
