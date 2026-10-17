/**
 * Live test against a running `sldb serve`. Skipped when unreachable.
 *   cd /home/jp/AntonIA/projects/teva/MercadoPublico
 *   python3 -m sldb serve --store .sldb --pythonpath /home/jp/AntonIA --port 8810 --cors
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { detectAtomModel, listDocuments, fetchDocument, documentToAtom, loadFromSldb } from './sldb';

const BASE = 'http://127.0.0.1:8810';
let up = false;
beforeAll(async () => {
  try { up = (await fetch(`${BASE}/models`)).ok; } catch { up = false; }
});

describe.runIf(process.env.SLDB_LIVE === '1')('sldb adapter (live)', () => {
  it('detects the atom model', async () => {
    expect((await detectAtomModel()).name).toBe('AtomDoc');
  });

  it('lists tracked documents', async () => {
    const names = await listDocuments(await detectAtomModel());
    expect(names.length).toBeGreaterThan(10);
    expect(names.every((n) => typeof n === 'string')).toBe(true);
  });

  it('maps a real document to an Atom', async () => {
    const doc = await fetchDocument('atom-ligo-interface-for-sap');
    const atom = documentToAtom(doc);
    expect(atom.id).toBe('atom-ligo-interface-for-sap');
    expect(atom.title).toBeTruthy();
    expect(atom.answer.length).toBeGreaterThan(20);
    expect(atom.tags.length).toBeGreaterThan(0);
  });

  it('loads a knowledge set', async () => {
    const k = await loadFromSldb(12);
    expect(k.atoms.length).toBeGreaterThan(5);
    expect(k.atoms.every((a) => a.id && a.title)).toBe(true);
  });
});
