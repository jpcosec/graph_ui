export type HumViewMode = 'structure' | 'body' | 'routine' | 'trace' | 'compare';

export interface HumAstFile {
  id: string;
  label: string;
  filePath: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface HumAstForm {
  id: string;
  fileId: string;
  label: string;
  formType: string;
  description: string;
  position: { x: number; y: number };
}

export interface HumOrgan {
  id: string;
  label: string;
  packageName: string;
  filePath: string;
  description: string;
  position: { x: number; y: number };
  colorToken: string;
}

export interface HumCapability {
  id: string;
  organId: string;
  label: string;
  functionName: string;
  filePath: string;
  description: string;
  position: { x: number; y: number };
  role: string;
  kind?: 'capability' | 'tool';
}

export interface HumArtifact {
  id: string;
  ownerId: string;
  label: string;
  artifactPath: string;
  description: string;
  position: { x: number; y: number };
}

export interface HumRoutineStep {
  id: string;
  label: string;
  targetId: string;
  description: string;
  status?: 'expected' | 'optional' | 'critical';
}

export interface HumRoutine {
  id: string;
  label: string;
  description: string;
  steps: HumRoutineStep[];
}

export interface HumTraceEvent {
  id: string;
  label: string;
  targetId: string;
  description: string;
  outcome: 'done' | 'failed' | 'blocked' | 'looping';
  notes?: string;
  mirrorsStepId?: string;
  energyDelta?: number;
}

export interface HumTrace {
  id: string;
  label: string;
  description: string;
  routineId: string;
  events: HumTraceEvent[];
}

export interface HumBodyModel {
  astFiles: HumAstFile[];
  astForms: HumAstForm[];
  organs: HumOrgan[];
  capabilities: HumCapability[];
  artifacts: HumArtifact[];
  routines: HumRoutine[];
  traces: HumTrace[];
}
