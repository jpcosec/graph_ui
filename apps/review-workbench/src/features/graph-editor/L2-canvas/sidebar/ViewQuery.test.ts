import { describe, expect, it } from 'vitest';

import { parseRelations } from './ViewQuery';

describe('parseRelations', () => {
  it('splits on commas and drops blanks', () => {
    expect(parseRelations(' uses, inherits ,, ')).toEqual(['uses', 'inherits']);
    expect(parseRelations('')).toEqual([]);
  });
});
