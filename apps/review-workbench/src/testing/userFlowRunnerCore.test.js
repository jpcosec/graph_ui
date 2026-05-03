import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  SUPPORTED_ACTIONS,
  makeFlowArtifactPaths,
  resolveFlowFiles,
  slugifyFlowName,
  validateFlowDefinition,
} from './userFlowRunnerCore.js';

describe('userFlowRunnerCore', () => {
  it('slugifies flow names for artifact directories', () => {
    expect(slugifyFlowName('HUM Overlay Flow')).toBe('hum-overlay-flow');
    expect(slugifyFlowName('  ')).toBe('flow');
  });

  it('validates supported flow actions', () => {
    expect(() => validateFlowDefinition({ steps: [{ id: 'ok', action: 'goto' }] })).not.toThrow();
    expect(SUPPORTED_ACTIONS.has('drag')).toBe(true);
    expect(SUPPORTED_ACTIONS.has('assert_count_equals')).toBe(true);
    expect(SUPPORTED_ACTIONS.has('dispatch_click')).toBe(true);
    expect(() => validateFlowDefinition({ steps: [{ id: 'bad', action: 'explode' }] })).toThrow('Unsupported action: explode');
  });

  it('resolves all flow files from a directory', () => {
    const files = resolveFlowFiles({
      flowFile: '',
      flowsDir: path.resolve('user_flows'),
      runAll: true,
    });

    expect(files.length).toBeGreaterThanOrEqual(4);
    expect(files.every((file) => file.endsWith('.json'))).toBe(true);
  });

  it('builds stable artifact paths', () => {
    const artifacts = makeFlowArtifactPaths('/tmp/out', 'Editor Interaction Flow');
    expect(artifacts.dir).toBe('/tmp/out/editor-interaction-flow');
    expect(artifacts.log).toBe('/tmp/out/editor-interaction-flow/runner.log');
    expect(artifacts.report).toBe('/tmp/out/editor-interaction-flow/report.json');
  });
});
