import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InlineEditProps {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
}

/** Click to edit, blur or Ctrl+Enter to commit, Escape to cancel. */
export function InlineEdit({ value, onCommit, multiline, className, placeholder }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      ref.current.selectionStart = ref.current.value.length;
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className={cn('group relative cursor-text rounded-md px-2 py-1 -mx-2 hover:bg-white/[0.04]', className)}
        onClick={() => setEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
      >
        {value || <span className="text-muted-foreground">{placeholder}</span>}
        <Pencil
          size={12}
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-40"
        />
      </div>
    );
  }

  const shared = {
    ref: ref as never,
    value: draft,
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
      if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) commit();
    },
    className: cn(
      'w-full rounded-md border border-primary/40 bg-black/30 px-2 py-1 outline-none',
      className,
    ),
  };

  return multiline ? <textarea rows={5} {...shared} /> : <input {...shared} />;
}
