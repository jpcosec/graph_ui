import { createElement } from 'react';

import { EntityCard } from '@/components/content/EntityCard';
import { PlaceholderNode } from '@/components/content/PlaceholderNode';

export function PlaceholderDot({ colorToken }: { colorToken: string }) {
  return createElement(PlaceholderNode, { colorToken });
}

export function PlaceholderLabel({ title }: { title: string }) {
  return createElement('span', { className: 'text-xs' }, title);
}

function toEntityCardProps(props: unknown, fallbackCategory: string, fallbackVisualToken: string) {
  const candidate = props && typeof props === 'object' ? (props as Record<string, unknown>) : {};

  const titleCandidate = candidate.title ?? candidate.name;
  const title = typeof titleCandidate === 'string' && titleCandidate.trim().length > 0
    ? titleCandidate
    : 'Untitled';

  const category =
    typeof candidate.category === 'string' && candidate.category.trim().length > 0
      ? candidate.category
      : fallbackCategory;

  const visualToken =
    typeof candidate.visualToken === 'string' && candidate.visualToken.trim().length > 0
      ? candidate.visualToken
      : fallbackVisualToken;

  const badges = Array.isArray(candidate.badges)
    ? candidate.badges.filter((badge): badge is string => typeof badge === 'string')
    : undefined;

  const propertiesSource =
    candidate.properties && typeof candidate.properties === 'object'
      ? (candidate.properties as Record<string, unknown>)
      : {};

  const properties = Object.fromEntries(
    Object.entries(propertiesSource).map(([key, value]) => [key, String(value)]),
  );

  return {
    title,
    category,
    properties,
    badges,
    visualToken,
  };
}

export function detailRendererFor(category: string, visualToken: string) {
  return (props: unknown) =>
    createElement(EntityCard, toEntityCardProps(props, category, visualToken));
}
