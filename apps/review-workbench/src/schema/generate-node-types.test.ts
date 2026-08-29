import { describe, expect, it } from 'vitest';

import { generatedNodeTypes } from './generated-node-types';

describe('generatedNodeTypes', () => {
  it('generates the conversation-step node type from the real descriptor', () => {
    const conversationStep = generatedNodeTypes.find((definition) => definition.typeId === 'conversation-step');

    expect(conversationStep).toBeDefined();

    const validPayload = conversationStep?.payloadSchema.safeParse({
      id: 'step-1',
      title: 'Greeting',
      instructions: 'Ask the user how you can help.',
    });
    const missingInstructions = conversationStep?.payloadSchema.safeParse({
      id: 'step-1',
      title: 'Greeting',
    });

    expect(validPayload?.success).toBe(true);
    expect(missingInstructions?.success).toBe(false);
    expect(conversationStep?.allowedConnections).toEqual(['conversation-step']);
  });
});
