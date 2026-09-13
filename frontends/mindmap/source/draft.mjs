// Brainstorm draft: transient ideas kept in localStorage, never SLDB
// documents until an explicit conversion validates and applies them via
// /api/plan + /api/compile. Pure logic + localStorage access; no React.
import {childOptions} from './graph.mjs';
import {slugify, quickPayload} from '../shared/documents.mjs';

export const DRAFT_KEY = 'kb-brainstorm-draft-v1';

export function readDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed?.ideas) ? parsed.ideas : null;
  } catch { return null; }
}

export function writeDraft(ideas) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ideas, savedAt: Date.now()}));
}

export const IDEA_EMOJIS = ['💡', '📌', '🔍', '🧠', '🌱', '⚡', '🎯', '❓'];
// Mismo orden de matiz que el antiguo IDEA_COLORS (azul, ámbar, verde,
// violeta, rojo, cian), ahora como slots de clase resueltos contra la skin activa.
export const IDEA_SLOTS = [1, 2, 5, 3, 6, 4];
export function newIdea(ideas, parentId, className) {
  return {id: 'idea-' + crypto.randomUUID(), parentId: parentId || null,
    title: '', emoji: IDEA_EMOJIS[ideas.length % IDEA_EMOJIS.length],
    slot: IDEA_SLOTS[ideas.length % IDEA_SLOTS.length],
    className: className || null, convertedDocId: null};
}
// Convierte el árbol de ideas en un spec de intercambio (contrato v1).
// - Solo ideas con clase elegida y título; el resto se reporta como pendientes.
// - Contención: primer campo de childOptions(padre) que acepte la clase hija.
// Devuelve {source, docIds} donde docIds mapea idea.id -> document.id para
// marcar las ideas convertidas.
export function brainstormIssues(ideas, models) {
  const issues=[];
  for(const idea of ideas){
    if(!idea.title?.trim())issues.push({id:idea.id,reason:'sin título'});
    else if(!idea.className)issues.push({id:idea.id,reason:'sin clase'});
    else if(!models.some(m=>m.id===idea.className))issues.push({id:idea.id,reason:'clase inexistente'});
  }
  return issues;
}
export function brainstormToSource(ideas, models, reservedIds=[]) {
  const byId=new Map(ideas.map(i=>[i.id,i])),docIds=new Map();
  const valid=ideas.filter(i=>i.title?.trim()&&i.className&&models.some(m=>m.id===i.className));
  const usedIds=new Set(reservedIds);
  for(const idea of valid){
    const base=slugify(idea.title);let candidate=base,n=2;
    while(usedIds.has(candidate)){candidate=`${base}-${n++}`;}
    usedIds.add(candidate);docIds.set(idea.id,candidate);
  }
  const documents=valid.map(idea=>({id:docIds.get(idea.id),model:idea.className,
    payload:quickPayload(models.find(m=>m.id===idea.className),idea.title,docIds.get(idea.id))}));
  const byDocId=new Map(documents.map(d=>[d.id,d]));
  for(const idea of valid){
    const parent=idea.parentId?byId.get(idea.parentId):null;
    if(!parent||!docIds.has(parent.id)||!docIds.has(idea.id))continue;
    // La contención vive en el payload del PADRE (mismo criterio que appendChild).
    const option=childOptions({model_name:parent.className},models).find(o=>o.model===idea.className);
    if(option){const parentDoc=byDocId.get(docIds.get(parent.id));
      parentDoc.payload[option.field]=[...new Set([...(parentDoc.payload[option.field]||[]),docIds.get(idea.id)])];}
  }
  const classNames=[...new Set(valid.map(i=>i.className))];
  const modelsDecl=classNames.map(name=>{
    const schema=models.find(m=>m.id===name);
    return schema?.model_ref?{name,ref:schema.model_ref}:{name};
  }).filter(Boolean);
  // Omitir `view` conserva el layout persistido de la KB al convertir ideas.
  return {source:{version:1,models:modelsDecl,documents},
    docIds:Object.fromEntries(valid.map(i=>[i.id,docIds.get(i.id)]))};
}
