import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

import { dashFor, nodeColours, themed } from '@/features/graph-editor/lib/notation-style';
import type { NotationStyle } from '@/features/graph-editor/lib/views-provider';
import { useViewStore } from '@/stores/view-store';

function Swatch({ style }: { style: NotationStyle }) {
  const { fill, stroke } = nodeColours(style, null);
  return (
    <span
      className="inline-block h-3.5 w-6 shrink-0 rounded-sm border"
      style={{ background: fill ?? 'transparent', borderColor: stroke ?? 'rgba(148,163,184,0.6)' }}
    />
  );
}

/**
 * The legend of the applied view's notation (spec2viz `resolve_documents`): each glyph with its
 * shape, fill and icon, the kinds the palette styles, and each link with its line and colour. It
 * lives in the sidebar, under the views, so it never covers the diagram.
 */
export function ViewLegend() {
  const notation = useViewStore((state) => state.notation);
  const legend = notation?.legend;
  if (notation?.error) {
    return (
      <div data-testid="view-notation-error" className="rounded-md border border-amber-500/40 px-3 py-2 text-[11px] text-amber-200">
        {notation.error}
      </div>
    );
  }
  if (!legend || legend.glyphs.length + legend.kinds.length + legend.links.length === 0) return null;
  return (
    <section
        data-testid="view-legend"
        data-notation={notation?.notation}
        aria-label="Notation legend"
        className="rounded-2xl border border-white/10 px-3 py-2 text-[11px] text-white/80"
      >
        <h3 className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
          Legend · {String(notation?.notation ?? '').replace(/^NotationDoc:/, '')}
        </h3>
        <ul className="space-y-1">
          {legend.glyphs.map((g) => (
            <li key={g.glyph} className="legend-glyph flex items-center gap-2" data-glyph={g.glyph} data-shape={g.shape}
              data-fill={themed(g.style?.fill) ?? ''} data-icon={g.style?.icon ?? ''}>
              <Swatch style={g.style} />
              {g.style?.icon ? <DynamicIcon name={g.style.icon as IconName} size={12} /> : null}
              <span className="flex-1 truncate">{g.title}</span>
              <small className="text-white/40">{g.shape}</small>
            </li>
          ))}
          {legend.kinds.map((k) => (
            <li key={k.kind} className="legend-kind flex items-center gap-2" data-kind={k.kind} data-fill={themed(k.style?.fill) ?? ''}>
              <Swatch style={k.style} />
              {k.style?.icon ? <DynamicIcon name={k.style.icon as IconName} size={12} /> : null}
              <span className="flex-1 truncate">{k.kind}</span>
              <small className="text-white/40">kind</small>
            </li>
          ))}
          {legend.links.map((l) => (
            <li key={l.link} className="legend-link flex items-center gap-2" data-link={l.link} data-color={themed(l.color) ?? ''}>
              <svg width="24" height="8" aria-hidden="true">
                <line x1="0" y1="4" x2="24" y2="4" strokeWidth="2" stroke={themed(l.color) ?? 'rgba(148,163,184,0.8)'} strokeDasharray={dashFor(l.line)} />
              </svg>
              <span className="flex-1 truncate">{l.title}</span>
              <small className="text-white/40">{l.relation === '*' ? 'any' : l.relation}</small>
            </li>
          ))}
        </ul>
      </section>
  );
}
