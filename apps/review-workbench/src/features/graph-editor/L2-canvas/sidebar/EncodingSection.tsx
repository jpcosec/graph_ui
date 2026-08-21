import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_ENCODING_RULES, type EncodingRule } from '@/features/graph-editor/L2-canvas/encoding/encoding-rules';
import { useUIStore } from '@/stores/ui-store';

export function describeEncodingRule(rule: EncodingRule): string {
  if (rule.when.relationType) {
    return `relationType:${rule.when.relationType}`;
  }

  if (rule.when.nodeFacet) {
    return `nodeFacet:${rule.when.nodeFacet}${typeof rule.when.facetValue === 'undefined' ? '' : `=${String(rule.when.facetValue)}`}`;
  }

  return 'global';
}

export function updateEncodingRuleStyle(
  rules: EncodingRule[],
  index: number,
  patch: Partial<EncodingRule['style']>,
): EncodingRule[] {
  return rules.map((rule, ruleIndex) =>
    ruleIndex === index
      ? {
          ...rule,
          style: {
            ...rule.style,
            ...patch,
          },
        }
      : rule,
  );
}

export function toggleEditingRule(currentRuleIndex: number | null, nextRuleIndex: number): number | null {
  return currentRuleIndex === nextRuleIndex ? null : nextRuleIndex;
}

export function EncodingSection() {
  const activeEncodingRules = useUIStore((state) => state.activeEncodingRules);
  const setActiveEncodingRules = useUIStore((state) => state.setActiveEncodingRules);
  const resetActiveEncodingRules = useUIStore((state) => state.resetActiveEncodingRules);
  const setActiveViewId = useUIStore((state) => state.setActiveViewId);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  const rules = useMemo(() => activeEncodingRules, [activeEncodingRules]);

  return (
    <div className="space-y-3 px-3 pb-3" data-testid="encoding-section">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">Active encoding rules: {rules.length}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            resetActiveEncodingRules();
            setActiveViewId('default-view');
            setEditingRuleIndex(null);
          }}
        >
          Reset to defaults
        </Button>
      </div>

      <div className="space-y-2">
        {rules.map((rule, index) => {
          const isEditing = editingRuleIndex === index;
          return (
            <div key={`${describeEncodingRule(rule)}-${index}`} className="rounded-2xl border border-white/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{describeEncodingRule(rule)}</p>
                  <p className="text-xs text-muted-foreground">
                    style={JSON.stringify(rule.style)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingRuleIndex((current) => toggleEditingRule(current, index))}
                >
                  {isEditing ? 'Done' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <div className="mt-3 grid grid-cols-2 gap-2" data-testid={`encoding-rule-editor-${index}`}>
                  <Input
                    aria-label={`stroke color ${index}`}
                    placeholder="Stroke color"
                    value={rule.style.strokeColor ?? ''}
                    onChange={(event) => {
                      setActiveViewId(null);
                      setActiveEncodingRules(updateEncodingRuleStyle(rules, index, { strokeColor: event.target.value || undefined }));
                    }}
                  />
                  <select
                    aria-label={`stroke style ${index}`}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={rule.style.strokeStyle ?? 'solid'}
                    onChange={(event) => {
                      setActiveViewId(null);
                      setActiveEncodingRules(
                        updateEncodingRuleStyle(rules, index, {
                          strokeStyle: event.target.value as EncodingRule['style']['strokeStyle'],
                        }),
                      );
                    }}
                  >
                    <option value="solid">solid</option>
                    <option value="dashed">dashed</option>
                  </select>
                  <Input
                    aria-label={`stroke width ${index}`}
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Stroke width"
                    value={typeof rule.style.strokeWidth === 'number' ? String(rule.style.strokeWidth) : ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      setActiveViewId(null);
                      setActiveEncodingRules(
                        updateEncodingRuleStyle(rules, index, {
                          strokeWidth: value ? Number(value) : undefined,
                        }),
                      );
                    }}
                  />
                  <Input
                    aria-label={`node color token ${index}`}
                    placeholder="Node color token"
                    value={rule.style.nodeColorToken ?? ''}
                    onChange={(event) => {
                      setActiveViewId(null);
                      setActiveEncodingRules(updateEncodingRuleStyle(rules, index, { nodeColorToken: event.target.value || undefined }));
                    }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-white/10 px-3 py-2 text-[11px] text-muted-foreground">
        Filtering remains primary. Encoding only styles what the current graph filter already keeps visible.
      </div>
    </div>
  );
}

export const DEFAULT_ENCODING_RULE_COUNT = DEFAULT_ENCODING_RULES.length;
