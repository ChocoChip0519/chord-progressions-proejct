import { NOTE_NAMES, ENHARMONIC } from './chordParser';

export type Mode = 'major' | 'minor';

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const DEGREE_TO_SEMITONE: Record<string, { semitone: number; quality: string }> = {
  // Major degrees
  'I':      { semitone: 0,  quality: '' },
  'ii':     { semitone: 2,  quality: 'm' },
  'iii':    { semitone: 4,  quality: 'm' },
  'IV':     { semitone: 5,  quality: '' },
  'V':      { semitone: 7,  quality: '' },
  'vi':     { semitone: 9,  quality: 'm' },
  'vii°':   { semitone: 11, quality: 'dim' },
  'Imaj7':  { semitone: 0,  quality: 'maj7' },
  'vim7':   { semitone: 9,  quality: 'm7' },
  'IVmaj7': { semitone: 5,  quality: 'maj7' },
  'V7':     { semitone: 7,  quality: '7' },
  'iim7':   { semitone: 2,  quality: 'm7' },
  // Minor degrees
  'i':      { semitone: 0,  quality: 'm' },
  'ii°':    { semitone: 2,  quality: 'dim' },
  'III':    { semitone: 3,  quality: '' },
  'iv':     { semitone: 5,  quality: 'm' },
  'v':      { semitone: 7,  quality: 'm' },
  'VI':     { semitone: 8,  quality: '' },
  'VII':    { semitone: 10, quality: '' },
  // Shared
  'IIImaj7':{ semitone: 3,  quality: 'maj7' },
  'VImaj7': { semitone: 8,  quality: 'maj7' },
};

export function degreeToChord(degree: string, tonicMidi: number, _mode: Mode): string | null {
  const info = DEGREE_TO_SEMITONE[degree];
  if (!info) return null;
  const rootPc = (tonicMidi % 12 + info.semitone) % 12;
  return NOTE_NAMES[rootPc] + info.quality;
}

export function degreeToVariants(degree: string, tonicMidi: number, mode: Mode): string[] {
  const base = degreeToChord(degree, tonicMidi, mode);
  if (!base) return [];

  const root = base.replace(/m7|maj7|m|7|dim|aug|sus[24]|add9/, '');
  const variants: string[] = [base];

  if (degree === 'I' || degree === 'i') {
    variants.push(root + 'maj7', root + 'add9');
  }
  if (degree === 'IV' || degree === 'iv') {
    variants.push(root + 'maj7');
  }
  if (degree === 'V') {
    variants.push(root + '7', root + 'sus4');
  }
  if (degree === 'vi' || degree === 'VI') {
    variants.push(root + 'm7');
  }

  return [...new Set(variants)];
}

export function chordToDegree(chordName: string, tonicMidi: number, mode: Mode): string | null {
  const cleanName = chordName.trim();
  const match = cleanName.match(/^([A-G][b#]?)(.*)/);
  if (!match) return null;

  const rootName = ENHARMONIC[match[1]] ?? match[1];
  const quality = match[2] ?? '';
  const tonicPc = tonicMidi % 12;
  const rootPc = NOTE_NAMES.indexOf(rootName);
  if (rootPc === -1) return null;

  const semitone = (rootPc - tonicPc + 12) % 12;
  const intervals = mode === 'major' ? MAJOR_INTERVALS : MINOR_INTERVALS;
  const degreeIdx = intervals.indexOf(semitone);

  if (degreeIdx === -1) {
    for (const [deg, info] of Object.entries(DEGREE_TO_SEMITONE)) {
      if (info.semitone === semitone && info.quality === quality) return deg;
    }
    return null;
  }

  const majorDegrees = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const minorDegrees = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
  const baseDegree = mode === 'major' ? majorDegrees[degreeIdx] : minorDegrees[degreeIdx];

  if (quality === 'maj7') {
    if (semitone === 0) return 'Imaj7';
    if (semitone === 5) return 'IVmaj7';
    if (semitone === 3) return 'IIImaj7';
    if (semitone === 8) return 'VImaj7';
  }
  if (quality === 'm7') {
    if (semitone === 9 && mode === 'major') return 'vim7';
    if (semitone === 2) return 'iim7';
  }
  if (quality === '7' && semitone === 7) return 'V7';

  return baseDegree;
}

export function detectMode(firstChord: string): { mode: Mode; tonicMidi: number } {
  const match = firstChord.trim().match(/^([A-G][b#]?)(.*)/);
  if (!match) return { mode: 'major', tonicMidi: 60 };

  const rootName = ENHARMONIC[match[1]] ?? match[1];
  const quality = match[2] ?? '';
  const rootPc = NOTE_NAMES.indexOf(rootName);
  const tonicMidi = rootPc !== -1 ? rootPc + 60 : 60;

  const isMinor = quality.startsWith('m') && !quality.startsWith('maj');
  return { mode: isMinor ? 'minor' : 'major', tonicMidi };
}
