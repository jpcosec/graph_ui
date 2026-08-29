import { useEffect, useMemo, useState } from 'react';

import { PropertyEditor } from '@/components/content/PropertyEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { sldbProvider } from '@/features/graph-editor/lib/sldb-provider';
import { pairsFromRecord, recordFromPairs } from '@/lib/utils';
import { registry } from '@/schema/registry';
import type { FieldDescriptor } from '@/schema/registry.types';
import type { NodePayload } from '@/stores/types';
import { useGraphStore } from '@/stores/graph-store';
import { useUIStore } from '@/stores/ui-store';

interface NodeInspectorDraft {
  title: string;
  properties: Record<string, string>;
}

interface TypedNodeInspectorDraft {
  values: Record<string, unknown>;
}

const CURATED_FIELDS = new Set([
  'id',
  'title',
  'kind',
  'instructions',
  'required_slots',
  'handout_target',
  'tool_ref',
  'allowed_transitions',
  'grounding_atoms',
  'completion_condition',
  'domain_ref',
  'tags',
]);

const SKIP_FIELDS = new Set(['embedding', 'semantic_anchors', 'parent']);
const LONG_TEXT_FIELDS = new Set(['instructions', 'summary', 'completion_condition']);

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function asDataRecord(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object') {
    return data as Record<string, unknown>;
  }
  return {};
}

function getNodeTitle(data: Record<string, unknown>): string {
  if ('label' in data && typeof data.label === 'string') {
    return data.label;
  }
  if ('name' in data && typeof data.name === 'string') {
    return data.name;
  }
  const title = data.name ?? data.title;
  return typeof title === 'string' ? title : '';
}

function setNodeTitle(payload: Record<string, unknown>, title: string): Record<string, unknown> {
  if ('title' in payload && !('name' in payload)) {
    return { ...payload, title };
  }

  return { ...payload, name: title };
}

function shouldUseTypedInspector(typeId: string | undefined): boolean {
  if (!typeId) {
    return false;
  }

  return Boolean(registry.get(typeId)?.fields?.length);
}

function getTypedFields(typeId: string | undefined): FieldDescriptor[] {
  if (!typeId) {
    return [];
  }

  return (registry.get(typeId)?.fields ?? []).filter(
    (field) => CURATED_FIELDS.has(field.name) && !SKIP_FIELDS.has(field.name),
  );
}

function normalizeInitialValue(field: FieldDescriptor, value: unknown): unknown {
  if ((field.kind === 'stringlist' || field.kind === 'enumlist' || field.kind === 'list') && Array.isArray(value)) {
    return value.map((item) => String(item)).join('\n');
  }

  if (field.kind === 'boolean') {
    return Boolean(value);
  }

  if ((field.kind === 'integer' || field.kind === 'number') && typeof value === 'number') {
    return value;
  }

  return value ?? '';
}

