import { beforeEach, describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { DEFAULT_ENCODING_RULES } from '@/features/graph-editor/L2-canvas/encoding/encoding-rules';
import { useUIStore } from '@/stores/ui-store';

import {
  DEFAULT_ENCODING_RULE_COUNT,
  EncodingSection,
  describeEncodingRule,
  toggleEditingRule,
  updateEncodingRuleStyle,
} from './EncodingSection';

beforeEach(() => {
  useUIStore.setState(useUIStore.getInitialState(), true);
});

describe('EncodingSection', () => {
  it('renders the active encoding controls and rule count', () => {
    const markup = renderToStaticMarkup(<EncodingSection />);

    expect(markup).toContain('Reset to defaults');
    expect(markup).toContain('Active encoding rules');
    expect(DEFAULT_ENCODING_RULE_COUNT).toBe(DEFAULT_ENCODING_RULES.length);
  });

  it('toggles edit mode for a selected rule index', () => {
    expect(toggleEditingRule(null, 2)).toBe(2);
    expect(toggleEditingRule(2, 2)).toBeNull();
  });

  it('updates stroke and node style fields without mutating other rules', () => {
    const nextRules = updateEncodingRuleStyle(DEFAULT_ENCODING_RULES, 0, {
      strokeColor: '#123456',
      nodeColorToken: 'token-accent',
    });

    expect(nextRules[0].style.strokeColor).toBe('#123456');
    expect(nextRules[0].style.nodeColorToken).toBe('token-accent');
    expect(nextRules[1]).toEqual(DEFAULT_ENCODING_RULES[1]);
    expect(describeEncodingRule(DEFAULT_ENCODING_RULES[0])).toContain('relationType:');
  });
});
