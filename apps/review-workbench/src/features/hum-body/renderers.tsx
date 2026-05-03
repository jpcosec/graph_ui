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

function variantForCategory(category?: string): 'body' | 'organ' | 'capability' | 'artifact' | 'routine' | 'trace' | 'file' | 'form' | 'default' {
  switch (category?.toLowerCase()) {
    case 'hum body':
    case 'body':
      return 'body';
    case 'organ':
      return 'organ';
    case 'capability':
      return 'capability';
    case 'artifact':
      return 'artifact';
    case 'routine step':
    case 'routine-step':
      return 'routine';
    case 'trace event':
    case 'trace-event':
      return 'trace';
    case 'lisp file':
      return 'file';
    case 'lisp form':
      return 'form';
    default:
      return 'default';
  }
}

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
  <span className="max-w-[220px] truncate font-mono text-[10px] tracking-[0.08em] text-on-surface">{title}</span>
);

export const HumCard: ComponentType<unknown> = (rawProps) => {
  const { title, category, properties, visualToken, colorToken, badges } = (rawProps ?? {}) as HumRendererProps;
  const Icon = iconForCategory(category);
  const color = resolveColor(visualToken ?? colorToken);
  const entries = Object.entries(properties ?? {});
  const variant = variantForCategory(category);

  const cardClass = {
    body: 'min-w-[260px] rounded-[1.6rem] border bg-[radial-gradient(circle_at_top,rgba(0,242,255,0.16),transparent_55%),rgba(7,12,17,0.96)] p-4',
    organ: 'min-w-[210px] rounded-[1.35rem] border bg-[rgba(8,13,18,0.95)] p-3.5',
    capability: 'min-w-[210px] rounded-[1.2rem] border bg-[rgba(10,14,18,0.94)] p-3',
    artifact: 'min-w-[190px] rounded-[1.1rem] border bg-[rgba(11,14,18,0.9)] p-2.5',
    routine: 'min-w-[230px] rounded-[1.3rem] border bg-[linear-gradient(180deg,rgba(11,28,19,0.92),rgba(8,16,12,0.88))] p-3',
    trace: 'min-w-[230px] rounded-[1.3rem] border bg-[linear-gradient(180deg,rgba(39,20,8,0.92),rgba(20,11,8,0.88))] p-3',
    file: 'min-w-[260px] rounded-[1rem] border border-dashed bg-[rgba(9,13,18,0.28)] p-2.5 shadow-none',
    form: 'min-w-[220px] rounded-[0.95rem] border bg-[rgba(12,16,21,0.9)] p-2.5 shadow-[0_6px_24px_rgba(0,0,0,0.18)]',
    default: 'min-w-[220px] rounded-2xl border bg-[rgba(7,12,17,0.94)] p-3',
  }[variant];

  const titleClass = {
    file: 'max-w-[280px] text-[12px] font-semibold leading-tight text-white/92',
    form: 'max-w-[280px] text-[12px] font-medium leading-snug text-white/88',
    artifact: 'max-w-[250px] text-[12px] font-medium leading-tight text-white/86',
    default: 'max-w-[250px] text-sm font-semibold leading-tight text-white/95',
  } as const;

  const categoryClass = variant === 'form'
    ? 'mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/42'
    : 'mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground';

  return (
    <div
      className={`${cardClass} text-on-surface`}
      style={{
        borderColor: `${color}${variant === 'file' ? '55' : '88'}`,
        boxShadow: variant === 'file' ? undefined : `0 0 0 1px ${color}18, 0 14px 36px rgba(0,0,0,0.22)`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <div className="rounded-xl border p-1.5" style={{ borderColor: `${color}77`, color, backgroundColor: `${color}12` }}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className={titleClass[variant as keyof typeof titleClass] ?? titleClass.default}>{title ?? 'Untitled'}</p>
            <p className={categoryClass}>{category ?? 'entity'}</p>
          </div>
        </div>
      </div>

      {badges && badges.length > 0 && variant !== 'file' ? (
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
          {entries.slice(0, variant === 'file' ? 2 : 4).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">{key}</span>
              <span className="truncate">{value}</span>
            </div>
          ))}
          {entries.length > (variant === 'file' ? 2 : 4) ? <div className="text-[10px] text-white/45">+{entries.length - (variant === 'file' ? 2 : 4)} more</div> : null}
        </div>
      ) : null}
    </div>
  );
};
