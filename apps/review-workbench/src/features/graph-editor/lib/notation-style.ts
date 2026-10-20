/**
 * The style a view's notation resolves (spec2viz contract §13), for the canvas: which side of a
 * per-theme colour to use, and the text colour over a declared fill. graph_ui never recomputes the
 * precedence (glyph > spec kinds > palette): the server already sends the resolved style.
 */
import type { NotationStyle, Themed } from './views-provider';

/** review-workbench is a dark UI: it draws the `dark` side of each colour. */
export const SKIN: 'light' | 'dark' = 'dark';

export function themed(value: Themed | string | null | undefined, skin: 'light' | 'dark' = SKIN): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value[skin] ?? value.light ?? null;
}

/** WCAG relative luminance of `#rgb`/`#rrggbb`; null when it is not a hex colour. */
export function luminance(colour: string | null | undefined): number | null {
  let hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(colour ?? '').trim())?.[1];
  if (!hex) return null;
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(hex!.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** The palette ink (of its two) that contrasts most with this fill: a literal light fill keeps dark text. */
export function readableInk(fill: string | null, inks: Themed | null | undefined): string | null {
  const lf = luminance(fill);
  if (lf === null) return null;
  const light = inks?.light ?? '#1f2328';
  const dark = inks?.dark ?? '#e6edf3';
  const ll = luminance(light);
  const ld = luminance(dark);
  if (ll === null || ld === null) return lf > 0.4 ? light : dark;
  return contrast(lf, ll) >= contrast(lf, ld) ? light : dark;
}

/** Fill, stroke and text colour of a styled node; empty when the notation declares no style. */
export function nodeColours(style: NotationStyle | undefined, ink: Themed | null | undefined) {
  const fill = themed(style?.fill);
  const stroke = themed(style?.stroke);
  return { fill, stroke, text: fill ? readableInk(fill, ink) : null };
}

/** Corners per shape: the notation's shape, roughly, on the canvas's rectangular nodes. */
export function shapeRadius(shape: string | undefined): string | undefined {
  if (!shape) return undefined;
  if (shape === 'rounded-box' || shape === 'boundary-box') return '14px';
  if (shape === 'cylinder' || shape === 'queue') return '18px';
  if (shape === 'cloud') return '28px';
  if (shape === 'box' || shape === 'node-box' || shape === 'package' || shape === 'note') return '3px';
  return undefined;
}

/** SVG dash for a LinkDoc's line. */
export function dashFor(line: string | undefined): string | undefined {
  return line === 'dashed' ? '6 4' : line === 'dotted' ? '2 3' : undefined;
}
