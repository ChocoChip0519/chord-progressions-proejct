export const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export const ENHARMONIC: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
};

export interface ParsedChord {
  root: string;
  quality: string;
  notes: number[];
  name: string;
}

export const INTERVALS: Record<string, number[]> = {
  '':      [0, 4, 7],
  'm':     [0, 3, 7],
  'maj7':  [0, 4, 7, 11],
  'm7':    [0, 3, 7, 10],
  '7':     [0, 4, 7, 10],
  'dim':   [0, 3, 6],
  'aug':   [0, 4, 8],
  'sus2':  [0, 2, 7],
  'sus4':  [0, 5, 7],
  'add9':  [0, 4, 7, 14],
  'm9':    [0, 3, 7, 10, 14],
  'maj9':  [0, 4, 7, 11, 14],
  '9':     [0, 4, 7, 10, 14],
};

export const WHITE_MIDI = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83];
export const BLACK_DEFS: Array<{ midi: number; leftOffset: number }> = [
  { midi: 61, leftOffset: 1 },
  { midi: 63, leftOffset: 2 },
  { midi: 66, leftOffset: 4 },
  { midi: 68, leftOffset: 5 },
  { midi: 70, leftOffset: 6 },
  { midi: 73, leftOffset: 8 },
  { midi: 75, leftOffset: 9 },
  { midi: 78, leftOffset: 11 },
  { midi: 80, leftOffset: 12 },
  { midi: 82, leftOffset: 13 },
];

export const KEY_TO_MIDI: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64,
  f: 65, t: 66, g: 67, y: 68, h: 69,
  u: 70, j: 71, k: 72,
};

export function noteIndex(name: string): number {
  const normalized = ENHARMONIC[name] ?? name;
  return NOTE_NAMES.indexOf(normalized);
}

export function midiToName(midi: number): string {
  return NOTE_NAMES[midi % 12];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function parseChord(chordName: string): ParsedChord | null {
  if (!chordName) return null;

  const match = chordName.match(/^([A-G][b#]?)(.*)/);
  if (!match) return null;

  const rootName = match[1];
  const quality = match[2] ?? '';

  const rootNote = ENHARMONIC[rootName] ?? rootName;
  const rootIdx = NOTE_NAMES.indexOf(rootNote);
  if (rootIdx === -1) return null;

  const intervals = INTERVALS[quality] ?? INTERVALS[''];
  const rootMidi = rootIdx + 60;
  const notes = intervals.map((i) => rootMidi + i);

  return { root: rootNote, quality, notes, name: chordName };
}

export function detectChordFromMidi(midiNotes: number[]): string | null {
  if (midiNotes.length < 2) return null;

  const pitchClasses = [...new Set(midiNotes.map((m) => m % 12))].sort((a, b) => a - b);

  for (const [quality, intervals] of Object.entries(INTERVALS)) {
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      const expected = intervals.map((i) => (rootPc + i) % 12).sort((a, b) => a - b);
      if (
        expected.length === pitchClasses.length &&
        expected.every((pc, i) => pc === pitchClasses[i])
      ) {
        return NOTE_NAMES[rootPc] + quality;
      }
    }
  }
  return null;
}
