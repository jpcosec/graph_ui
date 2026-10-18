import { describe, expect, it } from 'vitest';

import type { NodeData } from '@/stores/types';

import { resolveNodeTitle } from './node-title';

describe('resolveNodeTitle', () => {
  it('reads the title from the AST payload when the node has no direct label', () => {
    // The inspector used to ignore payload.value and open these nodes with an empty title.
    expect(resolveNodeTitle({ payload: { typeId: 'doc', value: { name: 'Ada' } } }, '')).toBe('Ada');
    expect(resolveNodeTitle({ payload: { typeId: 'doc', value: { title: 'System Design' } } }, '')).toBe('System Design');
  });

  it('prefers label, then name, then payload name, then payload title', () => {
    const payload = { typeId: 'doc', value: { name: 'payload-name', title: 'payload-title' } };
    expect(resolveNodeTitle({ label: 'label', name: 'name', payload }, '')).toBe('label');
    expect(resolveNodeTitle({ name: 'name', payload }, '')).toBe('name');
    expect(resolveNodeTitle({ payload }, '')).toBe('payload-name');
  });

  it('skips blank and non-string candidates', () => {
    // Runtime data can disagree with the type (e.g. a numeric name from a raw document).
    const corrupt = { label: '   ', name: 42, payload: { value: { name: '', title: 'Real' } } } as unknown as NodeData;
    expect(resolveNodeTitle(corrupt, '')).toBe('Real');
  });

  it("falls back to the caller's name for no title", () => {
    expect(resolveNodeTitle({}, 'Untitled')).toBe('Untitled');
    expect(resolveNodeTitle({ payload: { value: {} } }, 'Group')).toBe('Group');
    expect(resolveNodeTitle(undefined, '')).toBe('');
  });
});
