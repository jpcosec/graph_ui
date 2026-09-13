// Pure layout for the KB map view: documents -> React Flow nodes/edges.
import {hierarchy} from '../../../source/graph.mjs';

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
export function project(documents, view={}, maps=null) {
  const {parents,links}=hierarchy(documents,maps),byId=Object.fromEntries(documents.map(d=>[d.id,d])),children={};
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
  const edges=links.filter(e=>visible.has(e.source)&&visible.has(e.target)&&(!e.contains||parents[e.target]?.source!==e.source)).map((e,i)=>({id:'ref-'+i,source:e.source,target:e.target,type:'smoothstep',label:e.field,
    // Referencias: línea punteada y de bajo peso visual; la contención es el grupo, nunca una línea.
    style:{stroke:'var(--edge)',strokeWidth:1.5,strokeDasharray:'5 4'},markerEnd:{type:'arrowclosed',width:16,height:16,color:'var(--edge)'},labelStyle:{fontSize:10,fill:'var(--text-muted)',backgroundColor:'var(--surface-app)'},labelBgPadding:{x:2,y:2},data:e}));
  return {nodes,edges,parents,children};
}
