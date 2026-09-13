// Presentation adapters. Document classes and payloads remain SLDB-owned.
// Colors are NOT part of a class's identity — each class keeps a stable
// *slot* (1..23) and the active skin (skins/light.css, skins/dark.css) maps
// slots to concrete colors via --class-color-N. See shell/skin.js.
export const CLASSES = {
  BoardDoc: {icon:'🗂️',slot:1,name:'Board'},
  TaskDoc: {icon:'🎯',slot:2,name:'Task'},
  RoutineDoc: {icon:'🔁',slot:3,name:'Routine'},
  ChecklistDoc: {icon:'☑️',slot:4,name:'Checklist'},
  ConditionDoc: {icon:'🔎',slot:5,name:'Condition'},
  EdgeDoc: {icon:'🔗',slot:6,name:'Edge'},
  OperatorDoc: {icon:'⚙️',slot:7,name:'Operator'},
  AtomDoc: {icon:'⚛️',slot:8,name:'Atom'},
  PillDoc: {icon:'💊',slot:9,name:'Pill'},
  RitualDoc: {icon:'🪄',slot:10,name:'Ritual'},
  FAQDoc: {icon:'❓',slot:11,name:'FAQ'},
  HookDoc: {icon:'🪝',slot:12,name:'Hook'},
  InboxNoteDoc: {icon:'📥',slot:13,name:'Inbox Note'},
  MaterializationContractDoc: {icon:'📐',slot:14,name:'Materialization Contract'},
  RoleDoc: {icon:'👤',slot:15,name:'Role'},
  PrimitiveDoc: {icon:'🧩',slot:16,name:'Primitive'},
  StepDoc: {icon:'👣',slot:17,name:'Step'},
};
Object.assign(CLASSES, {
  DomainAtom:{icon:'🌐',slot:1,name:'Domain Atom'},
  RuleAtom:{icon:'📏',slot:2,name:'Rule Atom'},
  ToolAtom:{icon:'🛠️',slot:5,name:'Tool Atom'},
  TraitAtom:{icon:'🧬',slot:7,name:'Trait Atom'},
  ConversationStep:{icon:'💬',slot:4,name:'Conversation Step'},
  SelfDeclaration:{icon:'🪪',slot:3,name:'Self Declaration'},
  StyleGuide:{icon:'🎨',slot:18,name:'Style Guide'},
  CapabilityBoundary:{icon:'🛡️',slot:15,name:'Capability Boundary'},
  StrategyRule:{icon:'♟️',slot:10,name:'Strategy Rule'},
  FallbackRule:{icon:'🛟',slot:9,name:'Fallback Rule'},
  GateCriterion:{icon:'🚦',slot:8,name:'Gate Criterion'},
  AgentFraming:{icon:'🤖',slot:16,name:'Agent Framing'},
  RelationTypeDoc:{icon:'🧭',slot:14,name:'Relation Type'},
  RelationDoc:{icon:'🔗',slot:6,name:'Relation'},
  RepositoryDoc:{icon:'🗃️',slot:19,name:'Repository'},
  CompositionDoc:{icon:'🧱',slot:13,name:'Composition'},
});
const FALLBACK_ICONS=['🔷','🔶','🟢','🟣','🔺','⭐','💠','✳️'];
export const FALLBACK_SLOTS=[1,20,21,3,12,13,22,23];
export function classStyle(name) {
  if(CLASSES[name])return CLASSES[name];
  let hash=2166136261;
  for(const character of name||'Documento')hash=Math.imul(hash^character.charCodeAt(0),16777619)>>>0;
  return {icon:FALLBACK_ICONS[(hash>>>8)%FALLBACK_ICONS.length],slot:FALLBACK_SLOTS[hash%FALLBACK_SLOTS.length],name:(name||'Documento').replace(/Doc$/,'').replace(/([a-z])([A-Z])/g,'$1 $2')};
}
export const classVar = slot => `var(--class-color-${slot})`;
