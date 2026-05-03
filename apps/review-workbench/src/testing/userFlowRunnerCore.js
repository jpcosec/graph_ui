import fs from 'node:fs';
import path from 'node:path';

export const SUPPORTED_ACTIONS = new Set([
  'goto',
  'click',
  'dispatch_click',
  'dblclick',
  'hover',
  'fill',
  'press',
  'wait',
  'wait_hidden',
  'wait_text',
  'wait_url',
  'wait_fixed',
  'drag',
  'reload',
  'assert_text',
  'assert_value',
  'assert_enabled',
  'assert_disabled',
  'assert_count_at_least',
  'assert_count_equals',
]);

export function slugifyFlowName(value) {
  return String(value || 'flow')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'flow';
}

export function validateFlowDefinition(flow) {
  if (!flow || typeof flow !== 'object') {
    throw new Error('Flow definition must be an object');
  }
  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    throw new Error('Flow definition requires at least one step');
  }
  for (const step of flow.steps) {
    if (!step.id) {
      throw new Error('Every flow step requires an id');
    }
    if (!SUPPORTED_ACTIONS.has(step.action)) {
      throw new Error(`Unsupported action: ${step.action}`);
    }
  }
  return flow;
}

export function loadFlowDefinition(flowFile) {
  const raw = fs.readFileSync(flowFile, 'utf8');
  const flow = JSON.parse(raw);
  return validateFlowDefinition(flow);
}

export function resolveFlowFiles({ flowFile, flowsDir, runAll }) {
  if (runAll) {
    return fs
      .readdirSync(flowsDir)
      .filter((entry) => entry.endsWith('.json'))
      .sort()
      .map((entry) => path.join(flowsDir, entry));
  }

  if (!flowFile) {
    throw new Error('Pass --flow <file> or use --all');
  }

  return [path.isAbsolute(flowFile) ? flowFile : path.resolve(flowFile)];
}

export function makeFlowArtifactPaths(outputRoot, flowName) {
  const slug = slugifyFlowName(flowName);
  return {
    slug,
    dir: path.join(outputRoot, slug),
    log: path.join(outputRoot, slug, 'runner.log'),
    report: path.join(outputRoot, slug, 'report.json'),
  };
}
