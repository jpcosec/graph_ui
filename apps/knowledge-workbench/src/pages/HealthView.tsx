/**
 * SALUD — can I trust this?
 *
 * Every check maps to one of the three rules (DESIGN.md §2) or to a graph
 * pathology. Nothing here is cosmetic.
 */
import { useMemo } from 'react';
import { useKnowledge } from '@/store/knowledge-store';
import { atomsWithoutProvenance, isolatedAtoms } from '@/lib/queries';
import { duplicatePairs, findCycles, unusedAtoms } from '@/lib/analysis';
import { cn } from '@/utils/cn';

interface Check {
  title: string;
  rule: string;
  severity: 'alert' | 'warn' | 'ok';
  items: { id: string; label: string; detail?: string }[];
  empty: string;
}

export function HealthView() {
  const { data, openAtom } = useKnowledge();

  const checks = useMemo<Check[]>(() => {
    const noProv = atomsWithoutProvenance(data);
    const isolated = isolatedAtoms(data);
    const unused = unusedAtoms(data);
    const cycles = findCycles(data);
    const dupes = duplicatePairs(data);

    return [
      {
        title: 'Sin origen',
        rule: 'Regla 2 · todo hecho tiene origen',
        severity: noProv.length ? 'alert' : 'ok',
        items: noProv.map((a) => ({ id: a.id, label: a.title, detail: 'no se puede auditar' })),
        empty: 'Todos los hechos tienen procedencia.',
      },
      {
        title: 'Posibles duplicados',
        rule: 'Regla 1 · un hecho, un lugar',
        severity: dupes.length ? 'warn' : 'ok',
        items: dupes.map((d) => ({
          id: d.a.id,
          label: `${d.a.title}  ≈  ${d.b.title}`,
          detail: `${Math.round(d.score * 100)}% de solape`,
        })),
        empty: 'Ningún par sospechoso.',
      },
      {
        title: 'Aislados',
        rule: 'sin ninguna relación',
        severity: isolated.length ? 'warn' : 'ok',
        items: isolated.map((a) => ({ id: a.id, label: a.title })),
        empty: 'Todo hecho se conecta con algo.',
      },
      {
        title: 'Sin usar',
        rule: 'ningún documento los muestra',
        severity: unused.length ? 'warn' : 'ok',
        items: unused.map((a) => ({ id: a.id, label: a.title })),
        empty: 'Todos los hechos aparecen en algún documento.',
      },
      {
        title: 'Circulares',
        rule: 'razonamiento circular',
        severity: cycles.length ? 'alert' : 'ok',
        items: cycles.map((c, i) => ({ id: `cycle-${i}`, label: c.join(' → ') })),
        empty: 'Ninguno.',
      },
    ];
  }, [data]);

  const problems = checks.filter((c) => c.severity !== 'ok').length;

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Salud del conocimiento</h1>
        <span
          className={cn(
            'font-mono text-[11px]',
            problems ? 'text-amber-300/90' : 'text-emerald-400/90',
          )}
        >
          {problems ? `⬤ ${problems} con hallazgos` : '◯ sin hallazgos'}
        </span>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <section
            key={check.title}
            className={cn(
              'rounded-2xl border p-4',
              check.severity === 'alert'
                ? 'border-amber-500/25 bg-amber-500/[0.05]'
                : check.severity === 'warn'
                  ? 'border-white/12 bg-white/[0.025]'
                  : 'border-white/[0.07] bg-white/[0.015]',
            )}
          >
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-xs',
                  check.severity === 'alert'
                    ? 'text-amber-400'
                    : check.severity === 'warn'
                      ? 'text-muted-foreground'
                      : 'text-emerald-500/70',
                )}
              >
                {check.severity === 'ok' ? '◯' : '⬤'}
              </span>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface">
                {check.title}
              </h2>
              <span className="text-[10px] text-muted-foreground">{check.rule}</span>
              {check.items.length > 0 && (
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {check.items.length}
                </span>
              )}
            </div>

            {check.items.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{check.empty}</p>
            ) : (
              <ul className="mt-2.5 space-y-1">
                {/* Keyed by check + id: the same atom legitimately shows up in
                    several checks, and duplicate pairs repeat an id. */}
                {check.items.map((item, i) => (
                  <li key={`${check.title}/${item.id}/${i}`}>
                    <button
                      onClick={() => item.id.startsWith('atom-') && openAtom(item.id)}
                      className="flex w-full items-center gap-2 text-left text-xs text-on-surface/80 hover:text-primary"
                    >
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.detail && (
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {item.detail}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Al conectar contra SLDB se suma <span className="font-mono">divergencia</span>: documentos
        donde el texto y el índice no coinciden. Sale del par <span className="font-mono">hash_c</span>{' '}
        (texto) / <span className="font-mono">hash_d</span> (campos) que ya calcula{' '}
        <span className="font-mono">stores check</span>.
      </p>
    </div>
  );
}
