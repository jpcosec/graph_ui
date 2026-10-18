import { describe, expect, it } from 'vitest';

import { payloadValue } from './node-data';

describe('payloadValue', () => {
  it('returns the document payload as a record', () => {
    expect(payloadValue({ payload: { typeId: 'doc', value: { name: 'Ada', tags: ['x'] } } })).toEqual({ name: 'Ada', tags: ['x'] });
  });

  it('yields an empty record when there is no object payload', () => {
    expect(payloadValue(undefined)).toEqual({});
    expect(payloadValue({})).toEqual({});
    expect(payloadValue({ payload: { value: 'text' } })).toEqual({});
    expect(payloadValue({ payload: { value: ['a', 'b'] } })).toEqual({});
    expect(payloadValue({ payload: { value: null } })).toEqual({});
  });
});
