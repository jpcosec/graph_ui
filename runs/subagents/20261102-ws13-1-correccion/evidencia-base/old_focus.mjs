import * as R from '/tmp/ws131-base/frontends/mindmap/views/workspace/node/reader.mjs';
const A='TaskDoc:a',B='TaskDoc:b',C='TaskDoc:c';
const prov=(field,declared)=>({origin:'schema',field,declared});
const aToC={source:A,target:C,type:'references',relationDoc:null,provenance:[prov('depends_on','c')]};
const bToA={source:B,target:A,type:'references',relationDoc:null,provenance:[prov('depends_on','a')]};
const edges=[aToC,bToA]; const fields=[{field_path:'depends_on'}];
console.log('BASE fieldHighlighted(depends_on de A) con foco en arista entrante B->A =', R.fieldHighlighted('depends_on', R.edgeFocus(bToA), edges));
console.log('BASE correspondence(foco B->A) =', JSON.stringify(R.correspondence(R.edgeFocus(bToA), {fields, edges, files: []})));
console.log('BASE edgeHighlighted(B->A) con foco de campo depends_on =', R.edgeHighlighted(bToA, R.fieldFocus('depends_on')));
