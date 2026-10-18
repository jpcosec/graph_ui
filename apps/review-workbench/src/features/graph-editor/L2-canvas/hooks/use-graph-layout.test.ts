import { describe, expect, it } from 'vitest';

import { everyNodeMeasured, layoutNodeSize } from './use-graph-layout';

describe('layoutNodeSize', () => {
  it('uses the size React Flow measured', () => {
    expect(layoutNodeSize({}, { width: 312, height: 96 })).toEqual({ width: 312, height: 96 });
  });

  it('prefers the measured size over an explicit style size', () => {
    expect(layoutNodeSize({ style: { width: 400, height: 300 } }, { width: 312, height: 96 })).toEqual({ width: 312, height: 96 });
  });

  it('falls back to a numeric style size when nothing was measured', () => {
    expect(layoutNodeSize({ style: { width: 400, height: 300 } }, undefined)).toEqual({ width: 400, height: 300 });
    expect(layoutNodeSize({ style: { width: 400 } }, { width: 0, height: 0 })).toEqual({ width: 400, height: undefined });
  });

  it("leaves the size undefined (the strategy's fallback) when neither exists", () => {
    expect(layoutNodeSize({ style: { width: '50%' } }, undefined)).toEqual({ width: undefined, height: undefined });
  });
});

describe('everyNodeMeasured', () => {
  it('is false with no nodes and until every node has a measured size', () => {
    expect(everyNodeMeasured([])).toBe(false);
    expect(everyNodeMeasured([{ measured: { width: 150, height: 44 } }, { measured: undefined }])).toBe(false);
    expect(everyNodeMeasured([{ measured: { width: 150, height: 0 } }])).toBe(false);
    expect(everyNodeMeasured([{ measured: { width: 150, height: 44 } }, { measured: { width: 90, height: 30 } }])).toBe(true);
  });
});
