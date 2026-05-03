import { Activity, Bot, Brain, Database, FileCode2, Gauge, Wrench } from 'lucide-react';
import type { ComponentType } from 'react';

type HumRendererProps = {
  title?: string;
  category?: string;
  properties?: Record<string, string>;
  visualToken?: string;
  colorToken?: string;
  badges?: string[];
};

function resolveColor(colorToken?: string): string {
  if (!colorToken) {
    return 'var(--surface-primary)';
  }

  if (colorToken.startsWith('var(')) {
    return colorToken;
  }

  return `var(--${colorToken})`;
}

function iconForCategory(category?: string) {
  switch (category?.toLowerCase()) {
    case 'body':
    case 'hum body':
      return Bot;
    case 'organ':
      return Brain;
    case 'capability':
      return Wrench;
    case 'artifact':
      return FileCode2;
    case 'routine-step':
    case 'routine step':
      return Activity;
    case 'trace-event':
    case 'trace event':
      return Gauge;
    default:
      return Database;
  }
}

export const HumDot: ComponentType<{ colorToken: string }> = ({ colorToken }) => (
  <div className="h-4 w-4 rounded-full border border-white/25" style={{ backgroundColor: resolveColor(colorToken) }} />
);

export const HumLabel: ComponentType<{ title: string; icon: string }> = ({ title }) => (
  <span className="max-w-[220px] truncate font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface">{title}</span>
);

export const HumCard: ComponentType<unknown> = (rawProps) => {
  const { title, category, properties, visualToken, colorToken, badges } = (rawProps ?? {}) as HumRendererProps;
  const Icon = iconForCategory(category);
  const color = resolveColor(visualToken ?? colorToken);
  const entries = Object.entries(properties ?? {});

  return (
    <div
      className="min-w-[220px] rounded-2xl border bg-[rgba(7,12,17,0.94)] p-3 text-on-surface shadow-[0_14px_40px_rgba(0,0,0,0.3)]"
      style={{ borderColor: color, boxShadow: `0 0 0 1px ${color}22, 0 14px 40px rgba(0,0,0,0.3)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-xl border p-1.5" style={{ borderColor: color, color }}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="max-w-[250px] text-sm font-semibold leading-tight text-white/95">{title ?? 'Untitled'}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{category ?? 'entity'}</p>
          </div>
        </div>
      </div>

      {badges && badges.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          {entries.slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">{key}</span>
              <span className="truncate">{value}</span>
            </div>
          ))}
          {entries.length > 4 ? <div className="text-[10px] text-white/45">+{entries.length - 4} more</div> : null}
        </div>
      ) : null}
    </div>
  );
};
