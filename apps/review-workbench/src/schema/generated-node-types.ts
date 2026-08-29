import { z } from 'zod';

import { detailRendererFor, PlaceholderDot, PlaceholderLabel } from './renderer-helpers';
import type { NodeTypeDefinition } from './registry.types';

export const generatedNodeTypes: NodeTypeDefinition[] = [
  {
    typeId: "conversation-step",
    label: "Conversation Step",
    icon: "message-square",
    category: "conversation",
    colorToken: "token-conversation",
    payloadSchema: z.object({
      "id": z.string().min(1),
      "title": z.string().min(1),
      "kind": z.enum(["interaccion_simple","obtencion_datos","handout","llamado_tool"]).default("interaccion_simple"),
      "instructions": z.string().min(1),
      "required_slots": z.string().optional(),
      "handout_target": z.string().optional(),
      "tool_ref": z.string().optional(),
      "allowed_transitions": z.string().optional(),
      "grounding_atoms": z.string().optional(),
      "tags": z.array(z.string()).optional(),
      "domain_ref": z.string().optional(),
      "completion_condition": z.string().optional()
    }),
    renderers: {
      dot: PlaceholderDot,
      label: PlaceholderLabel,
      detail: detailRendererFor("Conversation Step", "token-conversation"),
    },
    defaultSize: { width: 220, height: 100 },
    allowedConnections: [
  "conversation-step"
],
  }
];