function normalizeTypedValue(field: FieldDescriptor, value: unknown): unknown {
  if (field.name === 'id') {
    return value;
  }

  if (field.kind === 'stringlist' || field.kind === 'enumlist' || field.kind === 'list') {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    return String(value ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (field.kind === 'boolean') {
    return Boolean(value);
  }

  if (field.kind === 'integer') {
    if (value === '') {
      return '';
    }
    return Number.parseInt(String(value), 10);
  }

  if (field.kind === 'number') {
    if (value === '') {
      return '';
    }
    return Number(value);
  }

  return String(value ?? '');
}

function toStringProperties(payload: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(payload).flatMap(([key, value]) => {
      if (value === undefined || value === null) {
        return [];
      }

      if (Array.isArray(value)) {
        return [[key, value.map((item) => String(item)).join('\n')]];
      }

      if (typeof value === 'object') {
        return [[key, JSON.stringify(value)]];
      }

      return [[key, String(value)]];
    }),
  );
}

function TypedFieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const testId = `field-${field.name}`;
  const isReadonly = field.name === 'id';
  const usesTextarea = field.kind === 'stringlist'
    || field.kind === 'enumlist'
    || field.kind === 'list'
    || LONG_TEXT_FIELDS.has(field.name)
    || field.name.endsWith('_condition');

  if (field.kind === 'enum' && field.enum?.length) {
    return (
      <select
        id={testId}
        data-testid={testId}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={String(value ?? '')}
        disabled={isReadonly}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select…</option>
        {field.enum.map((option) => (
          <option key={String(option)} value={String(option)}>
            {String(option)}
          </option>
        ))}
      </select>
    );
  }

  if (field.kind === 'boolean') {
    return (
      <input
        id={testId}
        data-testid={testId}
        type="checkbox"
        checked={Boolean(value)}
        disabled={isReadonly}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  if (field.kind === 'integer' || field.kind === 'number') {
    return (
      <Input
        id={testId}
        data-testid={testId}
        type="number"
        value={String(value ?? '')}
        readOnly={isReadonly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (usesTextarea) {
    return (
      <textarea
        id={testId}
        data-testid={testId}
        className="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={String(value ?? '')}
        readOnly={isReadonly}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      id={testId}
      data-testid={testId}
      value={String(value ?? '')}
      readOnly={isReadonly}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function NodeInspector() {
  const focusedNodeId = useUIStore((state) => state.focusedNodeId);
  const setFocusedNode = useUIStore((state) => state.setFocusedNode);
  const setEditorState = useUIStore((state) => state.setEditorState);

  const nodes = useGraphStore((state) => state.nodes);
  const updateNode = useGraphStore((state) => state.updateNode);

  const node = useMemo(
    () => nodes.find((candidate) => candidate.id === focusedNodeId) ?? null,
    [focusedNodeId, nodes],
  );

  const [draft, setDraft] = useState<NodeInspectorDraft | null>(null);
  const [typedDraft, setTypedDraft] = useState<TypedNodeInspectorDraft | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!node) {
      setDraft(null);
      setTypedDraft(null);
      setSaveError(null);
      return;
    }

    const asJson = asDataRecord(node.data);
    const title = getNodeTitle(asJson);
    const properties = asJson.properties as Record<string, string> | undefined;
    const payload = asRecord((asJson.payload as NodePayload | undefined)?.value ?? {});
    const typeId = typeof asJson.typeId === 'string' ? asJson.typeId : undefined;

    setDraft({
      title,
      properties: properties ?? {},
    });

    if (shouldUseTypedInspector(typeId)) {
      const values = Object.fromEntries(
        getTypedFields(typeId).map((field) => [field.name, normalizeInitialValue(field, payload[field.name])]),
      );
      setTypedDraft({ values });
    } else {
      setTypedDraft(null);
    }

    setSaveError(null);
  }, [node]);

  const handleClose = () => {
    setFocusedNode(null);
    setEditorState('browse');
    setSaveError(null);
    setIsSaving(false);
  };

  const handleFallbackSave = () => {
    if (!node || !draft) {
      return;
    }

    const asJson = asDataRecord(node.data);
    const existingPayload = asJson.payload as NodePayload | undefined;
    const existingValue = existingPayload?.value;
    const payloadRecord = asRecord(existingValue ?? {});

    const safeTypeId = (existingPayload?.typeId ?? asJson.typeId ?? 'unknown') as string;
    const newPayload: NodePayload = {
      typeId: safeTypeId || 'unknown',
      value: setNodeTitle(payloadRecord, draft.title),
    };

    updateNode(node.id, {
      data: {
        ...node.data,
        ...(asJson.label !== undefined ? { label: draft.title } : {}),
        ...(asJson.name !== undefined ? { name: draft.title } : {}),
        payload: newPayload,
        properties: draft.properties,
      },
    });

    handleClose();
  };

  const handleTypedSave = async () => {
    if (!node || !typedDraft) {
      return;
    }

    const asJson = asDataRecord(node.data);
    const typeId = typeof asJson.typeId === 'string' ? asJson.typeId : undefined;
    const existingPayload = asJson.payload as NodePayload | undefined;
    const payloadRecord = asRecord(existingPayload?.value ?? {});
    const fields = getTypedFields(typeId);

    const editedFields = Object.fromEntries(
      fields.map((field) => [field.name, normalizeTypedValue(field, typedDraft.values[field.name])]),
    );
    const nextPayload = {
      ...payloadRecord,
      ...editedFields,
    };

    const nextTitleCandidate = nextPayload.title;
    const nextTitle = typeof nextTitleCandidate === 'string' && nextTitleCandidate.trim().length > 0
      ? nextTitleCandidate
      : getNodeTitle(asJson);

    setIsSaving(true);
    setSaveError(null);

    try {
      await sldbProvider.saveDoc(node.id, nextPayload);

      updateNode(node.id, {
        data: {
          ...node.data,
          label: nextTitle,
          payload: {
            typeId: existingPayload?.typeId ?? typeId ?? 'unknown',
            value: nextPayload,
          },
          properties: toStringProperties(nextPayload),
        },
      });

      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const open = focusedNodeId !== null && node !== null && draft !== null;
  if (!open || !node || !draft) {
    return null;
  }

  const asJson = asDataRecord(node.data);
  const typeId = asJson.typeId as string | undefined;
  const typedFields = getTypedFields(typeId);
  const showTypedInspector = typedFields.length > 0 && typedDraft !== null;

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <SheetContent side="right" className="flex w-[400px] flex-col sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Edit Node</SheetTitle>
          <SheetDescription>
            {typeId ?? 'unknown'} ({node.id})
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          {showTypedInspector ? (
            <div className="space-y-4">
              {typedFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                    {field.name}
                    {field.required ? <span className="ml-1 text-xs text-primary">required</span> : null}
                    {field.name === 'id' ? <span className="ml-1 text-xs text-muted-foreground">readonly</span> : null}
                  </label>
                  <TypedFieldEditor
                    field={field}
                    value={typedDraft.values[field.name]}
                    onChange={(value) =>
                      setTypedDraft((current) => (
                        current
                          ? {
                              values: {
                                ...current.values,
                                [field.name]: value,
                              },
                            }
                          : current
                      ))
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="text-sm font-medium">Name</div>
                <Input
                  id="node-name"
                  data-testid="node-name-input"
                  value={draft.title}
                  onChange={(event) => setDraft((current) => (current ? { ...current, title: event.target.value } : current))}
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Properties</div>
                <PropertyEditor
                  pairs={pairsFromRecord(draft.properties)}
                  onChange={(pairs) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            properties: recordFromPairs(pairs),
                          }
                        : current,
                    )
                  }
                />
              </div>
            </>
          )}

          {saveError ? <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{saveError}</div> : null}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              if (showTypedInspector) {
                void handleTypedSave();
                return;
              }

              handleFallbackSave();
            }}
            data-testid="node-inspector-save"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
