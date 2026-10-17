/**
 * Mock client. Same pattern as review-workbench: fixtures + delay + zod.
 *
 * Deliberately not wired to SLDB. The mock forces the contract to be decided by
 * what we want to see, not by what /document/ir happens to return.
 */
import raw from './fixtures/knowledge.json';
import { knowledgeSchema, type Knowledge } from '@/schema/knowledge';

const delay = <T,>(v: T, ms = 60): Promise<T> =>
  new Promise((r) => setTimeout(() => r(v), ms));

let cache: Knowledge | null = null;

export function loadKnowledge(): Knowledge {
  if (cache) return cache;
  const parsed = knowledgeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Invalid knowledge fixture: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  }
  cache = parsed.data;
  return cache;
}

export const mockClient = {
  async getKnowledge() {
    return delay(loadKnowledge());
  },
};
