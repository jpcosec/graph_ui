import { describe, expect, it } from 'vitest';

import { isCollapsed } from './GroupShell';

describe('GroupShell helpers (GRP-001-05)', () => {
  it('reads collapsed state from ui-store, not from the node data', () => {
    expect(isCollapsed('group-1', { 'group-1': { expandedHeight: 240 } })).toBe(true);
    expect(isCollapsed('group-1', { 'group-1': {} })).toBe(true);
    expect(isCollapsed('group-1', { 'group-2': {} })).toBe(false);
    expect(isCollapsed('group-1', {})).toBe(false);
  });
});
