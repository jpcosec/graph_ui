import { describe, expect, it } from 'vitest';

import { dashFor, luminance, nodeColours, readableInk, shapeRadius, themed } from './notation-style';

const INKS = { light: '#1f2328', dark: '#e6edf3' };

describe('notation-style', () => {
  it('draws the dark side of a per-theme colour; a plain string is both', () => {
    expect(themed({ light: '#fff', dark: '#000' })).toBe('#000');
    expect(themed({ light: '#fff' })).toBe('#fff');
    expect(themed('#0072b2')).toBe('#0072b2');
    expect(themed(null)).toBeNull();
  });

  it('keeps dark text over a literal light fill, light text over a dark one', () => {
    expect(readableInk('#fff1c2', INKS)).toBe(INKS.light);
    expect(readableInk('#092c42', INKS)).toBe(INKS.dark);
    expect(readableInk('var(--x)', INKS)).toBeNull();
    expect(luminance('#ffffff')).toBeGreaterThan(0.99);
  });

  it('gives a styled node its fill, stroke and readable text; an unstyled one nothing', () => {
    expect(nodeColours({ fill: { light: '#dbebf4', dark: '#092c42' }, stroke: { dark: '#0072b2' } }, INKS)).toEqual({ fill: '#092c42', stroke: '#0072b2', text: INKS.dark });
    expect(nodeColours(undefined, INKS)).toEqual({ fill: null, stroke: null, text: null });
  });

  it('maps shapes to corners and lines to dashes', () => {
    expect(shapeRadius('rounded-box')).toBe('14px');
    expect(shapeRadius('diamond')).toBeUndefined();
    expect(dashFor('dashed')).toBe('6 4');
    expect(dashFor('solid')).toBeUndefined();
  });
});
