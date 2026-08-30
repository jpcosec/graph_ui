// Conversation-step node card, ported from gemini_test flow_editor's StepNode.
// Icon + color per StepKind, colored left border, kind label in mono. Does NOT
// dump the raw payload (no embedding/floats) — shows title + kind + a short
// instructions preview only.

const STEP_KINDS: Record<
  string,
  { label: string; dot: string; border: string; bg: string; icon: string }
> = {
  interaccion_simple: { label: 'Interacción simple', dot: '#e6a85c', border: 'rgba(230,168,92,.5)', bg: 'rgba(230,168,92,.07)', icon: '💬' },
  obtencion_datos: { label: 'Obtención de datos', dot: '#c97db9', border: 'rgba(201,125,185,.5)', bg: 'rgba(201,125,185,.07)', icon: '📝' },
  handout: { label: 'Handout', dot: '#7fb3d5', border: 'rgba(127,179,213,.5)', bg: 'rgba(127,179,213,.07)', icon: '🤝' },
  llamado_tool: { label: 'Llamado a tool', dot: '#7cba7c', border: 'rgba(124,186,124,.5)', bg: 'rgba(124,186,124,.07)', icon: '⚙️' },
};

function readString(source: Record<string, unknown>, key: string): string {
  const value = source[key];
  return typeof value === 'string' ? value : '';
}

export function StepCard(rawProps: unknown) {
  const props =
    rawProps && typeof rawProps === 'object' ? (rawProps as Record<string, unknown>) : {};
  const title =
    (typeof props.title === 'string' && props.title.trim().length > 0 && props.title) || 'Untitled';
  const properties =
    props.properties && typeof props.properties === 'object'
      ? (props.properties as Record<string, unknown>)
      : {};

  // kind can arrive at the top level (payload spread) or inside properties.
  const kind = readString(props, 'kind') || readString(properties, 'kind') || 'interaccion_simple';
  const instructions = readString(props, 'instructions') || readString(properties, 'instructions');

  const c = STEP_KINDS[kind] ?? STEP_KINDS.interaccion_simple;
  const preview = instructions.length > 90 ? `${instructions.slice(0, 90)}…` : instructions;

  return (
    <div
      style={{
        border: '2px solid rgba(212,165,116,.12)',
        borderLeft: `4px solid ${c.border}`,
        background: c.bg,
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 200,
        maxWidth: 260,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 14 }}>{c.icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#f5f0e8', lineHeight: 1.2 }}>{title}</span>
      </div>
      <div
        style={{
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: c.dot,
          opacity: 0.85,
        }}
      >
        {c.label}
      </div>
      {preview ? (
        <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.45, color: 'rgba(245,240,232,.55)' }}>
          {preview}
        </div>
      ) : null}
    </div>
  );
}
