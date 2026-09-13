// Pure diff/conflict logic for the save round-trip against SLDB.
export function changesBetween(baseline,documents) {
  const old=new Map(baseline.map(d=>[d.id,d])),current=new Map(documents.map(d=>[d.id,d]));
  const result=[];
  documents.forEach(d=>{const before=old.get(d.id);if(!before)result.push({action:'create',id:d.id,model:d.model_name,payload:d.payload});else if(JSON.stringify(before.payload)!==JSON.stringify(d.payload))result.push({action:'update',id:d.id,model:d.model_name,payload:d.payload,expected:before.payload});});
  baseline.forEach(d=>{if(!current.has(d.id))result.push({action:'delete',id:d.id,expected:d.payload});});
  return result;
}
// Extracted verbatim from App.save's 409 handling: a change is conflicted
// when the server's current payload for that id no longer matches what the
// client expected to overwrite. NOTE: only 'update'/'delete' changes are
// considered — a 'create' is never flagged as conflicted by this logic, even
// if the server already has a document with that id (that case surfaces as a
// plain save error, not a revision conflict row).
export function conflictsBetween(changes,serverDocuments) {
  const server=new Map(serverDocuments.map(d=>[d.id,d]));
  return changes.filter(c=>['update','delete'].includes(c.action))
    .filter(c=>{const cur=server.get(c.id);return !cur||JSON.stringify(cur.payload)!==JSON.stringify(c.expected);})
    .map(c=>({id:c.id,action:c.action,current:server.get(c.id)}));
}
