import type { HumViewMode } from './types';

export interface HumModeMeta {
  eyebrow: string;
  title: string;
  description: string;
  accentClass: string;
  lens: string;
  note: string;
}

export interface HumLayoutPreset {
  shellVariant: 'default' | 'compact';
  contentTopInset: number;
  overlayPlacement: 'canvas' | 'sidebar';
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  workspace: {
    label: string;
    title: string;
    description: string;
  };
  modeMeta: HumModeMeta;
}

export const humModeMeta: Record<HumViewMode, HumModeMeta> = {
  structure: {
    eyebrow: 'Source Topology',
    title: 'Read the Lisp organism as a calm expandable archive',
    description: 'Files become containers, top-level forms become rows, and structural links stay quiet until you need them.',
    accentClass: 'hum-mode-structure',
    lens: 'Topological lens',
    note: 'Start here when you need location and provenance before meaning.',
  },
  body: {
    eyebrow: 'Embodied View',
    title: 'See the shell as organs, capabilities, and memory tissue',
    description: 'Packages are anatomy, tools are embodied actuators, and state artifacts remain peripheral but legible.',
    accentClass: 'hum-mode-body',
    lens: 'Anatomical lens',
    note: 'Use this to understand what HUM is, not what it just did.',
  },
  routine: {
    eyebrow: 'Normative Flow',
    title: 'Trace the intended pathway through the body',
    description: 'Canonical steps align across organs so the expected choreography reads before the concrete execution.',
    accentClass: 'hum-mode-routine',
    lens: 'Routine lens',
    note: 'Routine mode should answer what ought to happen.',
  },
  trace: {
    eyebrow: 'Observed Run',
    title: 'Replay an actual path and inspect its pressure points',
    description: 'Events become the foreground and the body fades into the support structure behind them.',
    accentClass: 'hum-mode-trace',
    lens: 'Forensic lens',
    note: 'Use this when debugging a concrete execution.',
  },
  compare: {
    eyebrow: 'Divergence View',
    title: 'Compare the intended routine against what the trace really did',
    description: 'Routine and trace sit in tension so loops, skips, and substitutions become immediately visible.',
    accentClass: 'hum-mode-compare',
    lens: 'Deviation lens',
    note: 'Compare mode is the diagnosis surface.',
  },
};

export const humLayoutPresets: Record<HumViewMode, HumLayoutPreset> = {
  structure: {
    shellVariant: 'compact',
    contentTopInset: 0,
    overlayPlacement: 'sidebar',
    hero: {
      eyebrow: humModeMeta.structure.eyebrow,
      title: humModeMeta.structure.title,
      description: humModeMeta.structure.description,
    },
    workspace: {
      label: humModeMeta.structure.lens,
      title: 'HUM observatory',
      description: 'Source-first reading surface',
    },
    modeMeta: humModeMeta.structure,
  },
  body: {
    shellVariant: 'default',
    contentTopInset: 154,
    overlayPlacement: 'canvas',
    hero: {
      eyebrow: humModeMeta.body.eyebrow,
      title: humModeMeta.body.title,
      description: humModeMeta.body.description,
    },
    workspace: {
      label: humModeMeta.body.lens,
      title: 'HUM observatory',
      description: 'Projection tuned to the active lens',
    },
    modeMeta: humModeMeta.body,
  },
  routine: {
    shellVariant: 'default',
    contentTopInset: 154,
    overlayPlacement: 'canvas',
    hero: {
      eyebrow: humModeMeta.routine.eyebrow,
      title: humModeMeta.routine.title,
      description: humModeMeta.routine.description,
    },
    workspace: {
      label: humModeMeta.routine.lens,
      title: 'HUM observatory',
      description: 'Projection tuned to the active lens',
    },
    modeMeta: humModeMeta.routine,
  },
  trace: {
    shellVariant: 'default',
    contentTopInset: 154,
    overlayPlacement: 'canvas',
    hero: {
      eyebrow: humModeMeta.trace.eyebrow,
      title: humModeMeta.trace.title,
      description: humModeMeta.trace.description,
    },
    workspace: {
      label: humModeMeta.trace.lens,
      title: 'HUM observatory',
      description: 'Projection tuned to the active lens',
    },
    modeMeta: humModeMeta.trace,
  },
  compare: {
    shellVariant: 'default',
    contentTopInset: 154,
    overlayPlacement: 'canvas',
    hero: {
      eyebrow: humModeMeta.compare.eyebrow,
      title: humModeMeta.compare.title,
      description: humModeMeta.compare.description,
    },
    workspace: {
      label: humModeMeta.compare.lens,
      title: 'HUM observatory',
      description: 'Projection tuned to the active lens',
    },
    modeMeta: humModeMeta.compare,
  },
};
